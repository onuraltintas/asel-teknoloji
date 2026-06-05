namespace AselTeknoloji.Domain.Entities;

public class Category : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public ICollection<Service> Services { get; set; } = new List<Service>();
}
