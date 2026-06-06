using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogPostController : ControllerBase
{
    private readonly IGenericRepository<BlogPost> _repo;
    public BlogPostController(IGenericRepository<BlogPost> repo) => _repo = repo;

    [HttpGet, AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.FindAsync(b => b.IsActive);
        return Ok(items.OrderByDescending(b => b.CreatedAt).Select(ToDto));
    }

    [HttpGet("{slug}"), AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var b = await _repo.SingleOrDefaultAsync(x => x.Slug == slug && x.IsActive);
        if (b is null) return NotFound();
        return Ok(ToDto(b));
    }

    [HttpGet("admin"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items.OrderByDescending(b => b.CreatedAt).Select(ToDto));
    }

    [HttpPost, Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateBlogPostDto dto)
    {
        var entity = new BlogPost
        {
            Title = dto.Title, Slug = dto.Slug,
            Content = dto.Content, ImageUrl = dto.ImageUrl, IsActive = dto.IsActive
        };
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return Ok(entity.Id);
    }

    [HttpPut("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBlogPostDto dto)
    {
        if (id != dto.Id) return BadRequest();
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();
        entity.Title = dto.Title; entity.Slug = dto.Slug;
        entity.Content = dto.Content; entity.ImageUrl = dto.ImageUrl;
        entity.IsActive = dto.IsActive; entity.UpdatedAt = DateTime.UtcNow;
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

    private static BlogPostDto ToDto(BlogPost b) => new()
    {
        Id = b.Id, Title = b.Title, Slug = b.Slug,
        Content = b.Content, ImageUrl = b.ImageUrl,
        IsActive = b.IsActive, CreatedAt = b.CreatedAt, UpdatedAt = b.UpdatedAt
    };
}
