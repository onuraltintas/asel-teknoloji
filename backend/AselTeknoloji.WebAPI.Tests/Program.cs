using System.Net;
using System.Net.Http.Json;
using AselTeknoloji.WebAPI.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

var tests = new (string Name, Func<Task> Run)[]
{
    ("Secret yoksa reddeder", async () =>
    {
        var service = CreateService(new Dictionary<string, string?>(), SuccessResponse("contact"));
        AssertFalse(await service.VerifyAsync("token"));
    }),
    ("Token yoksa reddeder", async () =>
    {
        var service = CreateService(Configuration(), SuccessResponse("contact"));
        AssertFalse(await service.VerifyAsync(null));
    }),
    ("Google isteği hata verirse reddeder", async () =>
    {
        var service = CreateService(Configuration(), exception: new HttpRequestException("unavailable"));
        AssertFalse(await service.VerifyAsync("token"));
    }),
    ("Action eşleşmezse reddeder", async () =>
    {
        dynamic service = CreateService(Configuration(), SuccessResponse("technical_service"));
        AssertFalse(await service.VerifyAsync("token", "contact"));
    }),
    ("Skor ve action geçerliyse kabul eder", async () =>
    {
        dynamic service = CreateService(Configuration(), SuccessResponse("contact"));
        AssertTrue(await service.VerifyAsync("token", "contact"));
    })
};

var failures = 0;
foreach (var test in tests)
{
    try
    {
        await test.Run();
        Console.WriteLine($"PASS: {test.Name}");
    }
    catch (Exception ex)
    {
        failures++;
        Console.WriteLine($"FAIL: {test.Name} — {ex.GetBaseException().Message}");
    }
}

return failures == 0 ? 0 : 1;

static void AssertFalse(bool value)
{
    if (value) throw new InvalidOperationException("false bekleniyordu, true döndü");
}

static void AssertTrue(bool value)
{
    if (!value) throw new InvalidOperationException("true bekleniyordu, false döndü");
}

static RecaptchaService CreateService(
    Dictionary<string, string?> configuration,
    HttpResponseMessage? response = null,
    Exception? exception = null)
{
    var config = new ConfigurationBuilder().AddInMemoryCollection(configuration).Build();
    var handler = new StubHttpMessageHandler(response, exception);
    var factory = new StubHttpClientFactory(new HttpClient(handler));
    return new RecaptchaService(factory, config, NullLogger<RecaptchaService>.Instance);
}

static Dictionary<string, string?> Configuration() => new()
{
    ["Recaptcha:SecretKey"] = "secret"
};

static HttpResponseMessage SuccessResponse(string action) => new(HttpStatusCode.OK)
{
    Content = JsonContent.Create(new { success = true, score = 0.9f, action })
};

internal sealed class StubHttpClientFactory(HttpClient client) : IHttpClientFactory
{
    public HttpClient CreateClient(string name) => client;
}

internal sealed class StubHttpMessageHandler(HttpResponseMessage? response, Exception? exception)
    : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        if (exception is not null)
            return Task.FromException<HttpResponseMessage>(exception);

        return Task.FromResult(response!);
    }
}
