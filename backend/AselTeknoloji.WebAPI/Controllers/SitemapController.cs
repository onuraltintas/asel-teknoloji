using System.Text;
using System.Text.RegularExpressions;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AselTeknoloji.WebAPI.Controllers;

[ApiController]
public class SitemapController : ControllerBase
{
    private readonly IGenericRepository<Service>  _serviceRepo;
    private readonly IGenericRepository<BlogPost> _blogRepo;
    private readonly IGenericRepository<Setting>  _settingRepo;
    private readonly IConfiguration _config;

    public SitemapController(
        IGenericRepository<Service>  serviceRepo,
        IGenericRepository<BlogPost> blogRepo,
        IGenericRepository<Setting>  settingRepo,
        IConfiguration config)
    {
        _serviceRepo = serviceRepo;
        _blogRepo    = blogRepo;
        _settingRepo = settingRepo;
        _config      = config;
    }

    [HttpGet("/sitemap.xml")]
    public async Task<IActionResult> Sitemap()
    {
        var baseUrl  = _config["SiteUrl"] ?? "https://aseltekno.com";
        var services = await _serviceRepo.FindAsync(s => s.IsActive);
        var blogs    = await _blogRepo.FindAsync(b => b.IsActive);

        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

        void AddUrl(string loc, string freq, string priority, DateTime? lastmod = null)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>{baseUrl}{loc}</loc>");
            if (lastmod.HasValue)
                sb.AppendLine($"    <lastmod>{lastmod.Value:yyyy-MM-dd}</lastmod>");
            sb.AppendLine($"    <changefreq>{freq}</changefreq>");
            sb.AppendLine($"    <priority>{priority}</priority>");
            sb.AppendLine("  </url>");
        }

        AddUrl("/",               "weekly",  "1.0");
        AddUrl("/hizmetler",      "weekly",  "0.9");
        AddUrl("/blog",           "weekly",  "0.8");
        AddUrl("/iletisim",       "monthly", "0.7");
        AddUrl("/servis-takip",   "monthly", "0.7");

        foreach (var s in services)
            AddUrl($"/hizmet/{s.Slug}", "monthly", "0.8");

        foreach (var b in blogs)
            AddUrl($"/blog/{b.Slug}", "weekly", "0.7", b.UpdatedAt ?? b.CreatedAt);

        sb.AppendLine("</urlset>");
        return Content(sb.ToString(), "application/xml", Encoding.UTF8);
    }

    [HttpGet("/robots.txt")]
    public IActionResult Robots()
    {
        var baseUrl = _config["SiteUrl"] ?? "https://aseltekno.com";
        var content = $"""
            User-agent: *
            Disallow: /admin
            Disallow: /api/

            Sitemap: {baseUrl}/sitemap.xml
            """;
        return Content(content, "text/plain");
    }

    [HttpGet("/llms.txt")]
    public async Task<IActionResult> LlmsTxt()
    {
        var baseUrl  = _config["SiteUrl"] ?? "https://aseltekno.com";
        var services = await _serviceRepo.FindAsync(s => s.IsActive);
        var blogs    = await _blogRepo.FindAsync(b => b.IsActive);
        var setting  = (await _settingRepo.GetAllAsync()).FirstOrDefault();

        var sb = new StringBuilder();
        sb.AppendLine("# Asel Teknoloji");
        sb.AppendLine();
        sb.AppendLine($"> {setting?.Description ?? "Güvenlik kamera, yangın alarm, internet altyapı sistemleri, teknik servis ve bilişim çözümleri sunan kurumsal teknoloji firması."}");
        sb.AppendLine();

        sb.AppendLine("## Hizmetler");
        foreach (var s in services)
            sb.AppendLine($"- [{s.Title}]({baseUrl}/hizmet/{s.Slug}): {s.ShortDescription}");
        sb.AppendLine();

        if (blogs.Any())
        {
            sb.AppendLine("## Blog");
            foreach (var b in blogs.OrderByDescending(b => b.CreatedAt).Take(10))
                sb.AppendLine($"- [{b.Title}]({baseUrl}/blog/{b.Slug})");
            sb.AppendLine();
        }

        sb.AppendLine("## Teknik Servis Takibi");
        sb.AppendLine($"Cihaz durumunuzu sorgulayın: [{baseUrl}/servis-takip]({baseUrl}/servis-takip)");
        sb.AppendLine();

        sb.AppendLine("## İletişim");
        sb.AppendLine($"Web: [{baseUrl}]({baseUrl})");
        sb.AppendLine($"İletişim formu: [{baseUrl}/iletisim]({baseUrl}/iletisim)");
        if (!string.IsNullOrEmpty(setting?.Phone)) sb.AppendLine($"Telefon: {setting.Phone}");
        if (!string.IsNullOrEmpty(setting?.Email)) sb.AppendLine($"E-posta: {setting.Email}");
        if (!string.IsNullOrEmpty(setting?.Address)) sb.AppendLine($"Adres: {setting.Address}");

        return Content(sb.ToString(), "text/plain; charset=utf-8");
    }

    [HttpGet("/llms-full.txt")]
    public async Task<IActionResult> LlmsFullTxt()
    {
        var baseUrl  = _config["SiteUrl"] ?? "https://aseltekno.com";
        var services = await _serviceRepo.FindAsync(s => s.IsActive);
        var blogs    = await _blogRepo.FindAsync(b => b.IsActive);
        var setting  = (await _settingRepo.GetAllAsync()).FirstOrDefault();

        var sb = new StringBuilder();
        sb.AppendLine("# Asel Teknoloji — Tam İçerik");
        sb.AppendLine();
        sb.AppendLine($"> {setting?.Description ?? "Güvenlik kamera, yangın alarm, internet altyapı sistemleri, teknik servis ve bilişim çözümleri sunan kurumsal teknoloji firması."}");
        sb.AppendLine();

        sb.AppendLine("## Hizmetler");
        foreach (var s in services)
        {
            sb.AppendLine($"### {s.Title}");
            sb.AppendLine($"URL: {baseUrl}/hizmet/{s.Slug}");
            if (!string.IsNullOrEmpty(s.ShortDescription))
                sb.AppendLine(s.ShortDescription);
            if (!string.IsNullOrEmpty(s.Description))
                sb.AppendLine(StripHtml(s.Description));
            sb.AppendLine();
        }

        if (blogs.Any())
        {
            sb.AppendLine("## Blog Yazıları");
            foreach (var b in blogs.OrderByDescending(b => b.CreatedAt))
            {
                sb.AppendLine($"### {b.Title}");
                sb.AppendLine($"URL: {baseUrl}/blog/{b.Slug}");
                sb.AppendLine($"Tarih: {b.CreatedAt:yyyy-MM-dd}");
                if (!string.IsNullOrEmpty(b.Content))
                    sb.AppendLine(StripHtml(b.Content));
                sb.AppendLine();
            }
        }

        return Content(sb.ToString(), "text/plain; charset=utf-8");
    }

    private static string StripHtml(string html) =>
        Regex.Replace(html, "<[^>]+>", " ").Replace("&nbsp;", " ").Replace("&amp;", "&")
             .Replace("&lt;", "<").Replace("&gt;", ">").Replace("  ", " ").Trim();
}
