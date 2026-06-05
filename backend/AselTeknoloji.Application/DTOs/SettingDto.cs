using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class SettingDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Keywords { get; set; }
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? MapsEmbedCode { get; set; }
    public string? Facebook { get; set; }
    public string? Instagram { get; set; }
    public string? Linkedin { get; set; }
}

public class UpdateSettingDto
{
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Keywords { get; set; }
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
    [MaxLength(20)]  public string? Phone { get; set; }
    [MaxLength(200)] public string? Email { get; set; }
    public string? Address { get; set; }
    public string? MapsEmbedCode { get; set; }
    [MaxLength(300)] public string? Facebook { get; set; }
    [MaxLength(300)] public string? Instagram { get; set; }
    [MaxLength(300)] public string? Linkedin { get; set; }
}
