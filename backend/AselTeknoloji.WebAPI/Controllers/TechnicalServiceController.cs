using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TechnicalServiceController : ControllerBase
{
    private readonly IGenericRepository<TechnicalService> _repo;
    private readonly IGenericRepository<Setting>          _settings;
    private readonly IEmailService                        _email;

    public TechnicalServiceController(
        IGenericRepository<TechnicalService> repo,
        IGenericRepository<Setting>          settings,
        IEmailService                        email)
    {
        _repo     = repo;
        _settings = settings;
        _email    = email;
    }

    // ── Müşteri: Arıza kaydı oluştur ─────────────────────────
    [HttpPost, AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateTechnicalServiceDto dto)
    {
        var serviceCode = GenerateServiceCode();
        var entity = new TechnicalService
        {
            CustomerName     = dto.CustomerName,
            CustomerPhone    = dto.CustomerPhone,
            CustomerEmail    = dto.CustomerEmail,
            DeviceType       = dto.DeviceType,
            IssueDescription = dto.IssueDescription,
            ServiceCode      = serviceCode,
            Status           = TechnicalServiceStatus.Beklemede
        };
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();

        // Admin bildirimi
        var setting   = (await _settings.GetAllAsync()).FirstOrDefault();
        var notifyTo  = setting?.Email;
        if (!string.IsNullOrWhiteSpace(notifyTo))
        {
            await _email.SendAsync(
                notifyTo,
                $"[Asel Teknoloji] Yeni Arıza Talebi — {serviceCode}",
                $"""
                <h3>Yeni Arıza / Teknik Servis Talebi</h3>
                <table cellpadding="6" style="border-collapse:collapse;">
                  <tr><td><b>Servis Kodu</b></td><td><b>{serviceCode}</b></td></tr>
                  <tr><td><b>Müşteri</b></td><td>{entity.CustomerName}</td></tr>
                  <tr><td><b>Telefon</b></td><td>{entity.CustomerPhone ?? "-"}</td></tr>
                  <tr><td><b>E-posta</b></td><td>{entity.CustomerEmail ?? "-"}</td></tr>
                  <tr><td><b>Cihaz Tipi</b></td><td>{entity.DeviceType}</td></tr>
                </table>
                <hr/>
                <p><b>Arıza Açıklaması:</b></p>
                <p>{entity.IssueDescription}</p>
                """);
        }

        // Müşteri onay e-postası (e-posta adresi varsa)
        if (!string.IsNullOrWhiteSpace(entity.CustomerEmail))
        {
            await _email.SendAsync(
                entity.CustomerEmail,
                $"Arıza Talebiniz Alındı — {serviceCode}",
                $"""
                <p>Sayın <b>{entity.CustomerName}</b>,</p>
                <p>Arıza talebiniz başarıyla oluşturuldu.</p>
                <table cellpadding="6" style="border-collapse:collapse;border:1px solid #e5e7eb;">
                  <tr><td><b>Servis Kodu</b></td><td><b>{serviceCode}</b></td></tr>
                  <tr><td><b>Cihaz</b></td><td>{entity.DeviceType}</td></tr>
                  <tr><td><b>Durum</b></td><td>Beklemede</td></tr>
                </table>
                <p>Bu kodu kullanarak <a href="{setting?.Title ?? "Asel Teknoloji"}" style="color:#1d4ed8">servis takip sayfamızdan</a> durumunuzu sorgulayabilirsiniz.</p>
                <p>En kısa sürede sizinle iletişime geçeceğiz.</p>
                """);
        }

        return Ok(new { serviceCode, message = "Arıza kaydınız alındı. Kodu not alın." });
    }

    // ── Müşteri: Kod ile durum sorgula ───────────────────────
    [HttpGet("status/{code}"), AllowAnonymous]
    public async Task<IActionResult> QueryStatus(string code)
    {
        var entity = await _repo.SingleOrDefaultAsync(t => t.ServiceCode == code);
        if (entity is null) return NotFound(new { message = "Servis kodu bulunamadı." });

        return Ok(new ServiceStatusQueryDto
        {
            ServiceCode = entity.ServiceCode,
            Status      = entity.Status,
            StatusLabel = GetStatusLabel(entity.Status),
            DeviceType  = entity.DeviceType,
            AdminNote   = entity.AdminNote,
            CreatedAt   = entity.CreatedAt
        });
    }

    // ── Admin: Tüm kayıtları listele ─────────────────────────
    [HttpGet, Authorize]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync();
        var result = items.OrderByDescending(t => t.CreatedAt)
            .Select(t => new TechnicalServiceDto
            {
                Id               = t.Id,
                CustomerName     = t.CustomerName,
                CustomerPhone    = t.CustomerPhone,
                CustomerEmail    = t.CustomerEmail,
                DeviceType       = t.DeviceType,
                IssueDescription = t.IssueDescription,
                ServiceCode      = t.ServiceCode,
                Status           = t.Status,
                StatusLabel      = GetStatusLabel(t.Status),
                AdminNote        = t.AdminNote,
                CreatedAt        = t.CreatedAt,
                UpdatedAt        = t.UpdatedAt
            });
        return Ok(result);
    }

    // ── Admin: Durum ve not güncelle ─────────────────────────
    [HttpPut("{id}"), Authorize]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTechnicalServiceDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();

        var prevStatus = entity.Status;
        entity.Status    = dto.Status;
        entity.AdminNote = dto.AdminNote;
        entity.UpdatedAt = DateTime.UtcNow;

        _repo.Update(entity);
        await _repo.SaveChangesAsync();

        // Müşteri bildirimi — durum değiştiyse ve e-posta adresi varsa
        if (prevStatus != dto.Status && !string.IsNullOrWhiteSpace(entity.CustomerEmail))
        {
            var statusLabel = GetStatusLabel(dto.Status);
            await _email.SendAsync(
                entity.CustomerEmail,
                $"Servis Durumu Güncellendi — {entity.ServiceCode}",
                $"""
                <p>Sayın <b>{entity.CustomerName}</b>,</p>
                <p>Servis talebinizin durumu güncellendi:</p>
                <table cellpadding="6" style="border-collapse:collapse;border:1px solid #e5e7eb;">
                  <tr><td><b>Servis Kodu</b></td><td>{entity.ServiceCode}</td></tr>
                  <tr><td><b>Cihaz</b></td><td>{entity.DeviceType}</td></tr>
                  <tr><td><b>Yeni Durum</b></td><td><b>{statusLabel}</b></td></tr>
                  {(string.IsNullOrWhiteSpace(entity.AdminNote) ? "" : $"<tr><td><b>Teknisyen Notu</b></td><td>{entity.AdminNote}</td></tr>")}
                </table>
                <p>Sorularınız için bize ulaşabilirsiniz.</p>
                """);
        }

        return NoContent();
    }

    private static string GenerateServiceCode()
    {
        var random = new Random().Next(100000, 999999);
        return $"ASL{random}";
    }

    private static string GetStatusLabel(TechnicalServiceStatus status) => status switch
    {
        TechnicalServiceStatus.Beklemede       => "Beklemede",
        TechnicalServiceStatus.Islemde         => "İşlemde",
        TechnicalServiceStatus.ParcaBekleniyor => "Parça Bekleniyor",
        TechnicalServiceStatus.Tamamlandi      => "Tamamlandı",
        TechnicalServiceStatus.Iptal           => "İptal",
        _                                      => "Bilinmiyor"
    };
}
