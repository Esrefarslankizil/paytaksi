using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
    string PaymentType = "Nakit",
    double? DestinationLat = null,
    double? DestinationLng = null,
    decimal? EstimatedPrice = null,
    DateTime? ScheduledAt = null,
    bool IsShared = false,
    int PassengerCount = 1
);

public record DriverLocationDto(double Lat, double Lng);
public record CancelRideDto(string? Reason);

[ApiController]
[Route("api/[controller]")]
public class RidesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly RideDispatchService _dispatch;
    private readonly UserManager<ApplicationUser> _users;

    public RidesController(AppDbContext db, RideDispatchService dispatch, UserManager<ApplicationUser> users)
    {
        _db = db;
        _dispatch = dispatch;
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

    private async Task<ApplicationUser?> CurrentUserAsync()
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return string.IsNullOrEmpty(uid) ? null : await _users.FindByIdAsync(uid);
    }

    private static bool UserOwnsDriver(ApplicationUser? u, Driver? d)
    {
        if (u is null || d is null) return false;
        return PhonesMatch(u.PhoneNumber, d.Phone) ||
               string.Equals(u.FullName?.Trim(), d.FullName?.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>Admin her çağrıya, sürücü sadece kendisine atanmış çağrıya erişir.</summary>
    private async Task<bool> CanAccessAsync(RideRequest ride)
    {
        if (User.IsInRole(AppRoles.Admin)) return true;
        return UserOwnsDriver(await CurrentUserAsync(), ride.AssignedDriver);
    }

    private Task<RideRequest?> LoadAsync(int id) =>
        _db.RideRequests.Include(r => r.AssignedDriver).FirstOrDefaultAsync(r => r.Id == id);

    [HttpGet]
    [Authorize(Roles = $"{AppRoles.Taksici},{AppRoles.Admin}")]
    public async Task<IActionResult> List()
    {
        var list = await _db.RideRequests
            .Include(r => r.AssignedDriver)
            .OrderByDescending(r => r.CreatedAt)
            .Take(200)
            .ToListAsync();

        if (!User.IsInRole(AppRoles.Admin))
        {
            var u = await CurrentUserAsync();
            list = list.Where(r => UserOwnsDriver(u, r.AssignedDriver)).ToList();
        }

        return Ok(list.Select(r => new
        {
            r.Id,
            r.PickupAddress,
            r.DestinationAddress,
            r.CustomerPhone,
            r.PaymentType,
            r.Status,
            r.EstimatedPrice,
            r.WhatsAppSent,
            r.CreatedAt,
            r.CompletedAt,
            r.CancelReason,
            r.ScheduledAt,
            r.IsShared,
            r.PassengerCount,
            r.SharedGroupId,
            driver = r.AssignedDriver is null ? null : new { r.AssignedDriver.Id, r.AssignedDriver.FullName, r.AssignedDriver.Plate }
        }));
    }

    /// <summary>Müşteri taksi çağırır: sırası gelen sürücüye (round-robin) iletilir.</summary>
    [HttpPost("request")]
    public async Task<IActionResult> RequestRide(CreateRideDto dto)
    {
        if (dto.PickupLat.HasValue && dto.PickupLng.HasValue)
        {
            var inElazig = dto.PickupLat.Value >= 38.20 && dto.PickupLat.Value <= 39.20 &&
                           dto.PickupLng.Value >= 38.45 && dto.PickupLng.Value <= 40.30;
            if (!inElazig)
            {
                return BadRequest(new
                {
                    error = "Şu an yalnızca Elazığ il sınırları içerisinde hizmet veriyoruz. Şehrinizde henüz hizmet veremiyoruz, ancak en yakın zamanda hizmet vermeye başlayacağız!"
                });
            }
        }

        var isFutureSchedule = dto.ScheduledAt.HasValue && dto.ScheduledAt.Value > DateTime.Now.AddMinutes(RideDispatchService.ScheduledLeadMinutes);
        var ride = new RideRequest
        {
            PickupAddress = dto.PickupAddress,
            PickupLat = dto.PickupLat,
            PickupLng = dto.PickupLng,
            DestinationAddress = dto.DestinationAddress,
            DestinationLat = dto.DestinationLat,
            DestinationLng = dto.DestinationLng,
            EstimatedPrice = dto.EstimatedPrice is > 0 ? dto.EstimatedPrice.Value : 250,
            CustomerPhone = dto.CustomerPhone,
            PaymentType = dto.PaymentType,
            ScheduledAt = dto.ScheduledAt,
            IsShared = dto.IsShared,
            PassengerCount = Math.Clamp(dto.PassengerCount, 1, 3),
            Status = isFutureSchedule ? RideStatus.Scheduled : RideStatus.Pending,
            CreatedAt = DateTime.Now,
        };
        _db.RideRequests.Add(ride);
        await _db.SaveChangesAsync();

        Driver? driver = null;
        WhatsAppSendResult? wa = null;
        if (!isFutureSchedule)
        {
            var matched = await _dispatch.TryMatchSharedAsync(ride);
            (driver, wa) = matched ?? await _dispatch.DispatchAsync(ride);
        }

        return Ok(new
        {
            rideId = ride.Id,
            trackToken = ride.TrackToken,
            status = ride.Status,
            scheduledAt = ride.ScheduledAt,
            isShared = ride.IsShared,
            sharedGroupId = ride.SharedGroupId,
            trackUrl = $"/takip?id={ride.Id}&t={ride.TrackToken}",
            actionUrl = $"https://paytaksi.com.tr/yolculuk-tamamla?id={ride.Id}",
            driver = driver is null ? null : new { driver.FullName, driver.Plate, driver.Station, driver.IsBusy },
            whatsapp = wa
        });
    }

    /// <summary>Müşteri canlı takip: durum, sürücü konumu, rota. Telefon numaraları dönmez.</summary>
    [HttpGet("{id:int}/track")]
    public async Task<IActionResult> Track(int id, [FromQuery(Name = "t")] string? token)
    {
        var ride = await LoadAsync(id);
        if (ride is null || string.IsNullOrEmpty(token) || ride.TrackToken != token)
            return NotFound(new { error = "Yolculuk bulunamadı." });

        var showDriver = ride.Status is RideStatus.Active or RideStatus.Completed;
        return Ok(new
        {
            ride.Id,
            ride.Status,
            ride.PickupAddress,
            ride.PickupLat,
            ride.PickupLng,
            ride.DestinationAddress,
            ride.DestinationLat,
            ride.DestinationLng,
            ride.EstimatedPrice,
            ride.PaymentType,
            pickedUp = ride.PickedUpAt.HasValue,
            ride.CancelReason,
            driverLat = showDriver ? ride.DriverLat : null,
            driverLng = showDriver ? ride.DriverLng : null,
            ride.DriverLocationAt,
            driver = showDriver && ride.AssignedDriver is not null
                ? new { ride.AssignedDriver.FullName, ride.AssignedDriver.Plate }
                : null
        });
    }

    /// <summary>Sürücü çağrı detayı. Müşteri numarası sadece kabul sonrası görünür.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Taksici},{AppRoles.Admin}")]
    public async Task<IActionResult> GetById(int id)
    {
        var ride = await LoadAsync(id);
        if (ride is null) return NotFound(new { error = "Yolculuk bulunamadı." });
        if (!await CanAccessAsync(ride))
            return StatusCode(403, new { error = "Bu çağrı size atanmış değil." });

        var showPhone = ride.Status is RideStatus.Active or RideStatus.Completed;
        return Ok(new
        {
            ride.Id,
            ride.PickupAddress,
            ride.PickupLat,
            ride.PickupLng,
            ride.DestinationAddress,
            ride.DestinationLat,
            ride.DestinationLng,
            ride.EstimatedPrice,
            customerPhone = showPhone ? ride.CustomerPhone : null,
            ride.PaymentType,
            ride.Status,
            ride.CreatedAt,
            ride.DispatchedAt,
            ride.ScheduledAt,
            ride.IsShared,
            ride.PassengerCount,
            ride.SharedGroupId,
            pickedUp = ride.PickedUpAt.HasValue,
            ride.CancelReason,
            driver = ride.AssignedDriver is null ? null : new
            {
                ride.AssignedDriver.Id,
                ride.AssignedDriver.FullName,
                ride.AssignedDriver.Plate,
                ride.AssignedDriver.IsBusy
            }
        });
    }

    [HttpPost("{id:int}/accept")]
    [Authorize(Roles = $"{AppRoles.Taksici},{AppRoles.Admin}")]
    public async Task<IActionResult> AcceptRide(int id)
    {
        var ride = await LoadAsync(id);
        if (ride is null) return NotFound(new { error = "Yolculuk bulunamadı." });
        if (!await CanAccessAsync(ride)) return StatusCode(403, new { error = "Bu çağrı size atanmış değil." });
        if (ride.Status != RideStatus.Pending)
            return BadRequest(new { error = "Bu çağrı artık kabul edilemez (başka sürücüye aktarıldı, iptal veya tamamlandı)." });

        ride.Status = RideStatus.Active;
        ride.AcceptedAt = DateTime.Now;
        if (ride.AssignedDriver is not null) ride.AssignedDriver.IsBusy = true;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            rideId = ride.Id,
            status = ride.Status,
            customerPhone = ride.CustomerPhone,
            message = "Çağrı kabul edildi! Müşteriyi arayıp yola çıkabilirsiniz."
        });
    }

    [HttpPost("{id:int}/reject")]
    [Authorize(Roles = $"{AppRoles.Taksici},{AppRoles.Admin}")]
    public async Task<IActionResult> RejectRide(int id)
    {
        var ride = await LoadAsync(id);
        if (ride is null) return NotFound(new { error = "Yolculuk bulunamadı." });
        if (!await CanAccessAsync(ride)) return StatusCode(403, new { error = "Bu çağrı size atanmış değil." });
        if (ride.Status != RideStatus.Pending)
            return BadRequest(new { error = "Bu çağrı artık reddedilemez." });

        var (next, _) = await _dispatch.DeclineAndRedispatchAsync(ride);
        return Ok(new
        {
            rideId = ride.Id,
            status = "Reddedildi",
            reassignedTo = next?.FullName,
            message = next is not null
                ? "Çağrı reddedildi ve sıradaki sürücüye aktarıldı."
                : "Çağrı reddedildi. Başka müsait sürücü olmadığı için müşteriye bilgi verildi."
        });
    }

    /// <summary>Sürücü canlı konumunu gönderir; alınışa varınca "yolcu bindi", varışa varınca otomatik tamamlanır.</summary>
    [HttpPost("{id:int}/location")]
    [Authorize(Roles = $"{AppRoles.Taksici},{AppRoles.Admin}")]
    public async Task<IActionResult> UpdateLocation(int id, DriverLocationDto dto)
    {
        var ride = await LoadAsync(id);
        if (ride is null) return NotFound(new { error = "Yolculuk bulunamadı." });
        if (!await CanAccessAsync(ride)) return StatusCode(403, new { error = "Bu çağrı size atanmış değil." });
        if (ride.Status != RideStatus.Active)
            return Ok(new { status = ride.Status, pickedUp = ride.PickedUpAt.HasValue });

        await _dispatch.ApplyDriverLocationAsync(ride, dto.Lat, dto.Lng);
        return Ok(new { status = ride.Status, pickedUp = ride.PickedUpAt.HasValue });
    }

    /// <summary>Manuel tamamlama (otomatik tamamlanmadıysa). Kazanç yalnızca Tamamlandı durumunda yazılır.</summary>
    [HttpPost("{id:int}/complete")]
    [Authorize(Roles = $"{AppRoles.Taksici},{AppRoles.Admin}")]
    public async Task<IActionResult> CompleteRide(int id)
    {
        var ride = await LoadAsync(id);
        if (ride is null) return NotFound(new { error = "Yolculuk bulunamadı." });
        if (!await CanAccessAsync(ride)) return StatusCode(403, new { error = "Bu çağrı size atanmış değil." });
        if (ride.Status != RideStatus.Active)
            return BadRequest(new { error = "Yalnızca aktif yolculuk tamamlanabilir." });

        await _dispatch.CompleteAsync(ride);
        return Ok(new
        {
            rideId = ride.Id,
            status = ride.Status,
            message = "Yolculuk tamamlandı! Kazancınız hesabınıza yansıdı."
        });
    }

    /// <summary>Müşteriye ulaşılamadı / yolculuk yapılamadı: iptal edilir, kazanç yazılmaz.</summary>
    [HttpPost("{id:int}/cancel")]
    [Authorize(Roles = $"{AppRoles.Taksici},{AppRoles.Admin}")]
    public async Task<IActionResult> CancelRide(int id, CancelRideDto? dto)
    {
        var ride = await LoadAsync(id);
        if (ride is null) return NotFound(new { error = "Yolculuk bulunamadı." });
        if (!await CanAccessAsync(ride)) return StatusCode(403, new { error = "Bu çağrı size atanmış değil." });
        if (ride.Status != RideStatus.Active)
            return BadRequest(new { error = "Yalnızca aktif yolculuk iptal edilebilir." });

        await _dispatch.CancelAsync(ride, string.IsNullOrWhiteSpace(dto?.Reason) ? "Müşteriye ulaşılamadı" : dto!.Reason!);
        return Ok(new
        {
            rideId = ride.Id,
            status = ride.Status,
            message = "Yolculuk iptal edildi. Bu yolculuk için ücret yansımaz."
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
