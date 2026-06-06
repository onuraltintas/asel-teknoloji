using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AselTeknoloji.Application.DTOs.Auth;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IGenericRepository<User> _userRepo;
    private readonly IConfiguration           _config;
    private readonly IEmailService             _email;
    private readonly IMemoryCache              _cache;

    public AuthController(
        IGenericRepository<User> userRepo,
        IConfiguration config,
        IEmailService email,
        IMemoryCache cache)
    {
        _userRepo = userRepo;
        _config   = config;
        _email    = email;
        _cache    = cache;
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

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        // Güvenlik: kullanıcı var mı yok mu belli etme
        var user = await _userRepo.SingleOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);
        if (user is not null)
        {
            var token    = Guid.NewGuid().ToString("N");
            var cacheKey = $"reset:{token}";
            _cache.Set(cacheKey, user.Id.ToString(), TimeSpan.FromMinutes(30));

            var siteUrl  = _config["SiteUrl"] ?? "http://localhost:4200";
            var resetUrl = $"{siteUrl}/admin/reset-password?token={token}";

            await _email.SendAsync(
                user.Email,
                "Şifre Sıfırlama | Asel Teknoloji",
                $"""
                <p>Merhaba <b>{user.Username}</b>,</p>
                <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
                <p><a href="{resetUrl}" style="color:#1d4ed8">Şifremi Sıfırla</a></p>
                <p>Bu bağlantı <b>30 dakika</b> geçerlidir.</p>
                <p>Bu isteği siz yapmadıysanız bu e-postayı dikkate almayın.</p>
                """);
        }

        return Ok(new { message = "E-posta adresinizde kayıtlı bir hesap varsa sıfırlama bağlantısı gönderildi." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var cacheKey = $"reset:{dto.Token}";
        if (!_cache.TryGetValue(cacheKey, out string? userId) || userId is null)
            return BadRequest(new { error = "Geçersiz veya süresi dolmuş sıfırlama bağlantısı." });

        var guid = Guid.TryParse(userId, out var g) ? g : Guid.Empty;
        var user = await _userRepo.SingleOrDefaultAsync(u => u.Id == guid);
        if (user is null)
            return BadRequest(new { error = "Kullanıcı bulunamadı." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        _userRepo.Update(user);
        await _userRepo.SaveChangesAsync();

        _cache.Remove(cacheKey);
        return Ok(new { message = "Şifreniz başarıyla güncellendi." });
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
