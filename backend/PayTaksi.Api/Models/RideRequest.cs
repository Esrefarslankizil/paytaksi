namespace PayTaksi.Api.Models;

public class RideRequest
{
    public int Id { get; set; }
    public string PickupAddress { get; set; } = string.Empty;
    public double? PickupLat { get; set; }
    public double? PickupLng { get; set; }
    public string DestinationAddress { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string PaymentType { get; set; } = "Nakit";
    public int? AssignedDriverId { get; set; }
    public Driver? AssignedDriver { get; set; }
    public string Status { get; set; } = "Bekliyor";
    public bool WhatsAppSent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
