using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PageContentController : ControllerBase
{
    private readonly IGenericRepository<PageContent> _repo;
    public PageContentController(IGenericRepository<PageContent> repo) => _repo = repo;

    [HttpGet("{type}"), AllowAnonymous]
    public async Task<IActionResult> GetByType(string type)
    {
        var items = await _repo.FindAsync(p => p.Type == type && p.IsActive);
        var item = items.FirstOrDefault();
        return item is null ? NotFound() : Ok(ToDto(item));
    }

    [HttpGet("admin/all"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items.OrderBy(p => p.Type).Select(ToDto));
    }

    [HttpGet("admin/{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(ToDto(item));
    }

    [HttpPost, Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePageContentDto dto)
    {
        var entity = new PageContent
        {
            Type = dto.Type, Title = dto.Title, Subtitle = dto.Subtitle,
            Content = dto.Content, ImageUrl = dto.ImageUrl, IsActive = dto.IsActive
        };
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity.Id);
    }

    [HttpPut("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePageContentDto dto)
    {
        if (id != dto.Id) return BadRequest();
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();
        entity.Type = dto.Type; entity.Title = dto.Title; entity.Subtitle = dto.Subtitle;
        entity.Content = dto.Content; entity.ImageUrl = dto.ImageUrl; entity.IsActive = dto.IsActive;
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

    private static PageContentDto ToDto(PageContent p) => new()
    {
        Id = p.Id, Type = p.Type, Title = p.Title, Subtitle = p.Subtitle,
        Content = p.Content, ImageUrl = p.ImageUrl, IsActive = p.IsActive
    };
}
