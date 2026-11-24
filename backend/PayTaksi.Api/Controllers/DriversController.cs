using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayTaksi.Api.Data;
using PayTaksi.Api.Models;

namespace PayTaksi.Api.Controllers;

public record CreateDriverDto(string FullName, string Phone, string Plate, string Station, string ShiftStart, string ShiftEnd);
public record UpdateScheduleDto(string ShiftStart, string ShiftEnd, bool? IsEnabled);

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{AppRoles.Taksici},{AppRoles.Admin}")]
public class DriversController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _users;

    public DriversController(AppDbContext db, UserManager<ApplicationUser> users)
    {
        _db = db;
        _users = users;
    }

    private static string DigitsOnly(string? s) =>
        string.IsNullOrWhiteSpace(s) ? "" : new string(s.Where(char.IsDigit).ToArray());

    private static bool PhonesMatch(string? a, string? b)
    {
        var da = DigitsOnly(a);
        var db = DigitsOnly(b);
        if (da.Length < 10 || db.Length < 10) return false;
        return da[^10..] == db[^10..];
    }

    private async Task<bool> CanAccessDriverAsync(Driver d)
    {
        if (User.IsInRole(AppRoles.Admin)) return true;
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(uid)) return false;
        var u = await _users.FindByIdAsync(uid);
        if (u is null) return false;
        if (PhonesMatch(u.PhoneNumber, d.Phone)) return true;
        return string.Equals(u.FullName?.Trim(), d.FullName?.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var now = DateTime.Now;
        var drivers = await _db.Drivers.OrderBy(d => d.Id).ToListAsync();

        if (!User.IsInRole(AppRoles.Admin))
        {
            var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var u = string.IsNullOrEmpty(uid) ? null : await _users.FindByIdAsync(uid);
            drivers = u is null
                ? new List<Driver>()
                : drivers.Where(d =>
                    PhonesMatch(u.PhoneNumber, d.Phone) ||
                    string.Equals(u.FullName?.Trim(), d.FullName?.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return Ok(drivers.Select(d => new
        {
            d.Id,
            d.FullName,
            d.Phone,
            d.Plate,
            d.Station,
            shiftStart = d.ShiftStart.ToString("HH:mm"),
            shiftEnd = d.ShiftEnd.ToString("HH:mm"),
            d.PausedUntil,
            d.IsEnabled,
            d.IsBusy,
            isActiveNow = d.IsActiveAt(now),
            d.LastDispatchedAt
        }));
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Create(CreateDriverDto dto)
    {
        var driver = new Driver
        {
            FullName = dto.FullName,
            Phone = dto.Phone,
            Plate = dto.Plate,
            Station = dto.Station,
            ShiftStart = TimeOnly.Parse(dto.ShiftStart),
            ShiftEnd = TimeOnly.Parse(dto.ShiftEnd),
        };
        _db.Drivers.Add(driver);
        await _db.SaveChangesAsync();
        return Ok(driver);
    }

    [HttpPut("{id:int}/schedule")]
    public async Task<IActionResult> UpdateSchedule(int id, UpdateScheduleDto dto)
    {
        var d = await _db.Drivers.FindAsync(id);
        if (d is null) return NotFound();
        if (!await CanAccessDriverAsync(d)) return Forbid();
        d.ShiftStart = TimeOnly.Parse(dto.ShiftStart);
        d.ShiftEnd = TimeOnly.Parse(dto.ShiftEnd);
        if (dto.IsEnabled.HasValue) d.IsEnabled = dto.IsEnabled.Value;
        await _db.SaveChangesAsync();
        return Ok(new { d.Id, shiftStart = d.ShiftStart.ToString("HH:mm"), shiftEnd = d.ShiftEnd.ToString("HH:mm"), isActiveNow = d.IsActiveAt(DateTime.Now) });
    }

    /// <summary>Sürücüyü bugünlük kapatır; ertesi gün vardiya saatinde otomatik tekrar aktif olur.</summary>
    [HttpPost("{id:int}/pause-today")]
    public async Task<IActionResult> PauseToday(int id)
    {
        var d = await _db.Drivers.FindAsync(id);
        if (d is null) return NotFound();
        if (!await CanAccessDriverAsync(d)) return Forbid();
        d.PausedUntil = d.NextShiftStartAfter(DateTime.Now);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Sürücü bugünlük kapatıldı.", pausedUntil = d.PausedUntil });
    }

    /// <summary>Bugünlük kapatmayı ve meşgul durumunu kaldırır, vardiya saatindeyse hemen aktif eder.</summary>
    [HttpPost("{id:int}/resume")]
    public async Task<IActionResult> Resume(int id)
    {
        var d = await _db.Drivers.FindAsync(id);
        if (d is null) return NotFound();
        if (!await CanAccessDriverAsync(d)) return Forbid();
        d.PausedUntil = null;
        d.IsBusy = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Sürücü tekrar aktif edildi.", isActiveNow = d.IsActiveAt(DateTime.Now) });
    }
}
