namespace PayTaksi.Api.Models;

public class Driver
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    /// <summary>WhatsApp numarası, ülke koduyla bitişik (örn: 905551234567)</summary>
    public string Phone { get; set; } = string.Empty;
    public string Plate { get; set; } = string.Empty;
    public string Station { get; set; } = "Merkez";
    /// <summary>Günlük vardiya başlangıç saati (örn: 08:00)</summary>
    public TimeOnly ShiftStart { get; set; } = new(8, 0);
    /// <summary>Günlük vardiya bitiş saati (örn: 20:00)</summary>
    public TimeOnly ShiftEnd { get; set; } = new(20, 0);
    /// <summary>Sürücü "bugünlük kapat" derse ertesi günün vardiya başlangıcına ayarlanır.</summary>
    public DateTime? PausedUntil { get; set; }
    public bool IsEnabled { get; set; } = true;
    public DateTime? LastDispatchedAt { get; set; }

    public bool IsActiveAt(DateTime localNow)
    {
        if (!IsEnabled) return false;
        if (PausedUntil.HasValue && localNow < PausedUntil.Value) return false;

        var t = TimeOnly.FromDateTime(localNow);
        return ShiftStart <= ShiftEnd
            ? t >= ShiftStart && t <= ShiftEnd
            : t >= ShiftStart || t <= ShiftEnd; // gece vardiyası (örn. 20:00 - 08:00)
    }

    public DateTime NextShiftStartAfter(DateTime localNow)
    {
        var tomorrow = DateOnly.FromDateTime(localNow.AddDays(1));
        return tomorrow.ToDateTime(ShiftStart);
    }
}
