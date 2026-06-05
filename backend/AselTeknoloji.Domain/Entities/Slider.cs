namespace AselTeknoloji.Domain.Entities;

public class Slider : BaseEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string SubTitle { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? TargetUrl { get; set; }
    public int DisplayOrder { get; set; }
}
