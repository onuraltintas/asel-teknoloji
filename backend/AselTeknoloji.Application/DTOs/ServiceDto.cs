using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class ServiceDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public bool IsActive { get; set; }
}

public class CreateServiceDto
{
    [Required] public int CategoryId { get; set; }
    [Required, MaxLength(300)] public string Title { get; set; } = string.Empty;
    [Required, MaxLength(300)] public string Slug { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    [Required] public string ShortDescription { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    [MaxLength(70)]  public string? MetaTitle { get; set; }
    [MaxLength(160)] public string? MetaDescription { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateServiceDto : CreateServiceDto
{
    public int Id { get; set; }
}
