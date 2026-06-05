using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateCategoryDto
{
    [Required, MaxLength(150)] public string Name { get; set; } = string.Empty;
    [Required, MaxLength(150)] public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateCategoryDto : CreateCategoryDto
{
    public int Id { get; set; }
}
