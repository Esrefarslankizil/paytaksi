using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using PayTaksi.Api.Models;

namespace PayTaksi.Api.Services;

public record WhatsAppSendResult(bool Sent, bool Simulated, string MessagePreview, string? Error = null);

public class WhatsAppService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<WhatsAppService> _logger;

    public WhatsAppService(HttpClient http, IConfiguration config, ILogger<WhatsAppService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public async Task<WhatsAppSendResult> SendRideRequestAsync(Driver driver, RideRequest ride)
    {
        var mapLink = ride.PickupLat.HasValue && ride.PickupLng.HasValue
            ? $"https://maps.google.com/?q={ride.PickupLat.Value.ToString(CultureInfo.InvariantCulture)},{ride.PickupLng.Value.ToString(CultureInfo.InvariantCulture)}"
            : null;

        var lines = new List<string>
        {
            "🚖 *Yeni PayTaksi Çağrısı*",
            $"📍 *Alış:* {ride.PickupAddress}",
        };
        if (mapLink is not null) lines.Add($"🗺️ *Konum:* {mapLink}");
        lines.Add($"🏁 *Varış:* {ride.DestinationAddress}");
        lines.Add($"📞 *Müşteri:* {ride.CustomerPhone}");
        lines.Add($"💳 *Ödeme:* {ride.PaymentType}");
        var bodyText = string.Join("\n", lines);

        var phoneNumberId = _config["WhatsApp:PhoneNumberId"];
        var accessToken = _config["WhatsApp:AccessToken"];
        var apiVersion = _config["WhatsApp:ApiVersion"] ?? "v21.0";

        // Meta anahtarları henüz girilmediyse test modunda loglayıp dön
        if (string.IsNullOrWhiteSpace(phoneNumberId) ||
            string.IsNullOrWhiteSpace(accessToken) ||
            accessToken.StartsWith("BURAYA_"))
        {
            _logger.LogInformation("[WhatsApp TEST MODU] -> {Driver} ({Phone}):\n{Body}", driver.FullName, driver.Phone, bodyText);
            return new WhatsAppSendResult(false, true, bodyText);
        }

        var url = $"https://graph.facebook.com/{apiVersion}/{phoneNumberId}/messages";
        static string CleanTemplateParam(string? s) =>
            string.IsNullOrWhiteSpace(s)
                ? "-"
                : System.Text.RegularExpressions.Regex.Replace(s, @"[\r\n\t]+", " ").Replace("    ", " ").Trim();

        var pickupWithMap = CleanTemplateParam(mapLink is not null ? $"{ride.PickupAddress} ({mapLink})" : ride.PickupAddress);
        var templateName = _config["WhatsApp:TemplateName"] ?? "yeni_taksi_cagrisi";
        var templateLang = _config["WhatsApp:TemplateLang"] ?? "tr";

        // Resmi Utility şablonu: sürücü son 24 saatte mesaj atmamış olsa bile %100 teslim edilir
        var payload = new
        {
            messaging_product = "whatsapp",
            to = NormalizePhone(driver.Phone),
            type = "template",
            template = new
            {
                name = templateName,
                language = new { code = templateLang },
                components = new object[]
                {
                    new
                    {
                        type = "body",
                        parameters = new object[]
                        {
                            new { type = "text", text = pickupWithMap },
                            new { type = "text", text = CleanTemplateParam(ride.DestinationAddress) },
                            new { type = "text", text = CleanTemplateParam(ride.CustomerPhone) },
                            new { type = "text", text = CleanTemplateParam(ride.PaymentType) },
                        }
                    }
                }
            }
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        try
        {
            using var res = await _http.SendAsync(req);
            var resText = await res.Content.ReadAsStringAsync();
            if (!res.IsSuccessStatusCode)
            {
                // Şablon henüz Meta onayındaysa (132001) doğrudan metin mesajıyla yedek gönderim yap
                if (resText.Contains("132001"))
                {
                    var textPayload = new
                    {
                        messaging_product = "whatsapp",
                        to = NormalizePhone(driver.Phone),
                        type = "text",
                        text = new { preview_url = true, body = bodyText }
                    };
                    using var req2 = new HttpRequestMessage(HttpMethod.Post, url);
                    req2.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    req2.Content = new StringContent(JsonSerializer.Serialize(textPayload), Encoding.UTF8, "application/json");
                    using var res2 = await _http.SendAsync(req2);
                    var resText2 = await res2.Content.ReadAsStringAsync();
                    if (res2.IsSuccessStatusCode) return new WhatsAppSendResult(true, false, bodyText);
                    return new WhatsAppSendResult(false, false, bodyText, resText2);
                }
                _logger.LogWarning("WhatsApp API hatası ({Status}): {Body}", res.StatusCode, resText);
                return new WhatsAppSendResult(false, false, bodyText, resText);
            }
            return new WhatsAppSendResult(true, false, bodyText);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "WhatsApp API isteği başarısız.");
            return new WhatsAppSendResult(false, false, bodyText, ex.Message);
        }
    }

    public static string NormalizePhone(string raw)
    {
        var digits = new string(raw.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("0") && digits.Length == 11) return "9" + digits;
        if (digits.Length == 10 && digits.StartsWith("5")) return "90" + digits;
        return digits;
    }
}
