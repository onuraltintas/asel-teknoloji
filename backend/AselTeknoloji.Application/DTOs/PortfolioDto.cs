using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class PortfolioDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Images { get; set; }
    public string? Tags { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public class CreatePortfolioDto
{
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [Required, MaxLength(300)] public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Images { get; set; }
    [MaxLength(500)] public string? Tags { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdatePortfolioDto : CreatePortfolioDto
{
    public int Id { get; set; }
}
