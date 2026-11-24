using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayTaksi.Api.Data;
using PayTaksi.Api.Models;

namespace PayTaksi.Api.Controllers;

public record CreateDriverDto(string FullName, string Phone, string Plate, string Station, string ShiftStart, string ShiftEnd);
public record UpdateScheduleDto(string ShiftStart, string ShiftEnd, bool? IsEnabled);

[ApiController]
[Route("api/[controller]")]
public class DriversController : ControllerBase
{
    private readonly AppDbContext _db;
    public DriversController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var now = DateTime.Now;
        var drivers = await _db.Drivers.OrderBy(d => d.Id).ToListAsync();
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
        d.PausedUntil = null;
        d.IsBusy = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Sürücü tekrar aktif edildi.", isActiveNow = d.IsActiveAt(DateTime.Now) });
    }
}
