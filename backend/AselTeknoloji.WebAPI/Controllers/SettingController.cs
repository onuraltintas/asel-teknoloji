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
            await _repo.AddAsync(MapToEntity(dto));
        }
        else
        {
            s.Title = dto.Title; s.Description = dto.Description; s.Keywords = dto.Keywords;
            s.LogoUrl = dto.LogoUrl; s.FaviconUrl = dto.FaviconUrl;
            s.Phone = dto.Phone; s.Email = dto.Email; s.Address = dto.Address;
            s.MapsEmbedCode = dto.MapsEmbedCode;
            s.Facebook = dto.Facebook; s.Instagram = dto.Instagram; s.Linkedin = dto.Linkedin;
            s.Whatsapp = dto.Whatsapp; s.Youtube = dto.Youtube; s.Twitter = dto.Twitter;
            s.Tagline = dto.Tagline; s.TaglineSubtitle = dto.TaglineSubtitle;
            s.Stat1Value = dto.Stat1Value; s.Stat1Label = dto.Stat1Label;
            s.Stat2Value = dto.Stat2Value; s.Stat2Label = dto.Stat2Label;
            s.Stat3Value = dto.Stat3Value; s.Stat3Label = dto.Stat3Label;
            s.Stat4Value = dto.Stat4Value; s.Stat4Label = dto.Stat4Label;
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
        Facebook = s.Facebook, Instagram = s.Instagram, Linkedin = s.Linkedin,
        Whatsapp = s.Whatsapp, Youtube = s.Youtube, Twitter = s.Twitter,
        Tagline = s.Tagline, TaglineSubtitle = s.TaglineSubtitle,
        Stat1Value = s.Stat1Value, Stat1Label = s.Stat1Label,
        Stat2Value = s.Stat2Value, Stat2Label = s.Stat2Label,
        Stat3Value = s.Stat3Value, Stat3Label = s.Stat3Label,
        Stat4Value = s.Stat4Value, Stat4Label = s.Stat4Label
    };

    private static Setting MapToEntity(UpdateSettingDto dto) => new()
    {
        Title = dto.Title, Description = dto.Description, Keywords = dto.Keywords,
        LogoUrl = dto.LogoUrl, FaviconUrl = dto.FaviconUrl,
        Phone = dto.Phone, Email = dto.Email, Address = dto.Address,
        MapsEmbedCode = dto.MapsEmbedCode,
        Facebook = dto.Facebook, Instagram = dto.Instagram, Linkedin = dto.Linkedin,
        Whatsapp = dto.Whatsapp, Youtube = dto.Youtube, Twitter = dto.Twitter,
        Tagline = dto.Tagline, TaglineSubtitle = dto.TaglineSubtitle,
        Stat1Value = dto.Stat1Value, Stat1Label = dto.Stat1Label,
        Stat2Value = dto.Stat2Value, Stat2Label = dto.Stat2Label,
        Stat3Value = dto.Stat3Value, Stat3Label = dto.Stat3Label,
        Stat4Value = dto.Stat4Value, Stat4Label = dto.Stat4Label
    };
}
