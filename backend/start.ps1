# ============================================================
# Asel Teknoloji - Kurulum ve Baslat
# Calistir: .\start.ps1
# ============================================================

$ErrorActionPreference = "Continue"
$ROOT   = $PSScriptRoot
$SLN    = "AselTeknoloji"
$WEBAPI = "$SLN.WebAPI"
$INFRA  = "$SLN.Infrastructure"

function Log($msg)  { Write-Host "[OK] $msg" -ForegroundColor Green }
function Info($msg) { Write-Host "[>>] $msg" -ForegroundColor Cyan }
function Warn($msg) { Write-Host "[!!] $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "[XX] $msg" -ForegroundColor Red; exit 1 }

Set-Location $ROOT

# ── .NET versiyonu algilama ────────────────────────────────────
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Fail ".NET SDK bulunamadi. https://dotnet.microsoft.com/download adresinden kurun."
}
$dotnetVer = dotnet --version
$tfm = "net" + ($dotnetVer -replace '^(\d+)\..*', '$1') + ".0"
Log ".NET $dotnetVer bulundu -- hedef cerceve: $tfm"

# ── Solution yoksa olustur ────────────────────────────────────
$slnFile = if (Test-Path (Join-Path $ROOT "$SLN.slnx")) { "$SLN.slnx" }
           elseif (Test-Path (Join-Path $ROOT "$SLN.sln")) { "$SLN.sln" }
           else { $null }

if (-not $slnFile) {
    Info "Solution olusturuluyor ($tfm)..."

    dotnet new sln -n $SLN
    $slnFile = if (Test-Path (Join-Path $ROOT "$SLN.slnx")) { "$SLN.slnx" } else { "$SLN.sln" }
    dotnet new classlib -n "$SLN.Domain"         -f $tfm --force
    dotnet new classlib -n "$SLN.Application"    -f $tfm --force
    dotnet new classlib -n "$SLN.Infrastructure" -f $tfm --force
    dotnet new webapi   -n "$SLN.WebAPI"         -f $tfm --no-openapi --force

    dotnet sln add "$SLN.Domain/$SLN.Domain.csproj"
    dotnet sln add "$SLN.Application/$SLN.Application.csproj"
    dotnet sln add "$SLN.Infrastructure/$SLN.Infrastructure.csproj"
    dotnet sln add "$SLN.WebAPI/$SLN.WebAPI.csproj"

    dotnet add "$SLN.Application/$SLN.Application.csproj"       reference "$SLN.Domain/$SLN.Domain.csproj"
    dotnet add "$SLN.Infrastructure/$SLN.Infrastructure.csproj" reference "$SLN.Application/$SLN.Application.csproj"
    dotnet add "$SLN.WebAPI/$SLN.WebAPI.csproj"                 reference "$SLN.Infrastructure/$SLN.Infrastructure.csproj"

    Info "NuGet paketleri yukleniyor..."
    dotnet add "$INFRA/$INFRA.csproj" package Npgsql.EntityFrameworkCore.PostgreSQL
    dotnet add "$INFRA/$INFRA.csproj" package Microsoft.EntityFrameworkCore.Design
    dotnet add "$INFRA/$INFRA.csproj" package BCrypt.Net-Next
    dotnet add "$WEBAPI/$WEBAPI.csproj" package Microsoft.AspNetCore.Authentication.JwtBearer
    dotnet add "$WEBAPI/$WEBAPI.csproj" package Microsoft.AspNetCore.OpenApi
    dotnet add "$WEBAPI/$WEBAPI.csproj" package Swashbuckle.AspNetCore
    dotnet add "$WEBAPI/$WEBAPI.csproj" package Microsoft.EntityFrameworkCore.Design

    Get-ChildItem -Recurse -Filter "Class1.cs" | Remove-Item -Force
    Log "Solution olusturuldu ($slnFile)"
} else {
    Log "Mevcut solution bulundu: $slnFile"
}

# ── Klasor yapisi ─────────────────────────────────────────────
@(
    "$SLN.Domain/Entities",
    "$SLN.Application/DTOs/Auth",
    "$SLN.Application/Interfaces",
    "$SLN.Infrastructure/Data",
    "$SLN.Infrastructure/Repositories",
    "$WEBAPI/Controllers",
    "$WEBAPI/Middlewares",
    "$WEBAPI/Properties"
) | ForEach-Object { New-Item -ItemType Directory -Force -Path (Join-Path $ROOT $_) | Out-Null }

# ── JWT Key otomatik olustur ──────────────────────────────────
$settingsPath = Join-Path $ROOT "$WEBAPI/appsettings.json"
if (Test-Path $settingsPath) {
    $raw = Get-Content $settingsPath -Raw
    if ($raw -match "BURAYA_EN_AZ_32_KARAKTER") {
        $key = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
        $raw = $raw -replace "BURAYA_EN_AZ_32_KARAKTER_GIZLI_ANAHTAR_YAZ", $key
        Set-Content $settingsPath $raw -Encoding UTF8
        Log "JWT Key otomatik olusturuldu"
    }
    if ($raw -match "YOUR_PASSWORD") {
        Warn "appsettings.json icinde 'YOUR_PASSWORD' hala var -- PostgreSQL sifrenizi yazin!"
    }
}

