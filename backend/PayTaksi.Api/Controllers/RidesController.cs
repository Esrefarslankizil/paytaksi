using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayTaksi.Api.Data;
using PayTaksi.Api.Models;
using PayTaksi.Api.Services;

namespace PayTaksi.Api.Controllers;

public record CreateRideDto(
    string PickupAddress,
    double? PickupLat,
    double? PickupLng,
    string DestinationAddress,
    string CustomerPhone,
    string PaymentType = "Nakit"
);

[ApiController]
[Route("api/[controller]")]
public class RidesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly WhatsAppService _wa;

    public RidesController(AppDbContext db, WhatsAppService wa)
    {
        _db = db;
        _wa = wa;
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var list = await _db.RideRequests
            .Include(r => r.AssignedDriver)
            .OrderByDescending(r => r.CreatedAt)
            .Take(50)
            .ToListAsync();
        return Ok(list.Select(r => new
        {
            r.Id,
            r.PickupAddress,
            r.DestinationAddress,
            r.CustomerPhone,
            r.PaymentType,
            r.Status,
            r.WhatsAppSent,
            r.CreatedAt,
            driver = r.AssignedDriver is null ? null : new { r.AssignedDriver.FullName, r.AssignedDriver.Plate }
        }));
    }

    /// <summary>Müşteri taksi çağırdığında aktif (vardiyadaki) sürücüyü bulur ve WhatsApp'tan bildirir.</summary>
    [HttpPost("request")]
    public async Task<IActionResult> RequestRide(CreateRideDto dto)
    {
        var now = DateTime.Now;
        var drivers = await _db.Drivers.ToListAsync();
        var activeDriver = drivers
            .Where(d => d.IsActiveAt(now))
            .OrderBy(d => d.LastDispatchedAt ?? DateTime.MinValue)
            .FirstOrDefault();

        var ride = new RideRequest
        {
            PickupAddress = dto.PickupAddress,
            PickupLat = dto.PickupLat,
            PickupLng = dto.PickupLng,
            DestinationAddress = dto.DestinationAddress,
            CustomerPhone = dto.CustomerPhone,
            PaymentType = dto.PaymentType,
            AssignedDriverId = activeDriver?.Id,
            Status = activeDriver is null ? "Aktif Sürücü Yok" : "Sürücüye İletildi",
            CreatedAt = now,
        };

        _db.RideRequests.Add(ride);
        if (activeDriver is not null) activeDriver.LastDispatchedAt = now;
        await _db.SaveChangesAsync();

        WhatsAppSendResult? waResult = null;
        if (activeDriver is not null)
        {
            waResult = await _wa.SendRideRequestAsync(activeDriver, ride);
            ride.WhatsAppSent = waResult.Sent;
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            rideId = ride.Id,
            status = ride.Status,
            driver = activeDriver is null ? null : new { activeDriver.FullName, activeDriver.Plate, activeDriver.Station },
            whatsapp = waResult
        });
    }

    /// <summary>Meta WhatsApp Webhook doğrulama (GET).</summary>
    [HttpGet("/api/whatsapp/webhook")]
    public IActionResult VerifyWebhook(
        [FromQuery(Name = "hub.mode")] string? mode,
        [FromQuery(Name = "hub.verify_token")] string? token,
        [FromQuery(Name = "hub.challenge")] string? challenge,
        [FromServices] IConfiguration config)
    {
        if (mode == "subscribe" && token == config["WhatsApp:VerifyToken"])
            return Ok(challenge);
        return Forbid();
    }

    /// <summary>Sürücü WhatsApp'tan "kapat" veya "aç" yazdığında vardiyasını günceller.</summary>
    [HttpPost("/api/whatsapp/webhook")]
    public async Task<IActionResult> ReceiveWebhook([FromBody] JsonElement body)
    {
        try
        {
            var msg = body.GetProperty("entry")[0].GetProperty("changes")[0].GetProperty("value").GetProperty("messages")[0];
            var from = msg.GetProperty("from").GetString() ?? "";
            var text = (msg.GetProperty("text").GetProperty("body").GetString() ?? "").Trim().ToLowerInvariant();
            var norm = WhatsAppService.NormalizePhone(from);

            var drivers = await _db.Drivers.ToListAsync();
            var driver = drivers.FirstOrDefault(d => WhatsAppService.NormalizePhone(d.Phone) == norm);
            if (driver is not null)
            {
                if (text.Contains("kapat") || text.Contains("izin"))
                    driver.PausedUntil = driver.NextShiftStartAfter(DateTime.Now);
                else if (text.Contains("aç") || text.Contains("ac") || text.Contains("başla") || text.Contains("basla"))
                    driver.PausedUntil = null;
                await _db.SaveChangesAsync();
            }
        }
        catch
        {
            // Durum bildirimleri (delivered/read) sessizce geçilir
        }
        return Ok();
    }
}
