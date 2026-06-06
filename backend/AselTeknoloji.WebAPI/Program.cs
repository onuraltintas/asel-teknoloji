using System.Text;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Infrastructure.Data;
using AselTeknoloji.Infrastructure.Repositories;
using AselTeknoloji.Infrastructure.Services;
using AselTeknoloji.WebAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

// ─── Serilog ──────────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning)
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 30)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

// Veritabani
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

// E-posta servisi
builder.Services.AddScoped<IEmailService, SmtpEmailService>();

// reCAPTCHA + HTTP istemcisi
builder.Services.AddHttpClient();
builder.Services.AddScoped<RecaptchaService>();

// Bellek önbelleği (şifre sıfırlama tokenleri)
builder.Services.AddMemoryCache();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key appsettings.json icinde tanimlanmamis.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS
var allowedOrigins = (builder.Configuration["AllowedOrigins"] ?? "http://localhost:4200").Split(',');
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod());
});

// Output Cache — public endpoint'ler için 5 dakika
builder.Services.AddOutputCache(opts =>
{
    opts.AddPolicy("public5m", p => p
        .Expire(TimeSpan.FromMinutes(5))
        .SetVaryByQuery("*"));
});

// Controllers + .NET 10 built-in OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Dosya yükleme - max 10 MB
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 10 * 1024 * 1024;
});

var app = builder.Build();

// OpenAPI / Swagger UI (.NET 10 native)
app.MapOpenApi();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/openapi/v1.json", "Asel Teknoloji API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAngular");
app.UseOutputCache();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Otomatik migration
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    Log.Information("Veritabani migration tamamlandi.");
}
catch (Exception ex)
{
    Log.Error(ex, "Migration hatasi.");
}

Log.Information("Asel Teknoloji API hazir. Swagger: /swagger");
app.Run();
