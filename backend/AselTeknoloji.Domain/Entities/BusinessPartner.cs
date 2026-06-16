namespace AselTeknoloji.Domain.Entities;

public class BusinessPartner : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public string? PartnerType { get; set; }
    public int DisplayOrder { get; set; }
}
