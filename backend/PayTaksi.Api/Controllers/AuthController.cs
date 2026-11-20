using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PayTaksi.Api.Models;

namespace PayTaksi.Api.Controllers;

public record RegisterDto(string Email, string Password, string FullName, string? PhoneNumber, string Role);
public record LoginDto(string Email, string Password);
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

    /// <summary>CREATE: Yolcu veya Taksici olarak hesap oluşturur ve anında JWT döner.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (dto.Role != AppRoles.Yolcu && dto.Role != AppRoles.Taksici)
            return BadRequest(new { error = "Rol sadece 'Yolcu' veya 'Taksici' olabilir." });

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

        await _users.AddToRoleAsync(user, dto.Role);
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
