using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class PageContentDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
}

public class CreatePageContentDto
{
    [Required, MaxLength(20)]  public string Type { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(300)]           public string Subtitle { get; set; } = string.Empty;
    [Required]                 public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdatePageContentDto : CreatePageContentDto
{
    public int Id { get; set; }
}
