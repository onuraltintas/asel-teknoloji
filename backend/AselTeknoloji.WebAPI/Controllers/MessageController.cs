using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessageController : ControllerBase
{
    private readonly IGenericRepository<Message> _repo;
    public MessageController(IGenericRepository<Message> repo) => _repo = repo;

    [HttpPost, AllowAnonymous]
    public async Task<IActionResult> Send([FromBody] CreateMessageDto dto)
    {
        var entity = new Message
        {
            FullName = dto.FullName, Email = dto.Email,
            Phone = dto.Phone, Subject = dto.Subject, Body = dto.Body
        };
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return Ok(new { message = "Mesajınız alındı." });
    }

    [HttpGet, Authorize]
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

    [HttpPatch("{id}/read"), Authorize]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();
        entity.IsRead = true;
        _repo.Update(entity);
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}"), Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();
        _repo.Remove(entity);
        await _repo.SaveChangesAsync();
        return NoContent();
    }
}
