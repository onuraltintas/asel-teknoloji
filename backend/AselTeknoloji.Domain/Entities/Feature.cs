namespace AselTeknoloji.Domain.Entities;

public class Feature : BaseEntity
{
    public int Id { get; set; }
    public string Icon { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}
