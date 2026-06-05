namespace AselTeknoloji.Domain.Entities;

public enum TechnicalServiceStatus
{
    Beklemede = 0,
    Islemde = 1,
    ParcaBekleniyor = 2,
    Tamamlandi = 3,
    Iptal = 4
}

public class TechnicalService
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string DeviceType { get; set; } = string.Empty;
    public string IssueDescription { get; set; } = string.Empty;
    public string ServiceCode { get; set; } = string.Empty;       // Benzersiz sorgulama kodu
    public TechnicalServiceStatus Status { get; set; } = TechnicalServiceStatus.Beklemede;
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
