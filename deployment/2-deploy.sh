#!/bin/bash
# Asel Teknoloji — Derleme & Deploy
# Her güncellemede çalıştır: bash deployment/2-deploy.sh
set -euo pipefail

REPO_DIR="/opt/asel-teknoloji"
BACKEND_DIR="/var/www/asel-backend"
FRONTEND_DIR="$REPO_DIR/frontend/asel-teknoloji-ui"

echo "==> Repo güncelleniyor..."
cd $REPO_DIR
git pull origin main

# ── Backend ────────────────────────────────────────────────
echo "==> Backend derleniyor..."
dotnet publish \
    backend/AselTeknoloji.WebAPI/AselTeknoloji.WebAPI.csproj \
    -c Release \
    -o $BACKEND_DIR \
    --nologo \
    -q

# appsettings.Production.json korunuyor (gitignore'da, üzerine yazma)
echo "  Backend derlendi → $BACKEND_DIR"

# ── Frontend ───────────────────────────────────────────────
echo "==> Frontend bağımlılıkları yükleniyor..."
cd $FRONTEND_DIR
npm ci --silent

echo "==> Frontend derleniyor (SSR)..."
npm run build -- --configuration production

echo "  Frontend derlendi → $FRONTEND_DIR/dist/"

# ── Servisler ──────────────────────────────────────────────
echo "==> Servisler yeniden başlatılıyor..."
systemctl restart asel-backend
systemctl restart asel-frontend

# Durum kontrolü
sleep 3
echo ""
if systemctl is-active --quiet asel-backend; then
    echo "  ✓ asel-backend  — çalışıyor"
else
    echo "  ✗ asel-backend  — HATA! Log: journalctl -u asel-backend -n 50"
fi

if systemctl is-active --quiet asel-frontend; then
    echo "  ✓ asel-frontend — çalışıyor"
else
    echo "  ✗ asel-frontend — HATA! Log: journalctl -u asel-frontend -n 50"
fi

echo ""
echo "Deploy tamamlandı."
echo "Servis logları: journalctl -u asel-backend -f"
echo "              : journalctl -u asel-frontend -f"
