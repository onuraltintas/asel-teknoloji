using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeatureController : ControllerBase
{
    private readonly IGenericRepository<Feature> _repo;
    public FeatureController(IGenericRepository<Feature> repo) => _repo = repo;

    [HttpGet, AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.FindAsync(f => f.IsActive);
        return Ok(items.OrderBy(f => f.DisplayOrder).Select(ToDto));
    }

    [HttpGet("admin"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items.OrderBy(f => f.DisplayOrder).Select(ToDto));
    }

    [HttpGet("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var f = await _repo.GetByIdAsync(id);
        return f is null ? NotFound() : Ok(ToDto(f));
    }

    [HttpPost, Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateFeatureDto dto)
    {
        var entity = new Feature
        {
            Icon = dto.Icon, Title = dto.Title, Description = dto.Description,
            DisplayOrder = dto.DisplayOrder, IsActive = dto.IsActive
        };
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity.Id);
    }

    [HttpPut("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateFeatureDto dto)
    {
        if (id != dto.Id) return BadRequest();
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();
        entity.Icon = dto.Icon; entity.Title = dto.Title;
        entity.Description = dto.Description; entity.DisplayOrder = dto.DisplayOrder;
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

    private static FeatureDto ToDto(Feature f) => new()
    {
        Id = f.Id, Icon = f.Icon, Title = f.Title,
        Description = f.Description, DisplayOrder = f.DisplayOrder, IsActive = f.IsActive
    };
}
