using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class ReferenceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? Website { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public class CreateReferenceDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [MaxLength(500)] public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    [MaxLength(300)] public string? Website { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateReferenceDto : CreateReferenceDto
{
    public int Id { get; set; }
}
