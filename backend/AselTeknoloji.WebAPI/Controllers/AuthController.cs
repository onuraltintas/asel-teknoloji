using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AselTeknoloji.Application.DTOs.Auth;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IGenericRepository<User> _userRepo;
    private readonly IConfiguration _config;

    public AuthController(IGenericRepository<User> userRepo, IConfiguration config)
    {
        _userRepo = userRepo;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _userRepo.SingleOrDefaultAsync(u => u.Username == dto.Username);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Bu hesap devre dışı bırakılmıştır." });

        var token = GenerateToken(user);
        return Ok(new LoginResponseDto
        {
            Token      = token,
            Username   = user.Username,
            Role       = user.Role,
            Expiration = DateTime.UtcNow.AddMinutes(
                _config.GetValue<int>("Jwt:ExpirationMinutes", 480))
        });
    }

    private string GenerateToken(User user)
    {
        var key    = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds  = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(_config.GetValue<int>("Jwt:ExpirationMinutes", 480));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer:             _config["Jwt:Issuer"],
            audience:           _config["Jwt:Audience"],
            claims:             claims,
            expires:            expiry,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
