using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SliderController : ControllerBase
{
    private readonly IGenericRepository<Slider> _repo;

    public SliderController(IGenericRepository<Slider> repo) => _repo = repo;

    [HttpGet, AllowAnonymous, OutputCache(PolicyName = "public5m")]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.FindAsync(s => s.IsActive);
        var result = items.OrderBy(s => s.DisplayOrder)
            .Select(s => new SliderDto
            {
                Id = s.Id, Title = s.Title, SubTitle = s.SubTitle,
                ImageUrl = s.ImageUrl, TargetUrl = s.TargetUrl,
                DisplayOrder = s.DisplayOrder, IsActive = s.IsActive
            });
        return Ok(result);
    }

    [HttpGet("admin"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var items = await _repo.GetAllAsync();
        var result = items.OrderBy(s => s.DisplayOrder)
            .Select(s => new SliderDto
            {
                Id = s.Id, Title = s.Title, SubTitle = s.SubTitle,
                ImageUrl = s.ImageUrl, TargetUrl = s.TargetUrl,
                DisplayOrder = s.DisplayOrder, IsActive = s.IsActive
            });
        return Ok(result);
    }

    [HttpGet("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var s = await _repo.GetByIdAsync(id);
        if (s is null) return NotFound();
        return Ok(new SliderDto
        {
            Id = s.Id, Title = s.Title, SubTitle = s.SubTitle,
            ImageUrl = s.ImageUrl, TargetUrl = s.TargetUrl,
            DisplayOrder = s.DisplayOrder, IsActive = s.IsActive
        });
    }

    [HttpPost, Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSliderDto dto)
    {
        var entity = new Slider
        {
            Title = dto.Title, SubTitle = dto.SubTitle,
            ImageUrl = dto.ImageUrl, TargetUrl = dto.TargetUrl,
            DisplayOrder = dto.DisplayOrder, IsActive = dto.IsActive
        };
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity.Id);
    }

    [HttpPut("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSliderDto dto)
    {
        if (id != dto.Id) return BadRequest();
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();

        entity.Title = dto.Title; entity.SubTitle = dto.SubTitle;
        entity.ImageUrl = dto.ImageUrl; entity.TargetUrl = dto.TargetUrl;
        entity.DisplayOrder = dto.DisplayOrder; entity.IsActive = dto.IsActive;

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
