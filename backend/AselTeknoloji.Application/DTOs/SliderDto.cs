using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class SliderDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string SubTitle { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? TargetUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public class CreateSliderDto
{
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(400)] public string SubTitle { get; set; } = string.Empty;
    [Required] public string ImageUrl { get; set; } = string.Empty;
    public string? TargetUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateSliderDto : CreateSliderDto
{
    public int Id { get; set; }
}
