using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingController : ControllerBase
{
    private readonly IGenericRepository<Setting> _repo;
    public SettingController(IGenericRepository<Setting> repo) => _repo = repo;

    [HttpGet, AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        var s = await _repo.SingleOrDefaultAsync(_ => true);
        if (s is null) return NotFound();
        return Ok(ToDto(s));
    }

    [HttpPut, Authorize]
    public async Task<IActionResult> Update([FromBody] UpdateSettingDto dto)
    {
        var s = await _repo.SingleOrDefaultAsync(_ => true);
        if (s is null)
        {
            // İlk kayıt
            var newSetting = new Setting
            {
                Title = dto.Title, Description = dto.Description, Keywords = dto.Keywords,
                LogoUrl = dto.LogoUrl, FaviconUrl = dto.FaviconUrl,
                Phone = dto.Phone, Email = dto.Email, Address = dto.Address,
                MapsEmbedCode = dto.MapsEmbedCode,
                Facebook = dto.Facebook, Instagram = dto.Instagram, Linkedin = dto.Linkedin
            };
            await _repo.AddAsync(newSetting);
        }
        else
        {
            s.Title = dto.Title; s.Description = dto.Description; s.Keywords = dto.Keywords;
            s.LogoUrl = dto.LogoUrl; s.FaviconUrl = dto.FaviconUrl;
            s.Phone = dto.Phone; s.Email = dto.Email; s.Address = dto.Address;
            s.MapsEmbedCode = dto.MapsEmbedCode;
            s.Facebook = dto.Facebook; s.Instagram = dto.Instagram; s.Linkedin = dto.Linkedin;
            _repo.Update(s);
        }
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    private static SettingDto ToDto(Setting s) => new()
    {
        Id = s.Id, Title = s.Title, Description = s.Description, Keywords = s.Keywords,
        LogoUrl = s.LogoUrl, FaviconUrl = s.FaviconUrl,
        Phone = s.Phone, Email = s.Email, Address = s.Address,
        MapsEmbedCode = s.MapsEmbedCode,
        Facebook = s.Facebook, Instagram = s.Instagram, Linkedin = s.Linkedin
    };
}
