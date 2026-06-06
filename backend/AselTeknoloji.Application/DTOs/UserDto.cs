using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs;

public class UserResponseDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserDto
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, MinLength(6)] public string Password { get; set; } = string.Empty;
    [Required] public string Role { get; set; } = "Admin";
    public bool IsActive { get; set; } = true;
}

public class UpdateUserDto
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    [Required] public string Role { get; set; } = "Admin";
    public bool IsActive { get; set; } = true;
}
