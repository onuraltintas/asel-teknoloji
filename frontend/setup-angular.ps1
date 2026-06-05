# ============================================================
# Asel Teknoloji – Angular Frontend Kurulum
# Calistir: .\setup-angular.ps1
# ============================================================

$ErrorActionPreference = "Continue"
$ROOT    = $PSScriptRoot
$PROJECT = "asel-teknoloji-ui"

function Log($m)  { Write-Host "[OK] $m" -ForegroundColor Green }
function Info($m) { Write-Host "[>>] $m" -ForegroundColor Cyan }
function Fail($m) { Write-Host "[XX] $m" -ForegroundColor Red; exit 1 }

# Angular CLI kontrolu
if (-not (Get-Command ng -ErrorAction SilentlyContinue)) {
    Info "Angular CLI kuruluyor..."
    npm install -g @angular/cli
}
Log "Angular CLI: $(ng version --skip-git 2>$null | Select-String 'Angular CLI' | Head -1)"

# Proje yoksa olustur
if (-not (Test-Path (Join-Path $ROOT $PROJECT))) {
    Info "Angular projesi olusturuluyor..."
    Set-Location $ROOT
    ng new $PROJECT --routing --style=css --standalone --skip-git --skip-tests --no-interactive
    Log "Proje olusturuldu"
} else {
    Log "Mevcut proje bulundu"
}

Set-Location (Join-Path $ROOT $PROJECT)

# Tailwind CSS
Info "Tailwind CSS kuruluyor..."
npm install -D tailwindcss @tailwindcss/forms postcss autoprefixer
npx tailwindcss init -p 2>$null

# tailwind.config.js
Set-Content "tailwind.config.js" @'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#1e40af', hover: '#1d4ed8' },
        secondary: { DEFAULT: '#64748b' },
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
'@

# global styles.css'e Tailwind ekle
Set-Content "src/styles.css" @'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Ozel stiller */
.btn-primary   { @apply bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded transition; }
.btn-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded transition; }
.btn-danger    { @apply bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded transition; }
.card          { @apply bg-white rounded-lg shadow p-6; }
.input         { @apply w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500; }
.label         { @apply block text-sm font-medium text-gray-700 mb-1; }
'@

Log "Tailwind kurulumu tamamlandi"

# Gerekli paketler
Info "Paketler yukleniyor..."
npm install @auth0/angular-jwt

Log "Kurulum tamamlandi!"
Info "Baslat: cd $PROJECT && ng serve"
