namespace AselTeknoloji.Domain.Entities;

public class PageContent : BaseEntity
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // "vision" | "mission"
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}
