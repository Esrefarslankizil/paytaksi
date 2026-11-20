using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayTaksi.Api.Models;

namespace PayTaksi.Api.Controllers;

public record AdminCreateUserDto(string Email, string Password, string FullName, string? PhoneNumber, string Role);
public record AdminUpdateUserDto(string FullName, string? PhoneNumber, string Role);

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.Admin)]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    public UsersController(UserManager<ApplicationUser> users) => _users = users;

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var result = new List<object>();
        foreach (var u in await _users.Users.OrderBy(u => u.Email).ToListAsync())
        {
            result.Add(new { u.Id, u.Email, u.FullName, u.PhoneNumber, roles = await _users.GetRolesAsync(u) });
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(AdminCreateUserDto dto)
    {
        if (!AppRoles.All.Contains(dto.Role))
            return BadRequest(new { error = "Geçersiz rol." });

        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, FullName = dto.FullName, PhoneNumber = dto.PhoneNumber };
        var res = await _users.CreateAsync(user, dto.Password);
        if (!res.Succeeded) return BadRequest(new { error = string.Join(" ", res.Errors.Select(e => e.Description)) });

        await _users.AddToRoleAsync(user, dto.Role);
        return Ok(new { user.Id, user.Email, user.FullName, user.PhoneNumber, roles = new[] { dto.Role } });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, AdminUpdateUserDto dto)
    {
        var user = await _users.FindByIdAsync(id);
        if (user is null) return NotFound();
        if (!AppRoles.All.Contains(dto.Role))
            return BadRequest(new { error = "Geçersiz rol." });

        user.FullName = dto.FullName;
        user.PhoneNumber = dto.PhoneNumber;
        await _users.UpdateAsync(user);

        var currentRoles = await _users.GetRolesAsync(user);
        if (currentRoles.Any()) await _users.RemoveFromRolesAsync(user, currentRoles);
        await _users.AddToRoleAsync(user, dto.Role);

        return Ok(new { user.Id, user.Email, user.FullName, user.PhoneNumber, roles = new[] { dto.Role } });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var user = await _users.FindByIdAsync(id);
        if (user is null) return NotFound();
        await _users.DeleteAsync(user);
        return Ok(new { message = "Kullanıcı silindi." });
    }
}
