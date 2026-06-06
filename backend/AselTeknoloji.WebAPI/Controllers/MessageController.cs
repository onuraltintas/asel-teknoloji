using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using AselTeknoloji.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessageController : ControllerBase
{
    private readonly IGenericRepository<Message> _repo;
    private readonly IGenericRepository<Setting> _settings;
    private readonly IEmailService _email;
    private readonly RecaptchaService _recaptcha;

    public MessageController(
        IGenericRepository<Message> repo,
        IGenericRepository<Setting> settings,
        IEmailService email,
        RecaptchaService recaptcha)
    {
        _repo      = repo;
        _settings  = settings;
        _email     = email;
        _recaptcha = recaptcha;
    }

    [HttpPost, AllowAnonymous]
    public async Task<IActionResult> Send([FromBody] CreateMessageDto dto)
    {
        if (!await _recaptcha.VerifyAsync(dto.RecaptchaToken))
            return BadRequest(new { error = "Bot doğrulaması başarısız. Lütfen tekrar deneyin." });

        var entity = new Message
        {
            FullName = dto.FullName, Email = dto.Email,
            Phone = dto.Phone, Subject = dto.Subject, Body = dto.Body
        };
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();

        var setting  = (await _settings.GetAllAsync()).FirstOrDefault();
        var notifyTo = setting?.Email;
        if (!string.IsNullOrWhiteSpace(notifyTo))
        {
            var subject = $"[Asel Teknoloji] Yeni Mesaj: {entity.Subject}";
            var body    = $"""
                <h3>Yeni İletişim Formu Mesajı</h3>
                <table cellpadding="6" style="border-collapse:collapse;">
                  <tr><td><b>Ad Soyad</b></td><td>{entity.FullName}</td></tr>
                  <tr><td><b>E-posta</b></td><td>{entity.Email}</td></tr>
                  <tr><td><b>Telefon</b></td><td>{entity.Phone ?? "-"}</td></tr>
                  <tr><td><b>Konu</b></td><td>{entity.Subject}</td></tr>
                </table>
                <hr/>
                <p>{entity.Body}</p>
                """;
            await _email.SendAsync(notifyTo, subject, body);
        }

        return Ok(new { message = "Mesajınız alındı." });
    }

    [HttpGet, Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items.OrderByDescending(m => m.CreatedAt).Select(m => new MessageDto
        {
            Id = m.Id, FullName = m.FullName, Email = m.Email,
            Phone = m.Phone, Subject = m.Subject, Body = m.Body,
            IsRead = m.IsRead, CreatedAt = m.CreatedAt
        }));
    }

    [HttpPatch("{id}/read"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();
        entity.IsRead = true;
        _repo.Update(entity);
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();
        _repo.Remove(entity);
        await _repo.SaveChangesAsync();
        return NoContent();
    }
}
