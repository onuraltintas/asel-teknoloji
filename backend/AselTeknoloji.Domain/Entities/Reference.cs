namespace AselTeknoloji.Domain.Entities;

public class Reference : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? Website { get; set; }
    public int DisplayOrder { get; set; }
}
