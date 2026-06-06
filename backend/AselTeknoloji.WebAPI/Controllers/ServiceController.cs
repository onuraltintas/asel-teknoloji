using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceController : ControllerBase
{
    private readonly IGenericRepository<Service>  _repo;
    private readonly IGenericRepository<Category> _catRepo;

    public ServiceController(IGenericRepository<Service> repo, IGenericRepository<Category> catRepo)
    {
        _repo    = repo;
        _catRepo = catRepo;
    }

    [HttpGet, AllowAnonymous, OutputCache(PolicyName = "public5m")]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.FindAsync(s => s.IsActive);
        var catMap = await GetCategoryMap();
        return Ok(items.Select(s => ToDto(s, catMap)));
    }

    [HttpGet("{slug}"), AllowAnonymous, OutputCache(PolicyName = "public5m")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var s = await _repo.SingleOrDefaultAsync(x => x.Slug == slug && x.IsActive);
        if (s is null) return NotFound();
        var catMap = await GetCategoryMap();
        return Ok(ToDto(s, catMap));
    }

    [HttpGet("admin"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var items = await _repo.GetAllAsync();
        var catMap = await GetCategoryMap();
        return Ok(items.Select(s => ToDto(s, catMap)));
    }

    private async Task<Dictionary<int, string>> GetCategoryMap()
    {
        var cats = await _catRepo.GetAllAsync();
        return cats.ToDictionary(c => c.Id, c => c.Name);
    }

    [HttpPost, Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateServiceDto dto)
    {
        var entity = Map(dto);
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBySlug), new { slug = entity.Slug }, entity.Id);
    }

    [HttpPut("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceDto dto)
    {
        if (id != dto.Id) return BadRequest();
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();

        entity.CategoryId       = dto.CategoryId;
        entity.Title            = dto.Title;
        entity.Slug             = dto.Slug;
        entity.Description      = dto.Description;
        entity.ShortDescription = dto.ShortDescription;
        entity.ImageUrl         = dto.ImageUrl;
        entity.MetaTitle        = dto.MetaTitle;
        entity.MetaDescription  = dto.MetaDescription;
        entity.IsActive         = dto.IsActive;

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

    private static ServiceDto ToDto(Service s, Dictionary<int, string> catMap) => new()
    {
        Id = s.Id, CategoryId = s.CategoryId,
        CategoryName = catMap.TryGetValue(s.CategoryId, out var name) ? name : string.Empty,
        Title = s.Title, Slug = s.Slug,
        Description = s.Description, ShortDescription = s.ShortDescription,
        ImageUrl = s.ImageUrl, MetaTitle = s.MetaTitle,
        MetaDescription = s.MetaDescription, IsActive = s.IsActive
    };

    private static Service Map(CreateServiceDto dto) => new ()
    {
        CategoryId = dto.CategoryId, Title = dto.Title, Slug = dto.Slug,
        Description = dto.Description, ShortDescription = dto.ShortDescription,
        ImageUrl = dto.ImageUrl, MetaTitle = dto.MetaTitle,
        MetaDescription = dto.MetaDescription, IsActive = dto.IsActive
    };
}
