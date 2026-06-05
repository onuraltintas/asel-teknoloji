using System.ComponentModel.DataAnnotations;
using AselTeknoloji.Domain.Entities;

namespace AselTeknoloji.Application.DTOs;

public class TechnicalServiceDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string DeviceType { get; set; } = string.Empty;
    public string IssueDescription { get; set; } = string.Empty;
    public string ServiceCode { get; set; } = string.Empty;
    public TechnicalServiceStatus Status { get; set; }
    public string StatusLabel { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>Müşteri tarafından arıza kaydı oluşturma (AllowAnonymous)</summary>
public class CreateTechnicalServiceDto
{
    [Required, MaxLength(200)] public string CustomerName { get; set; } = string.Empty;
    [Required, MaxLength(20)]  public string CustomerPhone { get; set; } = string.Empty;
    [EmailAddress, MaxLength(200)] public string? CustomerEmail { get; set; }
    [Required, MaxLength(100)] public string DeviceType { get; set; } = string.Empty;
    [Required] public string IssueDescription { get; set; } = string.Empty;
}

/// <summary>Admin panelinden durum ve not güncelleme (Authorize)</summary>
public class UpdateTechnicalServiceDto
{
    [Required] public TechnicalServiceStatus Status { get; set; }
    public string? AdminNote { get; set; }
}

/// <summary>Müşteri kodu ile durum sorgulama (AllowAnonymous)</summary>
public class ServiceStatusQueryDto
{
    public string ServiceCode { get; set; } = string.Empty;
    public TechnicalServiceStatus Status { get; set; }
    public string StatusLabel { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
}
