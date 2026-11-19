using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayTaksi.Api.Models;

namespace PayTaksi.Api.Controllers;

[ApiController]
[Route("api")]
public class RoleDemoController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    public RoleDemoController(UserManager<ApplicationUser> users) => _users = users;

    [Authorize(Roles = AppRoles.Admin)]
    [HttpGet("admin/users")]
    public async Task<IActionResult> Users()
    {
        var list = new List<object>();
        foreach (var u in await _users.Users.ToListAsync())
            list.Add(new { u.Id, u.Email, u.FullName, roles = await _users.GetRolesAsync(u) });
        return Ok(list);
    }

    [Authorize(Roles = AppRoles.Taksici)]
    [HttpGet("taksici/panel")]
    public IActionResult TaksiciPanel() => Ok("Taksici paneline hoş geldiniz.");

    [Authorize(Roles = AppRoles.Yolcu)]
    [HttpGet("yolcu/panel")]
    public IActionResult YolcuPanel() => Ok("Yolcu paneline hoş geldiniz.");
}
