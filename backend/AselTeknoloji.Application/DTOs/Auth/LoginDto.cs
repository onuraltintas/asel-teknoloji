using System.ComponentModel.DataAnnotations;

namespace AselTeknoloji.Application.DTOs.Auth;

public class LoginDto
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
}
