using System.Security.Claims;
using AselTeknoloji.Application.DTOs;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")]
public class UserController : ControllerBase
{
    private readonly IGenericRepository<User> _repo;

    public UserController(IGenericRepository<User> repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _repo.GetAllAsync();
        return Ok(users.OrderBy(u => u.CreatedAt).Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _repo.SingleOrDefaultAsync(u => u.Id == id);
        return user is null ? NotFound() : Ok(ToDto(user));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (!IsValidRole(dto.Role))
            return BadRequest(new { message = "Geçersiz rol. 'SuperAdmin' veya 'Admin' olmalıdır." });

        var existing = await _repo.SingleOrDefaultAsync(u => u.Username == dto.Username || u.Email == dto.Email);
        if (existing is not null)
            return Conflict(new { message = "Bu kullanıcı adı veya e-posta zaten kullanımda." });

        var user = new User
        {
            Username     = dto.Username.Trim(),
            Email        = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role         = dto.Role,
            IsActive     = dto.IsActive
        };

        await _repo.AddAsync(user);
        await _repo.SaveChangesAsync();
        return Ok(new { id = user.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (!IsValidRole(dto.Role))
            return BadRequest(new { message = "Geçersiz rol. 'SuperAdmin' veya 'Admin' olmalıdır." });

        var user = await _repo.SingleOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound();

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (currentUserId == id.ToString())
        {
            if (!dto.IsActive)
                return BadRequest(new { message = "Kendi hesabınızı devre dışı bırakamazsınız." });
            if (dto.Role != "SuperAdmin")
                return BadRequest(new { message = "Kendi rolünüzü düşüremezsiniz." });
        }

        if (user.Role == "SuperAdmin" && dto.Role != "SuperAdmin")
        {
            var superAdmins = (await _repo.GetAllAsync()).Count(u => u.Role == "SuperAdmin" && u.IsActive);
            if (superAdmins <= 1)
                return BadRequest(new { message = "Sistemde en az bir aktif SuperAdmin bulunmalıdır." });
        }

        var conflict = await _repo.SingleOrDefaultAsync(u => u.Id != id && (u.Username == dto.Username || u.Email == dto.Email));
        if (conflict is not null)
            return Conflict(new { message = "Bu kullanıcı adı veya e-posta zaten kullanımda." });

        user.Username = dto.Username.Trim();
        user.Email    = dto.Email.Trim().ToLower();
        user.Role     = dto.Role;
        user.IsActive = dto.IsActive;

        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        _repo.Update(user);
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _repo.SingleOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound();

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == id.ToString())
            return BadRequest(new { message = "Kendi hesabınızı silemezsiniz." });

        if (user.Role == "SuperAdmin")
        {
            var superAdmins = (await _repo.GetAllAsync()).Count(u => u.Role == "SuperAdmin" && u.IsActive);
            if (superAdmins <= 1)
                return BadRequest(new { message = "Sistemde en az bir aktif SuperAdmin bulunmalıdır." });
        }

        _repo.Remove(user);
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    private static UserResponseDto ToDto(User u) => new()
    {
        Id        = u.Id,
        Username  = u.Username,
        Email     = u.Email,
        Role      = u.Role,
        IsActive  = u.IsActive,
        CreatedAt = u.CreatedAt
    };

    private static bool IsValidRole(string role) => role is "SuperAdmin" or "Admin" or "Technician";
}
