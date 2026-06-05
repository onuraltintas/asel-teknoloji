# ============================================================
# Asel Teknoloji – Backend Scaffold Script
# Clean Architecture: Domain / Application / Infrastructure / WebAPI
# Çalıştır: PowerShell'de  .\setup.ps1
# ============================================================

$sln = "AselTeknoloji"
$projects = @(
    "$sln.Domain",
    "$sln.Application",
    "$sln.Infrastructure",
    "$sln.WebAPI"
)

Write-Host "Çözüm oluşturuluyor..." -ForegroundColor Cyan
dotnet new sln -n $sln

# Projeleri oluştur
dotnet new classlib -n "$sln.Domain"         -f net8.0
dotnet new classlib -n "$sln.Application"    -f net8.0
dotnet new classlib -n "$sln.Infrastructure" -f net8.0
dotnet new webapi   -n "$sln.WebAPI"         -f net8.0 --no-openapi

# Solution'a ekle
foreach ($p in $projects) {
    dotnet sln add "$p/$p.csproj"
}

# Proje referansları
dotnet add "$sln.Application/AselTeknoloji.Application.csproj"    reference "$sln.Domain/AselTeknoloji.Domain.csproj"
dotnet add "$sln.Infrastructure/AselTeknoloji.Infrastructure.csproj" reference "$sln.Application/AselTeknoloji.Application.csproj"
dotnet add "$sln.WebAPI/AselTeknoloji.WebAPI.csproj"              reference "$sln.Infrastructure/AselTeknoloji.Infrastructure.csproj"

# NuGet paketleri
Write-Host "Paketler yükleniyor..." -ForegroundColor Cyan

# Infrastructure
dotnet add "$sln.Infrastructure/$sln.Infrastructure.csproj" package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add "$sln.Infrastructure/$sln.Infrastructure.csproj" package Microsoft.EntityFrameworkCore.Design
dotnet add "$sln.Infrastructure/$sln.Infrastructure.csproj" package BCrypt.Net-Next

# WebAPI
dotnet add "$sln.WebAPI/$sln.WebAPI.csproj" package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add "$sln.WebAPI/$sln.WebAPI.csproj" package Swashbuckle.AspNetCore
dotnet add "$sln.WebAPI/$sln.WebAPI.csproj" package Microsoft.EntityFrameworkCore.Design

# Klasör yapısını oluştur
$folders = @(
    "$sln.Domain/Entities",
    "$sln.Domain/Interfaces",
    "$sln.Application/DTOs",
    "$sln.Application/Interfaces",
    "$sln.Application/Services",
    "$sln.Infrastructure/Data",
    "$sln.Infrastructure/Data/Configurations",
    "$sln.Infrastructure/Repositories",
    "$sln.Infrastructure/Services",
    "$sln.WebAPI/Controllers",
    "$sln.WebAPI/Middlewares"
)

foreach ($f in $folders) {
    New-Item -ItemType Directory -Force -Path $f | Out-Null
}

# Varsayılan Class1.cs dosyalarını sil
Get-ChildItem -Recurse -Filter "Class1.cs" | Remove-Item -Force

Write-Host ""
Write-Host "Scaffold tamamlandı!" -ForegroundColor Green
Write-Host "Klasör yapısı hazır. Şimdi kod dosyalarını ilgili klasörlere koyabilirsiniz." -ForegroundColor Green
Write-Host ""
Write-Host "Sonraki adım – Migration oluşturmak için:" -ForegroundColor Yellow
Write-Host "  cd $sln.WebAPI" -ForegroundColor White
Write-Host "  dotnet ef migrations add InitialCreate --project ../$sln.Infrastructure/$sln.Infrastructure.csproj" -ForegroundColor White
Write-Host "  dotnet ef database update" -ForegroundColor White
