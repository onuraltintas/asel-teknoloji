namespace AselTeknoloji.Domain.Entities;

public class Service : BaseEntity
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;       // Rich text (HTML)
    public string ShortDescription { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }

    public Category Category { get; set; } = null!;
}
