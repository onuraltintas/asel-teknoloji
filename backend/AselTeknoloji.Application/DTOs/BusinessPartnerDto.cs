using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class BusinessPartnerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public string? PartnerType { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public class CreateBusinessPartnerDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [MaxLength(500)] public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    [MaxLength(300)] public string? Website { get; set; }
    [MaxLength(100)] public string? PartnerType { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateBusinessPartnerDto : CreateBusinessPartnerDto
{
    public int Id { get; set; }
}
