namespace AselTeknoloji.Domain.Entities;

public class Portfolio : BaseEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? Tags { get; set; }
    public int DisplayOrder { get; set; }
}
