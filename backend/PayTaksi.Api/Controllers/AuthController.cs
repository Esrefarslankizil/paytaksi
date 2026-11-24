using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PayTaksi.Api.Models;

namespace PayTaksi.Api.Controllers;

public record RegisterDto(string Email, string Password, string FullName, string? PhoneNumber, string Role);
public record LoginDto(string Email, string Password);
public record GoogleLoginDto(string? AccessToken, string? IdToken, string? Role);
public record UpdateProfileDto(string FullName, string? PhoneNumber);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly IConfiguration _config;

    public AuthController(UserManager<ApplicationUser> users, IConfiguration config)
    {
        _users = users;
        _config = config;
    }

    private string CreateToken(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName!),
            new(JwtRegisteredClaimNames.Email, user.Email!)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>CREATE: Sadece Yolcu olarak hesap oluşturur ve anında JWT döner (Taksici rolü sadece Admin tarafından atanır).</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var assignedRole = AppRoles.Yolcu;

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber
        };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(" ", result.Errors.Select(e => e.Description)) });

        await _users.AddToRoleAsync(user, assignedRole);
        var roles = await _users.GetRolesAsync(user);
        return Ok(new
        {
            message = "Kayıt başarılı.",
            token = CreateToken(user, roles),
            user = new { user.Id, user.Email, user.FullName, user.PhoneNumber, roles }
        });
    }

    /// <summary>LOGIN: E-posta ve şifreyle giriş yapıp JWT döner.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _users.FindByEmailAsync(dto.Email);
        if (user is null || !await _users.CheckPasswordAsync(user, dto.Password))
            return Unauthorized(new { error = "E-posta veya şifre hatalı." });

        var roles = await _users.GetRolesAsync(user);
        return Ok(new
        {
            token = CreateToken(user, roles),
            roles,
            user = new { user.Id, user.Email, user.FullName, user.PhoneNumber, roles }
        });
    }

    /// <summary>Google OAuth Client ID'yi frontend için döner.</summary>
    [HttpGet("google-config")]
    public IActionResult GoogleConfig()
    {
        var clientId = _config["Google:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId) || clientId.StartsWith("BURAYA_"))
            return Ok(new { clientId = "" });
        return Ok(new { clientId });
    }

    /// <summary>GOOGLE LOGIN: Google AccessToken veya IdToken doğrular, kullanıcı yoksa oluşturur ve JWT döner.</summary>
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin(GoogleLoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.AccessToken) && string.IsNullOrWhiteSpace(dto.IdToken))
            return BadRequest(new { error = "Google token gerekli." });

        var configuredClientId = _config["Google:ClientId"];
        var hasClientId = !string.IsNullOrWhiteSpace(configuredClientId) && !configuredClientId.StartsWith("BURAYA_");

        string? email = null;
        string? fullName = null;
        bool emailVerified = false;

        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };

        if (!string.IsNullOrWhiteSpace(dto.AccessToken))
        {
            // 1. Token audience doğrulaması (ClientId tanımlıysa)
            if (hasClientId)
            {
                var infoRes = await http.GetAsync($"https://oauth2.googleapis.com/tokeninfo?access_token={Uri.EscapeDataString(dto.AccessToken)}");
                if (!infoRes.IsSuccessStatusCode)
                    return Unauthorized(new { error = "Google oturumu doğrulanamadı." });
                using var infoDoc = JsonDocument.Parse(await infoRes.Content.ReadAsStringAsync());
                var aud = infoDoc.RootElement.TryGetProperty("aud", out var audEl) ? audEl.GetString() : null;
                if (!string.Equals(aud, configuredClientId, StringComparison.Ordinal))
                    return Unauthorized(new { error = "Geçersiz Google uygulama kimliği (Client ID)." });
            }

            // 2. Kullanıcı profilini çek
            using var req = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", dto.AccessToken);
            var userRes = await http.SendAsync(req);
            if (!userRes.IsSuccessStatusCode)
                return Unauthorized(new { error = "Google profil bilgileri alınamadı." });

            using var userDoc = JsonDocument.Parse(await userRes.Content.ReadAsStringAsync());
            var root = userDoc.RootElement;
            email = root.TryGetProperty("email", out var em) ? em.GetString() : null;
            fullName = root.TryGetProperty("name", out var nm) ? nm.GetString() : null;
            emailVerified = root.TryGetProperty("email_verified", out var ev) && (ev.ValueKind == JsonValueKind.True || ev.GetString() == "true");
        }
        else if (!string.IsNullOrWhiteSpace(dto.IdToken))
        {
            var res = await http.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(dto.IdToken)}");
            if (!res.IsSuccessStatusCode)
                return Unauthorized(new { error = "Google ID token doğrulanamadı." });

            using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
            var root = doc.RootElement;
            if (hasClientId)
            {
                var aud = root.TryGetProperty("aud", out var audEl) ? audEl.GetString() : null;
                if (!string.Equals(aud, configuredClientId, StringComparison.Ordinal))
                    return Unauthorized(new { error = "Geçersiz Google uygulama kimliği (Client ID)." });
            }
            email = root.TryGetProperty("email", out var em) ? em.GetString() : null;
            fullName = root.TryGetProperty("name", out var nm) ? nm.GetString() : null;
            emailVerified = root.TryGetProperty("email_verified", out var ev) && (ev.ValueKind == JsonValueKind.True || ev.GetString() == "true");
        }

        if (string.IsNullOrWhiteSpace(email) || !emailVerified)
            return Unauthorized(new { error = "Doğrulanmış bir Google e-posta adresi bulunamadı." });

        var user = await _users.FindByEmailAsync(email);
        if (user is null)
        {
            var targetRole = AppRoles.Yolcu;
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = string.IsNullOrWhiteSpace(fullName) ? email.Split('@')[0] : fullName
            };
            var createRes = await _users.CreateAsync(user);
            if (!createRes.Succeeded)
                return BadRequest(new { error = string.Join(" ", createRes.Errors.Select(e => e.Description)) });

            await _users.AddToRoleAsync(user, targetRole);
        }

        var roles = await _users.GetRolesAsync(user);
        return Ok(new
        {
            message = "Google ile giriş başarılı.",
            token = CreateToken(user, roles),
            roles,
            user = new { user.Id, user.Email, user.FullName, user.PhoneNumber, roles }
        });
    }

    /// <summary>READ: Giriş yapmış kullanıcının bilgilerini döner.</summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = id is null ? null : await _users.FindByIdAsync(id);
        if (user is null) return Unauthorized();
        var roles = await _users.GetRolesAsync(user);
        return Ok(new { user.Id, user.Email, user.FullName, user.PhoneNumber, roles });
    }

    /// <summary>UPDATE: Giriş yapmış kullanıcının profilini günceller.</summary>
    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(UpdateProfileDto dto)
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = id is null ? null : await _users.FindByIdAsync(id);
        if (user is null) return Unauthorized();

        user.FullName = dto.FullName;
        user.PhoneNumber = dto.PhoneNumber;
        var res = await _users.UpdateAsync(user);
        if (!res.Succeeded) return BadRequest(new { error = string.Join(" ", res.Errors.Select(e => e.Description)) });

        var roles = await _users.GetRolesAsync(user);
        return Ok(new { message = "Profil güncellendi.", user = new { user.Id, user.Email, user.FullName, user.PhoneNumber, roles } });
    }

    /// <summary>DELETE: Giriş yapmış kullanıcının kendi hesabını siler.</summary>
    [Authorize]
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = id is null ? null : await _users.FindByIdAsync(id);
        if (user is null) return Unauthorized();

        await _users.DeleteAsync(user);
        return Ok(new { message = "Hesabınız silindi." });
    }
}
