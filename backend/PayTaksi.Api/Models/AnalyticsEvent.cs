namespace PayTaksi.Api.Models;

public class AnalyticsEvent
{
    public int Id { get; set; }
    /// <summary>page_view | location_select | call_click | payment_open | wallet_click | cash_click | ride_completed</summary>
    public string EventType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
