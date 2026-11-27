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

        var actionLink = $"https://paytaksi.com.tr/yolculuk-tamamla?id={ride.Id}";
        var priceText = ride.EstimatedPrice > 0 ? $"{Math.Round(ride.EstimatedPrice)} TL" : "250 TL";
        var tags = new List<string>();
        if (ride.IsShared) tags.Add($"Paylaşımlı ({ride.PassengerCount} kişi)");
        if (ride.ScheduledAt.HasValue) tags.Add($"Randevu {ride.ScheduledAt.Value:dd.MM HH:mm}");
        var tagText = tags.Count > 0 ? " · " + string.Join(" · ", tags) : "";
        var cleanDest = System.Text.RegularExpressions.Regex.Replace(ride.DestinationAddress ?? "", @"\s*\(https?://[^)]+\)", "").Trim();

        var lines = new List<string>
        {
            $"🚖 *Yeni PayTaksi Çağrısı*{tagText}",
            $"📍 *Alış:* {ride.PickupAddress}",
            $"🏁 *Varış:* {cleanDest}",
            $"💰 *Ücret:* {priceText} ({ride.PaymentType})",
            $"👉 *Kabul / Reddet:* {actionLink}"
        };
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
                            new { type = "text", text = CleanTemplateParam(ride.PickupAddress) },
                            new { type = "text", text = CleanTemplateParam(cleanDest) },
                            new { type = "text", text = CleanTemplateParam("Kabul sonrası açılır") },
                            new { type = "text", text = CleanTemplateParam($"{priceText} ({ride.PaymentType}) | Onayla: {actionLink}") },
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

    public async Task SendNoServiceToCustomerAsync(string? customerPhone)
    {
        var to = NormalizePhone(customerPhone ?? "");
        if (to.Length < 10 || to.Length > 15) return; // geçerli bir telefon değil (ör. "Üye Hesabı")

        const string text = "Üzgünüz, şu an size hizmet veremiyoruz. Tüm sürücülerimiz meşgul ya da müsait değil. Lütfen birkaç dakika sonra tekrar deneyin. — PayTaksi";
        var phoneNumberId = _config["WhatsApp:PhoneNumberId"];
        var accessToken = _config["WhatsApp:AccessToken"];
        var apiVersion = _config["WhatsApp:ApiVersion"] ?? "v21.0";
        if (string.IsNullOrWhiteSpace(phoneNumberId) || string.IsNullOrWhiteSpace(accessToken) || accessToken.StartsWith("BURAYA_"))
        {
            _logger.LogInformation("[WhatsApp TEST MODU] Müşteriye ({Phone}): {Text}", to, text);
            return;
        }

        var url = $"https://graph.facebook.com/{apiVersion}/{phoneNumberId}/messages";
        async Task<(bool ok, string body)> Post(object payload)
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            using var res = await _http.SendAsync(req);
            return (res.IsSuccessStatusCode, await res.Content.ReadAsStringAsync());
        }

        try
        {
            // Önce onaylı şablon (müşteri bota hiç yazmamış olsa da teslim edilir)
            var tplName = _config["WhatsApp:NoServiceTemplateName"] ?? "hizmet_verilemiyor";
            var (ok, body) = await Post(new
            {
                messaging_product = "whatsapp",
                to,
                type = "template",
                template = new { name = tplName, language = new { code = _config["WhatsApp:TemplateLang"] ?? "tr" } }
            });
            if (ok) return;
            _logger.LogWarning("Müşteri şablon mesajı gönderilemedi, düz metin deneniyor: {Body}", body);
            var (ok2, body2) = await Post(new { messaging_product = "whatsapp", to, type = "text", text = new { body = text } });
            if (!ok2) _logger.LogWarning("Müşteri düz metin mesajı da gönderilemedi: {Body}", body2);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Müşteriye hizmet verilemiyor mesajı gönderilemedi.");
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
