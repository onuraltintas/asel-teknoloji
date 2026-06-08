using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PortfolioController : ControllerBase
{
    private readonly IGenericRepository<Portfolio> _repo;

    public PortfolioController(IGenericRepository<Portfolio> repo) => _repo = repo;

    [HttpGet, AllowAnonymous, OutputCache(PolicyName = "public5m")]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.FindAsync(p => p.IsActive);
        return Ok(items.OrderBy(p => p.DisplayOrder).ThenBy(p => p.Title).Select(ToDto));
    }

    [HttpGet("{slug}"), AllowAnonymous, OutputCache(PolicyName = "public5m")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var p = await _repo.SingleOrDefaultAsync(x => x.Slug == slug && x.IsActive);
        return p is null ? NotFound() : Ok(ToDto(p));
    }

    [HttpGet("admin"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items.OrderBy(p => p.DisplayOrder).ThenBy(p => p.Title).Select(ToDto));
    }

    [HttpGet("admin/{id:int}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p is null ? NotFound() : Ok(ToDto(p));
    }

    [HttpPost, Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePortfolioDto dto)
    {
        var entity = Map(dto);
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity.Id);
    }

    [HttpPut("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePortfolioDto dto)
    {
        if (id != dto.Id) return BadRequest();
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();

        entity.Title = dto.Title;
        entity.Slug = dto.Slug;
        entity.Description = dto.Description;
        entity.Images = dto.Images;
        entity.Tags = dto.Tags;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.IsActive = dto.IsActive;

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

    private static PortfolioDto ToDto(Portfolio p) => new()
    {
        Id = p.Id, Title = p.Title, Slug = p.Slug, Description = p.Description,
        Images = p.Images, Tags = p.Tags, DisplayOrder = p.DisplayOrder, IsActive = p.IsActive
    };

    private static Portfolio Map(CreatePortfolioDto dto) => new()
    {
        Title = dto.Title, Slug = dto.Slug, Description = dto.Description,
        Images = dto.Images, Tags = dto.Tags, DisplayOrder = dto.DisplayOrder, IsActive = dto.IsActive
    };
}
