using PayTaksi.Api.Data;
using PayTaksi.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace PayTaksi.Api.Services;

/// <summary>Çağrı dağıtımı: sıralı (round-robin) sürücü seçimi, red/zaman aşımı yönlendirmesi, iptal ve tamamlama.</summary>
public class RideDispatchService
{
    private readonly AppDbContext _db;
    private readonly WhatsAppService _wa;

    public const int DriverResponseSeconds = 120;     // sürücü bu sürede cevap vermezse sıradakine geçer
    public const int PickupTimeoutMinutes = 40;       // kabul sonrası yolcuya ulaşılamazsa iptal
    public const double PickupRadiusMeters = 120;     // alınış noktasına bu kadar yaklaşınca yolcu bindi sayılır
    public const double DestinationRadiusMeters = 150; // varışa bu kadar yaklaşınca yolculuk otomatik tamamlanır

    public RideDispatchService(AppDbContext db, WhatsAppService wa)
    {
        _db = db;
        _wa = wa;
    }

    public static HashSet<int> TriedSet(RideRequest r) =>
        r.TriedDriverIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => int.TryParse(s, out var i) ? i : 0).Where(i => i > 0).ToHashSet();

    private static void MarkTried(RideRequest r, int? driverId)
    {
        if (driverId is null) return;
        var set = TriedSet(r);
        if (set.Add(driverId.Value)) r.TriedDriverIds = string.Join(',', set);
    }

    /// <summary>Sırası gelen sürücüyü seçer: aktif, meşgul olmayan, bu çağrıda denenmemiş, en uzun süredir çağrı almamış olan.</summary>
    private async Task<Driver?> PickNextAsync(RideRequest ride)
    {
        var now = DateTime.Now;
        var tried = TriedSet(ride);
        return (await _db.Drivers.ToListAsync())
            .Where(d => !tried.Contains(d.Id) && d.IsActiveAt(now))
            .OrderBy(d => d.LastDispatchedAt ?? DateTime.MinValue)
            .ThenBy(d => d.Id)
            .FirstOrDefault();
    }

    /// <summary>Çağrıyı sıradaki sürücüye gönderir; kimse yoksa müşteriye "hizmet veremiyoruz" mesajı atar.</summary>
    public async Task<(Driver? driver, WhatsAppSendResult? wa)> DispatchAsync(RideRequest ride)
    {
        var next = await PickNextAsync(ride);
        if (next is null)
        {
            await FailNoServiceAsync(ride);
            return (null, null);
        }

        var now = DateTime.Now;
        ride.AssignedDriverId = next.Id;
        ride.Status = RideStatus.Pending;
        ride.DispatchedAt = now;
        next.LastDispatchedAt = now;
        await _db.SaveChangesAsync();

        var wa = await _wa.SendRideRequestAsync(next, ride);
        ride.WhatsAppSent = wa.Sent;
        await _db.SaveChangesAsync();
        return (next, wa);
    }

    /// <summary>Sürücü reddetti veya cevap vermedi: sıradakine yönlendir.</summary>
    public async Task<(Driver? driver, WhatsAppSendResult? wa)> DeclineAndRedispatchAsync(RideRequest ride)
    {
        MarkTried(ride, ride.AssignedDriverId);
        return await DispatchAsync(ride);
    }

    public async Task FailNoServiceAsync(RideRequest ride)
    {
        ride.Status = RideStatus.NoService;
        ride.AssignedDriverId = null;
        ride.CompletedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        await _wa.SendNoServiceToCustomerAsync(ride.CustomerPhone);
    }

    public async Task CancelAsync(RideRequest ride, string reason)
    {
        ride.Status = RideStatus.Cancelled;
        ride.CancelReason = reason;
        ride.CompletedAt = DateTime.Now;
        if (ride.AssignedDriver is not null) ride.AssignedDriver.IsBusy = false;
        await _db.SaveChangesAsync();
    }

    public async Task CompleteAsync(RideRequest ride)
    {
        ride.Status = RideStatus.Completed;
        ride.CompletedAt = DateTime.Now;
        ride.PickedUpAt ??= ride.AcceptedAt ?? DateTime.Now;
        if (ride.AssignedDriver is not null) ride.AssignedDriver.IsBusy = false;
        await _db.SaveChangesAsync();
    }

    public static double DistanceMeters(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 6371000;
        double dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                   Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    /// <summary>Sürücü konumu geldiğinde: alınışa varınca yolcu bindi, varışa varınca otomatik tamamla.</summary>
    public async Task ApplyDriverLocationAsync(RideRequest ride, double lat, double lng)
    {
        ride.DriverLat = lat;
        ride.DriverLng = lng;
        ride.DriverLocationAt = DateTime.Now;

        if (ride.Status == RideStatus.Active)
        {
            if (ride.PickedUpAt is null && ride.PickupLat.HasValue && ride.PickupLng.HasValue &&
                DistanceMeters(lat, lng, ride.PickupLat.Value, ride.PickupLng.Value) <= PickupRadiusMeters)
            {
                ride.PickedUpAt = DateTime.Now;
            }
            else if (ride.PickedUpAt is not null && ride.DestinationLat.HasValue && ride.DestinationLng.HasValue &&
                     DistanceMeters(lat, lng, ride.DestinationLat.Value, ride.DestinationLng.Value) <= DestinationRadiusMeters)
            {
                await CompleteAsync(ride);
                return;
            }
        }
        await _db.SaveChangesAsync();
    }
}

/// <summary>Arka plan: cevap vermeyen sürücüyü atlar, yolcuya ulaşamayan yolculukları iptal eder.</summary>
public class RideWatchdogService : BackgroundService
{
    private readonly IServiceScopeFactory _scopes;
    private readonly ILogger<RideWatchdogService> _log;

    public RideWatchdogService(IServiceScopeFactory scopes, ILogger<RideWatchdogService> log)
    {
        _scopes = scopes;
        _log = log;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try { await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken); } catch { break; }
            try
            {
                using var scope = _scopes.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var dispatch = scope.ServiceProvider.GetRequiredService<RideDispatchService>();
                var now = DateTime.Now;

                var pending = await db.RideRequests.Include(r => r.AssignedDriver)
                    .Where(r => r.Status == RideStatus.Pending).ToListAsync(stoppingToken);
                foreach (var r in pending.Where(r => r.DispatchedAt.HasValue &&
                             (now - r.DispatchedAt.Value).TotalSeconds > RideDispatchService.DriverResponseSeconds))
                    await dispatch.DeclineAndRedispatchAsync(r);

                var active = await db.RideRequests.Include(r => r.AssignedDriver)
                    .Where(r => r.Status == RideStatus.Active && r.PickedUpAt == null).ToListAsync(stoppingToken);
                foreach (var r in active.Where(r => r.AcceptedAt.HasValue &&
                             (now - r.AcceptedAt.Value).TotalMinutes > RideDispatchService.PickupTimeoutMinutes))
                    await dispatch.CancelAsync(r, "Müşteriye ulaşılamadı (süre doldu)");
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Ride watchdog hatası");
            }
        }
    }
}
