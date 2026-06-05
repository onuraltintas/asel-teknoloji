using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly IGenericRepository<Category> _repo;
    public CategoryController(IGenericRepository<Category> repo) => _repo = repo;

    [HttpGet, AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.FindAsync(c => c.IsActive);
        return Ok(items.Select(c => new CategoryDto { Id = c.Id, Name = c.Name, Slug = c.Slug, IsActive = c.IsActive }));
    }

    [HttpGet("admin"), Authorize]
    public async Task<IActionResult> GetAllAdmin()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items.Select(c => new CategoryDto { Id = c.Id, Name = c.Name, Slug = c.Slug, IsActive = c.IsActive }));
    }

    [HttpPost, Authorize]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        var entity = new Category { Name = dto.Name, Slug = dto.Slug, IsActive = dto.IsActive };
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return Ok(entity.Id);
    }

    [HttpPut("{id}"), Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
    {
        if (id != dto.Id) return BadRequest();
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();
        entity.Name = dto.Name; entity.Slug = dto.Slug; entity.IsActive = dto.IsActive;
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
