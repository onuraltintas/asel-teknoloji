using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/business-partner")]
public class BusinessPartnerController : ControllerBase
{
    private readonly IGenericRepository<BusinessPartner> _repo;

    public BusinessPartnerController(IGenericRepository<BusinessPartner> repo) => _repo = repo;

    [HttpGet, AllowAnonymous, OutputCache(PolicyName = "public5m")]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.FindAsync(r => r.IsActive);
        return Ok(items.OrderBy(r => r.DisplayOrder).ThenBy(r => r.Name).Select(ToDto));
    }

    [HttpGet("admin"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items.OrderBy(r => r.DisplayOrder).ThenBy(r => r.Name).Select(ToDto));
    }

    [HttpGet("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _repo.GetByIdAsync(id);
        return r is null ? NotFound() : Ok(ToDto(r));
    }

    [HttpPost, Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateBusinessPartnerDto dto)
    {
        var entity = Map(dto);
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity.Id);
    }

    [HttpPut("{id}"), Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBusinessPartnerDto dto)
    {
        if (id != dto.Id) return BadRequest();
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return NotFound();

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.LogoUrl = dto.LogoUrl;
        entity.Website = dto.Website;
        entity.PartnerType = dto.PartnerType;
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

    private static BusinessPartnerDto ToDto(BusinessPartner r) => new()
    {
        Id = r.Id, Name = r.Name, Description = r.Description,
        LogoUrl = r.LogoUrl, Website = r.Website, PartnerType = r.PartnerType,
        DisplayOrder = r.DisplayOrder, IsActive = r.IsActive
    };

    private static BusinessPartner Map(CreateBusinessPartnerDto dto) => new()
    {
        Name = dto.Name, Description = dto.Description,
        LogoUrl = dto.LogoUrl, Website = dto.Website, PartnerType = dto.PartnerType,
        DisplayOrder = dto.DisplayOrder, IsActive = dto.IsActive
    };
}
