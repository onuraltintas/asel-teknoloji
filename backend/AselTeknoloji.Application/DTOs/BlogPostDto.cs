using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class BlogPostDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateBlogPostDto
{
    [Required, MaxLength(300)] public string Title { get; set; } = string.Empty;
    [Required, MaxLength(300)] public string Slug { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateBlogPostDto : CreateBlogPostDto
{
    public int Id { get; set; }
}