# ── Gerekli paketleri ekle (mevcut projede eksikse) ───────────
$webapiCsproj = Join-Path $ROOT "$WEBAPI/$WEBAPI.csproj"
if (Test-Path $webapiCsproj) {
    $csproj = Get-Content $webapiCsproj -Raw
    if ($csproj -notmatch "Microsoft.AspNetCore.OpenApi") {
        dotnet add $webapiCsproj package Microsoft.AspNetCore.OpenApi 2>$null
        Log "Microsoft.AspNetCore.OpenApi eklendi"
    }
    if ($csproj -notmatch "Swashbuckle") {
        dotnet add $webapiCsproj package Swashbuckle.AspNetCore 2>$null
        Log "Swashbuckle eklendi"
    }
}

# ── Program.cs'i her zaman bizim versiyonumuzla yaz ───────────
$programCs = Join-Path $ROOT "$WEBAPI/Program.cs"
Info "Program.cs yaziliyor..."
Set-Content $programCs -Encoding UTF8 -Value @'
using System.Text;
using AselTeknoloji.Application.Interfaces;
using AselTeknoloji.Infrastructure.Data;
using AselTeknoloji.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Veritabani
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

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

// Controllers + .NET 10 built-in OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// OpenAPI / Swagger UI (.NET 10 native)
app.MapOpenApi();                         // /openapi/v1.json
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/openapi/v1.json", "Asel Teknoloji API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Otomatik migration
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    Console.WriteLine("[OK] Veritabani migration tamamlandi.");
}
catch (Exception ex)
{
    Console.WriteLine($"[!!] Migration hatasi: {ex.Message}");
}

Console.WriteLine("========================================");
Console.WriteLine(" Asel Teknoloji API hazir");
Console.WriteLine(" Swagger: /swagger");
Console.WriteLine(" OpenAPI JSON: /openapi/v1.json");
Console.WriteLine("========================================");

app.Run();
'@
Log "Program.cs yazildi"

# appsettings.json'u WebAPI klasorune kopyala (factory icin)
$srcSettings = Join-Path $ROOT "$WEBAPI/appsettings.json"
$infraDir    = Join-Path $ROOT $INFRA
if (Test-Path $srcSettings) {
    Copy-Item $srcSettings (Join-Path $infraDir "appsettings.json") -Force
    Copy-Item (Join-Path $ROOT "$WEBAPI/appsettings.Development.json") (Join-Path $infraDir "appsettings.Development.json") -Force -ErrorAction SilentlyContinue
}

# ── EF Tool ──────────────────────────────────────────────────
dotnet tool install --global dotnet-ef 2>$null
dotnet tool update  --global dotnet-ef 2>$null
$env:PATH = "$env:USERPROFILE\.dotnet\tools;$env:PATH"

# ── Build ─────────────────────────────────────────────────────
Set-Location $ROOT
Info "Derleniyor..."
dotnet build (Join-Path $ROOT $slnFile) -c Debug --nologo
if ($LASTEXITCODE -ne 0) {
    Fail "Build basarisiz."
}
Log "Build basarili"

# ── Migration ─────────────────────────────────────────────────
Set-Location $ROOT
$migDir  = Join-Path $ROOT "$INFRA/Migrations"
$hasMigs = (Test-Path $migDir) -and ((Get-ChildItem $migDir -Filter "*.cs" -ErrorAction SilentlyContinue).Count -gt 0)

$infraProj  = Join-Path $ROOT "$INFRA/$INFRA.csproj"
$webapiProj = Join-Path $ROOT "$WEBAPI/$WEBAPI.csproj"

if (-not $hasMigs) {
    Info "Migration olusturuluyor..."
    Set-Location (Join-Path $ROOT $INFRA)
    dotnet ef migrations add InitialCreate --project $infraProj --startup-project $webapiProj
    if ($LASTEXITCODE -ne 0) {
        Set-Location $ROOT
        Fail "Migration olusturulamadi. appsettings.json icindeki PostgreSQL sifresini kontrol edin."
    }
    dotnet ef database update --project $infraProj --startup-project $webapiProj
    if ($LASTEXITCODE -ne 0) {
        Set-Location $ROOT
        Fail "Veritabani guncellenemedi. PostgreSQL calistigini kontrol edin."
    }
    Set-Location $ROOT
    Log "Migration tamamlandi"
} else {
    Info "Migration mevcut, database update yapiliyor..."
    Set-Location (Join-Path $ROOT $INFRA)
    dotnet ef database update --project $infraProj --startup-project $webapiProj
    Set-Location $ROOT
    Log "Veritabani guncel"
}

# ── Baslat ────────────────────────────────────────────────────
Info ""
Info "========================================="
Info " API baslatiliyor..."
Info " Swagger: https://localhost:7102/swagger"
Info " HTTP:    http://localhost:5028"
Info " Durdurmak icin: Ctrl+C"
Info "========================================="

Set-Location (Join-Path $ROOT $WEBAPI)
dotnet run
