using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private static readonly Dictionary<string, (int W, int H)> Sizes = new()
    {
        ["slider"]    = (1920, 580),
        ["service"]   = (1200, 630),
        ["blog"]      = (1200, 630),
        ["reference"] = (400,  300),
        ["logo"]      = (400,  200),
        ["favicon"]   = (64,   64),
    };

    private static readonly HashSet<string> AllowedMime = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif"
    };

    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public UploadController(IWebHostEnvironment env, IConfiguration config)
    {
        _env    = env;
        _config = config;
    }

    [HttpPost("{type}")]
    public async Task<IActionResult> Upload(string type, IFormFile file)
    {
        if (!Sizes.ContainsKey(type))
            return BadRequest(new { error = "Geçersiz tip. Geçerli tipler: slider, service, blog, reference, logo" });

        if (file is null || file.Length == 0)
            return BadRequest(new { error = "Dosya boş." });

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { error = "Dosya 10 MB sınırını aşıyor." });

        if (!AllowedMime.Contains(file.ContentType))
            return BadRequest(new { error = "Sadece JPEG, PNG, WebP veya GIF yüklenebilir." });

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var folder  = Path.Combine(webRoot, "uploads", type);
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid():N}.webp";
        var filePath = Path.Combine(folder, fileName);

        var (w, h) = Sizes[type];
        using var image = await Image.LoadAsync(file.OpenReadStream());
        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Size = new Size(w, h),
            Mode = ResizeMode.Crop
        }));
        await image.SaveAsWebpAsync(filePath);

        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        return Ok(new { url = $"{baseUrl}/uploads/{type}/{fileName}" });
    }
}
