using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AselTeknoloji.Infrastructure.Data;

/// <summary>
/// EF Core migration araçlarının design-time'da DbContext oluşturabilmesi için.
/// Connection string'i EFCORE_CONNSTR ortam değişkeninden veya default değerden okur.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Önce ortam değişkenine bak, yoksa appsettings'ten oku
        var connStr = Environment.GetEnvironmentVariable("EFCORE_CONNSTR")
            ?? ReadConnectionStringFromJson();

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(connStr);

        return new AppDbContext(optionsBuilder.Options);
    }

    private static string ReadConnectionStringFromJson()
    {
        // WebAPI klasöründeki appsettings.json'u bul
        var searchDirs = new[]
        {
            Directory.GetCurrentDirectory(),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "AselTeknoloji.WebAPI"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "AselTeknoloji.WebAPI")
        };

        foreach (var dir in searchDirs)
        {
            var file = Path.Combine(dir, "appsettings.json");
            if (!File.Exists(file)) continue;

            var json = File.ReadAllText(file);
            // Basit string parse - JSON kütüphanesi gerektirmez
            var marker = "\"DefaultConnection\":";
            var idx = json.IndexOf(marker, StringComparison.Ordinal);
            if (idx < 0) continue;

            idx += marker.Length;
            var start = json.IndexOf('"', idx) + 1;
            var end   = json.IndexOf('"', start);
            if (start > 0 && end > start)
                return json[start..end];
        }

        // Fallback: yerel geliştirme için varsayılan
        return "Host=localhost;Port=5432;Database=asel_teknoloji;Username=postgres;Password=postgres";
    }
}
