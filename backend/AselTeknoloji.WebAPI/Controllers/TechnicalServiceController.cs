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

    public TechnicalServiceController(IGenericRepository<TechnicalService> repo) => _repo = repo;

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

        entity.Status    = dto.Status;
        entity.AdminNote = dto.AdminNote;
        entity.UpdatedAt = DateTime.UtcNow;

        _repo.Update(entity);
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    private static string GenerateServiceCode()
    {
        var prefix = "ASL";
        var random = new Random().Next(100000, 999999);
        return $"{prefix}{random}";
    }

    private static string GetStatusLabel(TechnicalServiceStatus status) => status switch
    {
        TechnicalServiceStatus.Beklemede      => "Beklemede",
        TechnicalServiceStatus.Islemde        => "İşlemde",
        TechnicalServiceStatus.ParcaBekleniyor => "Parça Bekleniyor",
        TechnicalServiceStatus.Tamamlandi     => "Tamamlandı",
        TechnicalServiceStatus.Iptal          => "İptal",
        _                                     => "Bilinmiyor"
    };
}
