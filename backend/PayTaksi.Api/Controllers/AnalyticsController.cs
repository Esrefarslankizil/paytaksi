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
    private readonly AppDbContext _db;
    public AnalyticsController(AppDbContext db) => _db = db;

    [HttpPost("event")]
    public async Task<IActionResult> Track(TrackEventDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.EventType)) return BadRequest();
        _db.AnalyticsEvents.Add(new AnalyticsEvent
        {
            EventType = dto.EventType.Trim().ToLowerInvariant(),
            CreatedAt = DateTime.Now
        });
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] int year, [FromQuery] int month)
    {
        var now = DateTime.Now;
        if (year < 2020) year = now.Year;
        if (month < 1 || month > 12) month = now.Month;

        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1);
        var daysInMonth = DateTime.DaysInMonth(year, month);

        var events = await _db.AnalyticsEvents
            .Where(e => e.CreatedAt >= start && e.CreatedAt < end)
            .ToListAsync();

        var rides = await _db.RideRequests
            .Where(r => r.CreatedAt >= start && r.CreatedAt < end)
            .ToListAsync();

        var daily = new List<object>();
        for (int d = 1; d <= daysInMonth; d++)
        {
            var dayEv = events.Where(e => e.CreatedAt.Day == d).ToList();
            var dayRides = rides.Count(r => r.CreatedAt.Day == d);
            int Count(string t) => dayEv.Count(e => e.EventType == t);

            daily.Add(new
            {
                day = d,
                pageView = Count("page_view"),
                locationSelect = Count("location_select"),
                callClick = Count("call_click"),
                paymentOpen = Count("payment_open"),
                walletClick = Count("wallet_click"),
                cashClick = Count("cash_click"),
                completed = Math.Max(Count("ride_completed"), dayRides)
            });
        }

        return Ok(new { year, month, daysInMonth, daily });
    }
}
