namespace AselTeknoloji.Domain.Entities;

public class BlogPost : BaseEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;           // Rich text (HTML)
    public string? ImageUrl { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
