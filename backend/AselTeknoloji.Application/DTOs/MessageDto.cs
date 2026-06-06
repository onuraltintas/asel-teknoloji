using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class MessageDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateMessageDto
{
    [Required, MaxLength(200)] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(200)] public string Email { get; set; } = string.Empty;
    [MaxLength(20)] public string? Phone { get; set; }
    [Required, MaxLength(300)] public string Subject { get; set; } = string.Empty;
    [Required] public string Body { get; set; } = string.Empty;
    public string? RecaptchaToken { get; set; }
}
