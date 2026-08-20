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

    public async Task<bool> VerifyAsync(string? token, string expectedAction)
    {
        var secret = _config["Recaptcha:SecretKey"];
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("reCAPTCHA secret veya token eksik; istek reddedildi.");
            return false;
        }

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

            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogWarning("reCAPTCHA Google yanıtı başarısız: HTTP {StatusCode}.", resp.StatusCode);
                return false;
            }

            var result = await resp.Content.ReadFromJsonAsync<RecaptchaResponse>();
            if (result is null)
            {
                _logger.LogWarning("reCAPTCHA Google yanıtı boş döndü.");
                return false;
            }

            if (!result.Success)
            {
                _logger.LogWarning(
                    "reCAPTCHA reddedildi: errorCodes={ErrorCodes}.",
                    result.ErrorCodes is { Length: > 0 } errors ? string.Join(',', errors) : "none");
                return false;
            }

            if (result.Score < 0.5f)
            {
                _logger.LogWarning(
                    "reCAPTCHA skoru düşük: score={Score}, expectedAction={ExpectedAction}, action={Action}.",
                    result.Score, expectedAction, result.Action ?? "none");
                return false;
            }

            if (!string.Equals(result.Action, expectedAction, StringComparison.Ordinal))
            {
                _logger.LogWarning(
                    "reCAPTCHA action eşleşmedi: expectedAction={ExpectedAction}, action={Action}.",
                    expectedAction, result.Action ?? "none");
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "reCAPTCHA doğrulama hatası.");
            return false;
        }
    }

    private sealed record RecaptchaResponse(
        bool    Success,
        float   Score,
        string? Action,
        [property: JsonPropertyName("error-codes")] string[]? ErrorCodes);
}
