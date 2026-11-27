namespace PayTaksi.Api.Models;

public static class RideStatus
{
    public const string Scheduled = "Randevu Alındı";    // ileri tarihli randevu (20 dk kala sürücüye düşer)
    public const string Pending = "Onay Bekliyor";       // sürücüye iletildi, cevap bekleniyor
    public const string Active = "Yolculukta";           // sürücü kabul etti (müşteriye gidiyor / yolculukta)
    public const string Completed = "Tamamlandı";        // varış noktasına ulaşıldı -> kazanç yazılır
    public const string Cancelled = "İptal Edildi";      // müşteriye ulaşılamadı -> kazanç yazılmaz
    public const string NoService = "Hizmet Verilemedi"; // hiçbir sürücü kabul etmedi
}

public class RideRequest
{
    public int Id { get; set; }
    public string PickupAddress { get; set; } = string.Empty;
    public double? PickupLat { get; set; }
    public double? PickupLng { get; set; }
    public string DestinationAddress { get; set; } = string.Empty;
    public double? DestinationLat { get; set; }
    public double? DestinationLng { get; set; }
    public decimal EstimatedPrice { get; set; } = 250;
    public string CustomerPhone { get; set; } = string.Empty;
    public string PaymentType { get; set; } = "Nakit";
    public int? AssignedDriverId { get; set; }
    public Driver? AssignedDriver { get; set; }
    public string Status { get; set; } = "Bekliyor";
    public bool WhatsAppSent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    /// <summary>Müşteri takip sayfası için tahmin edilemez anahtar.</summary>
    public string TrackToken { get; set; } = Guid.NewGuid().ToString("N");
    /// <summary>Çağrıyı reddeden / cevap vermeyen sürücü id'leri (virgüllü).</summary>
    public string TriedDriverIds { get; set; } = string.Empty;
    /// <summary>Çağrının mevcut sürücüye iletildiği an (zaman aşımı için).</summary>
    public DateTime? DispatchedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    /// <summary>Sürücü alınış noktasına ulaşınca dolar (yolcu bindi).</summary>
    public DateTime? PickedUpAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? CancelReason { get; set; }
    public double? DriverLat { get; set; }
    public double? DriverLng { get; set; }
    public DateTime? DriverLocationAt { get; set; }

    /// <summary>Randevulu taksi için ileri tarih/saat (null ise hemen çağrı).</summary>
    public DateTime? ScheduledAt { get; set; }
    /// <summary>Paylaşımlı taksi mi?</summary>
    public bool IsShared { get; set; }
    /// <summary>Yolcu/koltuk sayısı (paylaşımlıda 1 veya 2).</summary>
    public int PassengerCount { get; set; } = 1;
    /// <summary>Aynı takside eşleşen paylaşımlı çağrıların ortak grup kimliği.</summary>
    public string? SharedGroupId { get; set; }
}
