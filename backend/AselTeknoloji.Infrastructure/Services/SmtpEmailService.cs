using System.Net;
using System.Net.Mail;
using AselTeknoloji.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AselTeknoloji.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        var host     = _config["Smtp:Host"];
        var username = _config["Smtp:Username"];
        var password = _config["Smtp:Password"];
        var from     = _config["Smtp:From"];
        var portStr  = _config["Smtp:Port"];

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(from))
        {
            _logger.LogWarning("SMTP yapılandırması eksik, e-posta gönderilmiyor.");
            return;
        }

        int port = int.TryParse(portStr, out var p) ? p : 587;

        try
        {
            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl   = true,
                Timeout     = 10_000
            };
            using var mail = new MailMessage(from, to, subject, body) { IsBodyHtml = true };
            await client.SendMailAsync(mail);
            _logger.LogInformation("E-posta gönderildi → {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "E-posta gönderilemedi.");
        }
    }
}
