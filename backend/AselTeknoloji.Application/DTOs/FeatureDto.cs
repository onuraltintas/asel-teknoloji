using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class FeatureDto
{
    public int Id { get; set; }
    public string Icon { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public class CreateFeatureDto
{
    [Required, MaxLength(20)]  public string Icon { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [Required, MaxLength(500)] public string Description { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateFeatureDto : CreateFeatureDto
{
    public int Id { get; set; }
}
