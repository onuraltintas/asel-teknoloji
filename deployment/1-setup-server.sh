#!/bin/bash
# Asel Teknoloji — Sunucu Kurulum (AlmaLinux 9)
# Root ile tek seferlik çalıştır: bash deployment/1-setup-server.sh
set -euo pipefail

REPO_DIR="/opt/asel-teknoloji"
BACKEND_DIR="/var/www/asel-backend"
APP_USER="asel"

echo "==> Sistem güncelleniyor..."
dnf update -y -q

echo "==> Git kuruluyor..."
dnf install -y -q git

# ── .NET 10 ────────────────────────────────────────────────
echo "==> .NET 10 SDK kuruluyor..."
rpm --import https://packages.microsoft.com/keys/microsoft.asc 2>/dev/null || true
cat > /etc/yum.repos.d/microsoft-prod.repo << 'EOF'
[packages-microsoft-com-prod]
name=packages-microsoft-com-prod
baseurl=https://packages.microsoft.com/rhel/9/prod/
enabled=1
gpgcheck=1
gpgkey=https://packages.microsoft.com/keys/microsoft.asc
EOF
dnf install -y -q dotnet-sdk-10.0

# ── Node.js 22 ─────────────────────────────────────────────
echo "==> Node.js 22 kuruluyor..."
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash - >/dev/null
dnf install -y -q nodejs

# ── PostgreSQL 16 ──────────────────────────────────────────
echo "==> PostgreSQL 16 kuruluyor..."
dnf install -y -q https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm 2>/dev/null || true
dnf -qy module disable postgresql 2>/dev/null || true
dnf install -y -q postgresql16-server postgresql16

if [ ! -f /var/lib/pgsql/16/data/PG_VERSION ]; then
    /usr/pgsql-16/bin/postgresql-16-setup initdb
fi

# pg_hba.conf: password auth
sed -i 's/^local\s\+all\s\+all\s\+peer/local   all             all                                     md5/' \
    /var/lib/pgsql/16/data/pg_hba.conf 2>/dev/null || true

systemctl enable --now postgresql-16

echo "==> PostgreSQL kullanıcı ve veritabanı oluşturuluyor..."
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 20)
sudo -u postgres psql -c "CREATE USER asel_db WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || \
    sudo -u postgres psql -c "ALTER USER asel_db WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE asel_teknoloji OWNER asel_db;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE asel_teknoloji TO asel_db;" 2>/dev/null || true

echo ""
echo "  *** PostgreSQL bilgileri ***"
echo "  Kullanıcı  : asel_db"
echo "  Şifre      : $DB_PASSWORD   ← Bu şifreyi not al!"
echo "  Veritabanı : asel_teknoloji"
echo ""

# ── Nginx ──────────────────────────────────────────────────
echo "==> Nginx kuruluyor..."
dnf install -y -q nginx
mkdir -p /var/www/certbot

# ── Certbot ────────────────────────────────────────────────
echo "==> Certbot kuruluyor..."
dnf install -y -q epel-release
dnf install -y -q certbot python3-certbot-nginx

# ── Uygulama kullanıcısı ───────────────────────────────────
echo "==> '$APP_USER' kullanıcısı oluşturuluyor..."
id -u $APP_USER &>/dev/null || useradd -r -s /sbin/nologin $APP_USER

# ── Dizinler ───────────────────────────────────────────────
echo "==> Dizinler oluşturuluyor..."
mkdir -p $BACKEND_DIR/wwwroot/uploads
mkdir -p /var/log/asel
chown -R $APP_USER:$APP_USER $BACKEND_DIR
chown -R $APP_USER:$APP_USER /var/log/asel

if [ -d "$REPO_DIR" ]; then
    chown -R $APP_USER:$APP_USER $REPO_DIR
fi

# ── SELinux ────────────────────────────────────────────────
echo "==> SELinux ayarlanıyor..."
dnf install -y -q policycoreutils-python-utils 2>/dev/null || true
setsebool -P httpd_can_network_connect 1 2>/dev/null || true
semanage fcontext -a -t httpd_sys_content_t "$BACKEND_DIR/wwwroot(/.*)?" 2>/dev/null || true
restorecon -R $BACKEND_DIR/wwwroot 2>/dev/null || true

# ── Firewall ───────────────────────────────────────────────
echo "==> Firewall ayarlanıyor..."
firewall-cmd --permanent --add-service=http  2>/dev/null || true
firewall-cmd --permanent --add-service=https 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

# ── Nginx config ───────────────────────────────────────────
echo "==> Nginx yapılandırılıyor..."

# Geçici HTTP-only config (SSL henüz yok)
cat > /etc/nginx/conf.d/asel-teknoloji.conf << 'NGINXEOF'
upstream angular_ssr { server 127.0.0.1:4000; }
upstream dotnet_api   { server 127.0.0.1:5013; }

server {
    listen 80;
    server_name aselteknoloji.net www.aselteknoloji.net;
    client_max_body_size 15M;

    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location /uploads/ { proxy_pass http://dotnet_api; proxy_set_header Host $host; expires 7d; }
    location /api/     { proxy_pass http://dotnet_api; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto http; }
    location ~ ^/(sitemap\.xml|robots\.txt|llms\.txt|llms-full\.txt)$ { proxy_pass http://dotnet_api; proxy_set_header Host $host; }
    location / { proxy_pass http://angular_ssr; proxy_set_header Host $host; proxy_read_timeout 60s; }
}
NGINXEOF

nginx -t && systemctl enable --now nginx

# ── Systemd servisler ──────────────────────────────────────
echo "==> Systemd servisleri yükleniyor..."
cp $REPO_DIR/deployment/asel-backend.service  /etc/systemd/system/
cp $REPO_DIR/deployment/asel-frontend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable asel-backend asel-frontend

# ── appsettings.Production.json şablonu ───────────────────
JWT_KEY=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 64)

cat > $BACKEND_DIR/appsettings.Production.json << SETTINGSEOF
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=asel_teknoloji;Username=asel_db;Password=$DB_PASSWORD"
  },
  "Jwt": {
    "Key": "$JWT_KEY",
    "Issuer": "AselTeknoloji",
    "Audience": "AselTeknoloji"
  },
  "AllowedOrigins": "https://aselteknoloji.net,https://www.aselteknoloji.net",
  "Smtp": {
    "Host": "",
    "Port": 587,
    "Username": "",
    "Password": "",
    "From": "",
    "FromName": "Asel Teknoloji"
  },
  "Recaptcha": {
    "SecretKey": ""
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
SETTINGSEOF

chown $APP_USER:$APP_USER $BACKEND_DIR/appsettings.Production.json
chmod 600 $BACKEND_DIR/appsettings.Production.json

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║            KURULUM TAMAMLANDI                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Sonraki adımlar:"
echo ""
echo "  1. appsettings.Production.json içine SMTP bilgilerini gir:"
echo "     nano $BACKEND_DIR/appsettings.Production.json"
echo ""
echo "  2. Uygulamayı derle ve başlat:"
echo "     bash $REPO_DIR/deployment/2-deploy.sh"
echo ""
echo "  3. DNS: aselteknoloji.net A kaydını bu sunucunun IP'sine yönlendir"
echo "     IP: $(curl -s ifconfig.me 2>/dev/null || echo '<sunucu-ip>')"
echo ""
echo "  4. DNS yayıldıktan sonra SSL al:"
echo "     certbot --nginx -d aselteknoloji.net -d www.aselteknoloji.net"
echo ""
