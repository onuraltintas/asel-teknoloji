using System.Text.Json.Serialization;

namespace AselTeknoloji.WebAPI.Services;

public class RecaptchaService
{
    private readonly IHttpClientFactory _factory;
    private readonly IConfiguration     _config;
    private readonly ILogger<RecaptchaService> _logger;

    public RecaptchaService(IHttpClientFactory factory, IConfiguration config, ILogger<RecaptchaService> logger)
    {
        _factory = factory;
        _config  = config;
        _logger  = logger;
    }

    public async Task<bool> VerifyAsync(string? token)
    {
        var secret = _config["Recaptcha:SecretKey"];
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(token))
            return true; // yapılandırılmamışsa atla

        try
        {
            var client = _factory.CreateClient();
            var resp   = await client.PostAsync(
                "https://www.google.com/recaptcha/api/siteverify",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["secret"]   = secret,
                    ["response"] = token
                }));

            if (!resp.IsSuccessStatusCode) return false;

            var result = await resp.Content.ReadFromJsonAsync<RecaptchaResponse>();
            return result?.Success == true && result.Score >= 0.5f;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "reCAPTCHA doğrulama hatası.");
            return true; // hata durumunda formu engelleme
        }
    }

    private sealed record RecaptchaResponse(
        bool    Success,
        float   Score,
        string? Action,
        [property: JsonPropertyName("error-codes")] string[]? ErrorCodes);
}
