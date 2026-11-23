using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayTaksi.Api.Data;
using PayTaksi.Api.Models;

namespace PayTaksi.Api.Controllers;

public record TrackEventDto(string EventType);

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private static readonly HashSet<string> AllowedEvents = new(StringComparer.OrdinalIgnoreCase)
    {
        "page_view",
        "location_select",
        "call_click",
        "payment_open",
        "wallet_click",
        "online_pay_click",
        "cash_click",
        "ride_completed",
        "driver_apply"
    };

    private readonly AppDbContext _db;
    public AnalyticsController(AppDbContext db) => _db = db;

    /// <summary>Türkiye saati (UTC+3) döner; sunucu UTC çalışsa bile gün/ay kayması yaşanmaz.</summary>
    private static DateTime TurkeyNow() => DateTime.UtcNow.AddHours(3);

    [HttpPost("event")]
    public async Task<IActionResult> Track(TrackEventDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.EventType))
            return BadRequest(new { error = "EventType gerekli." });

        var ev = dto.EventType.Trim().ToLowerInvariant();
        if (!AllowedEvents.Contains(ev))
            return BadRequest(new { error = $"Geçersiz olay tipi: {ev}" });

        _db.AnalyticsEvents.Add(new AnalyticsEvent
        {
            EventType = ev,
            CreatedAt = TurkeyNow()
        });
        await _db.SaveChangesAsync();
        return Ok(new { tracked = ev });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] int year, [FromQuery] int month)
    {
        var now = TurkeyNow();
        if (year < 2020) year = now.Year;
        if (month < 1 || month > 12) month = now.Month;

        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1);
        var daysInMonth = DateTime.DaysInMonth(year, month);

        // Tek SQL sorgusu ile gün + eventType bazında grupla (belleğe tüm satırları çekmez, çok hızlıdır)
        var groupedEvents = await _db.AnalyticsEvents
            .AsNoTracking()
            .Where(e => e.CreatedAt >= start && e.CreatedAt < end)
            .GroupBy(e => new { Day = e.CreatedAt.Day, e.EventType })
            .Select(g => new { g.Key.Day, g.Key.EventType, Count = g.Count() })
            .ToListAsync();

        var groupedRides = await _db.RideRequests
            .AsNoTracking()
            .Where(r => r.CreatedAt >= start && r.CreatedAt < end)
            .GroupBy(r => r.CreatedAt.Day)
            .Select(g => new { Day = g.Key, Count = g.Count() })
            .ToListAsync();

        var eventMap = groupedEvents.ToDictionary(x => (x.Day, x.EventType), x => x.Count);
        var rideMap = groupedRides.ToDictionary(x => x.Day, x => x.Count);

        int GetCount(int day, string type) => eventMap.TryGetValue((day, type), out var c) ? c : 0;

        var daily = new List<object>(daysInMonth);
        for (int d = 1; d <= daysInMonth; d++)
        {
            var dayRides = rideMap.TryGetValue(d, out var rc) ? rc : 0;
            var onlineClick = GetCount(d, "wallet_click") + GetCount(d, "online_pay_click");
            daily.Add(new
            {
                day = d,
                pageView = GetCount(d, "page_view"),
                locationSelect = GetCount(d, "location_select"),
                callClick = GetCount(d, "call_click"),
                paymentOpen = GetCount(d, "payment_open"),
                walletClick = onlineClick,
                cashClick = GetCount(d, "cash_click"),
                completed = Math.Max(GetCount(d, "ride_completed"), dayRides)
            });
        }

        return Ok(new
        {
            year,
            month,
            today = (year == now.Year && month == now.Month) ? now.Day : 0,
            daysInMonth,
            daily
        });
    }

    /// <summary>Sadece Admin: test/şişmiş analitik olay kayıtlarını temizler (gerçek RideRequests kayıtlarına dokunmaz).</summary>
    [HttpDelete("reset")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> ResetEvents()
    {
        var deleted = await _db.AnalyticsEvents.ExecuteDeleteAsync();
        return Ok(new { message = "Analitik olay kayıtları sıfırlandı.", deleted });
    }
}
