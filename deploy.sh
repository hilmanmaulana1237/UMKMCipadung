#!/bin/bash
#===============================================================================
#  MUDAPRENEUR.AI - Script Deploy VPS Otomatis
#  Domain: umkmcipadung.com
#  Stack: Laravel 12 + Inertia.js + React + Nginx + PHP 8.3 + SQLite + SSL
#===============================================================================
#
#  CARA PAKAI:
#  1. Upload file ini ke VPS
#  2. chmod +x deploy.sh
#  3. sudo bash deploy.sh
#
#  SEBELUM MENJALANKAN:
#  - Pastikan domain umkmcipadung.com sudah pointing ke IP VPS
#  - Pastikan VPS menggunakan Ubuntu 22.04/24.04
#  - Pastikan punya akses root/sudo
#
#===============================================================================

set -euo pipefail

# ======================== KONFIGURASI ========================
DOMAIN="umkmcipadung.com"
APP_NAME="mudapreneur"
APP_DIR="/var/www/${APP_NAME}"
GIT_REPO=""  # <-- ISI DENGAN URL REPO GIT KAMU (contoh: https://github.com/user/repo.git)
GIT_BRANCH="main"
PHP_VERSION="8.3"
NODE_VERSION="20"
SWAP_SIZE="2G"
DB_TYPE="sqlite"  # Menggunakan SQLite sesuai .env
TIMEZONE="Asia/Jakarta"

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ======================== FUNGSI HELPER ========================
print_header() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}$1${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "  ${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "  ${GREEN}✔${NC} $1"
}

print_warning() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "  ${RED}✘${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Script ini harus dijalankan sebagai root (sudo bash deploy.sh)"
        exit 1
    fi
}

# ======================== KONFIRMASI AWAL ========================
show_config() {
    print_header "MUDAPRENEUR.AI - VPS Deployment Script"
    echo -e "  Domain      : ${GREEN}${DOMAIN}${NC}"
    echo -e "  App Dir     : ${GREEN}${APP_DIR}${NC}"
    echo -e "  PHP Version : ${GREEN}${PHP_VERSION}${NC}"
    echo -e "  Node Version: ${GREEN}${NODE_VERSION}${NC}"
    echo -e "  Database    : ${GREEN}${DB_TYPE}${NC}"
    echo -e "  Timezone    : ${GREEN}${TIMEZONE}${NC}"
    echo ""

    if [[ -z "$GIT_REPO" ]]; then
        print_warning "GIT_REPO belum diisi! Kamu harus upload source code manual."
        print_warning "Atau edit script ini dan isi variabel GIT_REPO."
        echo ""
    fi

    read -p "  Lanjutkan instalasi? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "  Instalasi dibatalkan."
        exit 1
    fi
}

# ======================== 1. SETUP SISTEM ========================
setup_system() {
    print_header "1/9 - Setup Sistem & Update Packages"

    print_step "Setting timezone ke ${TIMEZONE}..."
    timedatectl set-timezone ${TIMEZONE}

    print_step "Update & upgrade packages..."
    apt update -y && apt upgrade -y

    print_step "Install packages dasar..."
    apt install -y \
        curl \
        wget \
        git \
        unzip \
        zip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        acl \
        ufw \
        htop \
        supervisor \
        cron

    print_success "Sistem berhasil di-setup"
}

# ======================== 2. SETUP SWAP ========================
setup_swap() {
    print_header "2/9 - Setup Swap Memory"

    if [[ -f /swapfile ]]; then
        print_warning "Swap sudah ada, skip..."
        return
    fi

    print_step "Membuat swapfile ${SWAP_SIZE}..."
    fallocate -l ${SWAP_SIZE} /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile

    # Persist swap
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    echo 'vm.swappiness=10' | tee -a /etc/sysctl.conf
    sysctl -p

    print_success "Swap ${SWAP_SIZE} berhasil dibuat"
}

# ======================== 3. INSTALL PHP ========================
install_php() {
    print_header "3/9 - Install PHP ${PHP_VERSION} & Extensions"

    print_step "Menambahkan repository PHP..."
    add-apt-repository -y ppa:ondrej/php
    apt update -y

    print_step "Install PHP ${PHP_VERSION} dan extensions..."
    apt install -y \
        php${PHP_VERSION}-fpm \
        php${PHP_VERSION}-cli \
        php${PHP_VERSION}-common \
        php${PHP_VERSION}-mysql \
        php${PHP_VERSION}-sqlite3 \
        php${PHP_VERSION}-xml \
        php${PHP_VERSION}-curl \
        php${PHP_VERSION}-gd \
        php${PHP_VERSION}-mbstring \
        php${PHP_VERSION}-zip \
        php${PHP_VERSION}-bcmath \
        php${PHP_VERSION}-intl \
        php${PHP_VERSION}-readline \
        php${PHP_VERSION}-tokenizer \
        php${PHP_VERSION}-fileinfo \
        php${PHP_VERSION}-imagick \
        php${PHP_VERSION}-redis \
        php${PHP_VERSION}-opcache

    # Konfigurasi PHP untuk production
    print_step "Konfigurasi PHP untuk production..."
    PHP_INI="/etc/php/${PHP_VERSION}/fpm/php.ini"
    PHP_INI_CLI="/etc/php/${PHP_VERSION}/cli/php.ini"

    # FPM config
    sed -i "s/upload_max_filesize = .*/upload_max_filesize = 64M/" ${PHP_INI}
    sed -i "s/post_max_size = .*/post_max_size = 64M/" ${PHP_INI}
    sed -i "s/memory_limit = .*/memory_limit = 512M/" ${PHP_INI}
    sed -i "s/max_execution_time = .*/max_execution_time = 120/" ${PHP_INI}
    sed -i "s/max_input_time = .*/max_input_time = 120/" ${PHP_INI}
    sed -i "s/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/" ${PHP_INI}

    # OPcache config
    sed -i "s/;opcache.enable=.*/opcache.enable=1/" ${PHP_INI}
    sed -i "s/;opcache.memory_consumption=.*/opcache.memory_consumption=256/" ${PHP_INI}
    sed -i "s/;opcache.interned_strings_buffer=.*/opcache.interned_strings_buffer=16/" ${PHP_INI}
    sed -i "s/;opcache.max_accelerated_files=.*/opcache.max_accelerated_files=20000/" ${PHP_INI}
    sed -i "s/;opcache.validate_timestamps=.*/opcache.validate_timestamps=0/" ${PHP_INI}

    # PHP-FPM pool config
    print_step "Konfigurasi PHP-FPM pool..."
    FPM_POOL="/etc/php/${PHP_VERSION}/fpm/pool.d/www.conf"
    sed -i "s/pm = dynamic/pm = dynamic/" ${FPM_POOL}
    sed -i "s/pm.max_children = .*/pm.max_children = 20/" ${FPM_POOL}
    sed -i "s/pm.start_servers = .*/pm.start_servers = 4/" ${FPM_POOL}
    sed -i "s/pm.min_spare_servers = .*/pm.min_spare_servers = 2/" ${FPM_POOL}
    sed -i "s/pm.max_spare_servers = .*/pm.max_spare_servers = 6/" ${FPM_POOL}

    systemctl restart php${PHP_VERSION}-fpm
    systemctl enable php${PHP_VERSION}-fpm

    print_success "PHP ${PHP_VERSION} berhasil diinstall & dikonfigurasi"
}

# ======================== 4. INSTALL COMPOSER ========================
install_composer() {
    print_header "4/9 - Install Composer"

    if command -v composer &> /dev/null; then
        print_warning "Composer sudah terinstall, update..."
        composer self-update
    else
        print_step "Download & install Composer..."
        curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    fi

    print_success "Composer $(composer --version 2>/dev/null | head -1) berhasil diinstall"
}

# ======================== 5. INSTALL NODE.JS ========================
install_nodejs() {
    print_header "5/9 - Install Node.js ${NODE_VERSION} & NPM"

    if command -v node &> /dev/null; then
        print_warning "Node.js sudah terinstall: $(node --version)"
    else
        print_step "Install Node.js ${NODE_VERSION} via NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt install -y nodejs
    fi

    print_success "Node.js $(node --version) & NPM $(npm --version) berhasil diinstall"
}

# ======================== 6. INSTALL & KONFIGURASI NGINX ========================
install_nginx() {
    print_header "6/9 - Install & Konfigurasi Nginx"

    print_step "Install Nginx..."
    apt install -y nginx

    # Buat konfigurasi Nginx untuk domain
    print_step "Membuat konfigurasi Nginx untuk ${DOMAIN}..."

    cat > /etc/nginx/sites-available/${APP_NAME} << 'NGINX_CONF'
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
    root APP_DIR_PLACEHOLDER/public;

    index index.php index.html;

    charset utf-8;

    # Gzip Compression
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/javascript
        application/json
        application/xml
        application/rss+xml
        text/css
        text/javascript
        text/plain
        text/xml
        image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Max upload size
    client_max_body_size 64M;

    # Laravel routing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/phpPHP_VERSION_PLACEHOLDER-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 120;
    }

    # Assets caching (Vite build output)
    location /build/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Storage files
    location /storage/ {
        expires 7d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    # Favicon & robots
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # Deny hidden files
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Deny access to sensitive files
    location ~ /\.env {
        deny all;
    }

    # Error pages
    error_page 404 /index.php;

    # Logging
    access_log /var/log/nginx/DOMAIN_PLACEHOLDER-access.log;
    error_log  /var/log/nginx/DOMAIN_PLACEHOLDER-error.log;
}
NGINX_CONF

    # Replace placeholders
    sed -i "s|DOMAIN_PLACEHOLDER|${DOMAIN}|g" /etc/nginx/sites-available/${APP_NAME}
    sed -i "s|APP_DIR_PLACEHOLDER|${APP_DIR}|g" /etc/nginx/sites-available/${APP_NAME}
    sed -i "s|PHP_VERSION_PLACEHOLDER|${PHP_VERSION}|g" /etc/nginx/sites-available/${APP_NAME}

    # Enable site
    ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # Optimasi Nginx
    print_step "Optimasi Nginx..."
    cat > /etc/nginx/nginx.conf << 'NGINX_MAIN'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 64M;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
NGINX_MAIN

    # Test & restart Nginx
    nginx -t
    systemctl restart nginx
    systemctl enable nginx

    print_success "Nginx berhasil diinstall & dikonfigurasi"
}

# ======================== 7. DEPLOY APLIKASI ========================
deploy_app() {
    print_header "7/9 - Deploy Aplikasi Laravel"

    # Buat direktori
    print_step "Membuat direktori aplikasi..."
    mkdir -p ${APP_DIR}

    if [[ -n "$GIT_REPO" ]]; then
        print_step "Clone repository..."
        if [[ -d "${APP_DIR}/.git" ]]; then
            cd ${APP_DIR}
            git fetch origin
            git reset --hard origin/${GIT_BRANCH}
        else
            git clone -b ${GIT_BRANCH} ${GIT_REPO} ${APP_DIR}
        fi
    else
        print_warning "========================================================="
        print_warning "GIT_REPO kosong! Upload source code kamu ke ${APP_DIR}"
        print_warning "Contoh: scp -r ./* root@IP_VPS:${APP_DIR}/"
        print_warning "========================================================="

        if [[ ! -f "${APP_DIR}/artisan" ]]; then
            print_error "File artisan tidak ditemukan di ${APP_DIR}"
            print_error "Upload source code dulu, lalu jalankan script ini lagi."
            exit 1
        fi
    fi

    cd ${APP_DIR}

    # Setup .env file
    print_step "Setup file .env untuk production..."
    if [[ ! -f .env ]]; then
        cp .env.example .env
    fi

    # Update .env untuk production
    cat > .env << ENVFILE
APP_NAME="MUDAPRENEUR.AI"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://${DOMAIN}

APP_LOCALE=id
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=id_ID

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=mudapreneur
# DB_USERNAME=root
# DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="noreply@${DOMAIN}"
MAIL_FROM_NAME="\${APP_NAME}"

VITE_APP_NAME="\${APP_NAME}"

# OpenRouter AI API Configuration
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_MODEL=deepseek/deepseek-r1-0528:free

# Kie AI (Kling) API Configuration
KIE_AI_API_KEY=
KIE_AI_MODEL=sora-2-image-to-video
KIE_AI_BASE_URL=https://api.kie.ai/api/v1/jobs
ENVFILE

    # Install Composer dependencies (production)
    print_step "Install Composer dependencies (production)..."
    composer install --no-dev --optimize-autoloader --no-interaction

    # Generate APP_KEY
    print_step "Generate application key..."
    php artisan key:generate --force

    # Install NPM dependencies & build
    print_step "Install NPM dependencies..."
    npm ci --production=false

    print_step "Build assets untuk production (npm run build)..."
    npm run build

    # Setup SQLite database
    print_step "Setup SQLite database..."
    mkdir -p database
    if [[ ! -f database/database.sqlite ]]; then
        touch database/database.sqlite
    fi

    # Run migrations
    print_step "Jalankan database migrations..."
    php artisan migrate --force

    # Storage link
    print_step "Membuat storage symlink..."
    php artisan storage:link --force

    # Laravel optimizations
    print_step "Optimasi Laravel untuk production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache

    # Set permissions
    print_step "Setting file permissions..."
    chown -R www-data:www-data ${APP_DIR}
    chmod -R 755 ${APP_DIR}
    chmod -R 775 ${APP_DIR}/storage
    chmod -R 775 ${APP_DIR}/bootstrap/cache
    chmod -R 775 ${APP_DIR}/database
    chmod 664 ${APP_DIR}/database/database.sqlite

    print_success "Aplikasi berhasil di-deploy"
}

# ======================== 8. SETUP SSL (Let's Encrypt) ========================
setup_ssl() {
    print_header "8/9 - Setup SSL Certificate (Let's Encrypt)"

    print_step "Install Certbot..."
    apt install -y certbot python3-certbot-nginx

    print_step "Mendapatkan SSL certificate untuk ${DOMAIN}..."
    certbot --nginx \
        -d ${DOMAIN} \
        -d www.${DOMAIN} \
        --non-interactive \
        --agree-tos \
        --email admin@${DOMAIN} \
        --redirect

    # Setup auto-renewal
    print_step "Setup auto-renewal SSL..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

    print_success "SSL certificate berhasil diinstall & auto-renewal aktif"
}

# ======================== 9. SETUP SUPERVISOR (Queue Worker) ========================
setup_supervisor() {
    print_header "9/9 - Setup Supervisor (Queue Worker & Scheduler)"

    # Laravel Queue Worker
    print_step "Konfigurasi Laravel Queue Worker..."
    cat > /etc/supervisor/conf.d/${APP_NAME}-worker.conf << SUPERVISOR
[program:${APP_NAME}-worker]
process_name=%(program_name)s_%(process_num)02d
command=php ${APP_DIR}/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=${APP_DIR}/storage/logs/worker.log
stopwaitsecs=3600
SUPERVISOR

    supervisorctl reread
    supervisorctl update
    supervisorctl start ${APP_NAME}-worker:*

    # Laravel Scheduler (Cron)
    print_step "Setup Laravel Scheduler via cron..."
    (crontab -l 2>/dev/null; echo "* * * * * cd ${APP_DIR} && php artisan schedule:run >> /dev/null 2>&1") | crontab -

    print_success "Supervisor & Scheduler berhasil dikonfigurasi"
}

# ======================== SETUP FIREWALL ========================
setup_firewall() {
    print_header "BONUS - Setup Firewall (UFW)"

    print_step "Konfigurasi UFW firewall..."
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable

    print_success "Firewall berhasil dikonfigurasi (SSH + HTTP/HTTPS)"
}

# ======================== BUAT SCRIPT UPDATE ========================
create_update_script() {
    print_header "BONUS - Membuat Script Update"

    cat > ${APP_DIR}/update.sh << 'UPDATE_SCRIPT'
#!/bin/bash
#===============================================================================
#  Script Update Aplikasi Mudapreneur.AI
#  Jalankan: sudo bash /var/www/mudapreneur/update.sh
#===============================================================================

set -euo pipefail

APP_DIR="/var/www/mudapreneur"
PHP_VERSION="8.3"

echo "🔄 Mulai update MUDAPRENEUR.AI..."

cd ${APP_DIR}

# Maintenance mode ON
echo "🔧 Aktifkan maintenance mode..."
php artisan down --retry=60

# Pull latest code (jika pakai git)
if [[ -d ".git" ]]; then
    echo "📥 Pull latest code..."
    git pull origin main
fi

# Install dependencies
echo "📦 Install Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "📦 Install NPM dependencies..."
npm ci --production=false

echo "🔨 Build assets..."
npm run build

# Run migrations
echo "🗄️  Jalankan migrations..."
php artisan migrate --force

# Clear & rebuild cache
echo "🧹 Clear & rebuild cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Fix permissions
echo "🔐 Fix permissions..."
chown -R www-data:www-data ${APP_DIR}
chmod -R 755 ${APP_DIR}
chmod -R 775 ${APP_DIR}/storage
chmod -R 775 ${APP_DIR}/bootstrap/cache
chmod -R 775 ${APP_DIR}/database

# Restart services
echo "🔄 Restart services..."
supervisorctl restart mudapreneur-worker:*
systemctl reload php${PHP_VERSION}-fpm
systemctl reload nginx

# Maintenance mode OFF
echo "✅ Nonaktifkan maintenance mode..."
php artisan up

echo ""
echo "✅ Update selesai! Website sudah live di https://umkmcipadung.com"
echo ""
UPDATE_SCRIPT

    chmod +x ${APP_DIR}/update.sh
    print_success "Script update dibuat di ${APP_DIR}/update.sh"
}

# ======================== BUAT SCRIPT BACKUP ========================
create_backup_script() {
    print_header "BONUS - Membuat Script Backup"

    mkdir -p /var/backups/${APP_NAME}

    cat > ${APP_DIR}/backup.sh << 'BACKUP_SCRIPT'
#!/bin/bash
#===============================================================================
#  Script Backup Database & Storage Mudapreneur.AI
#  Jalankan: sudo bash /var/www/mudapreneur/backup.sh
#  Otomatis via cron: 0 2 * * * bash /var/www/mudapreneur/backup.sh
#===============================================================================

set -euo pipefail

APP_DIR="/var/www/mudapreneur"
BACKUP_DIR="/var/backups/mudapreneur"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Mulai backup..."

mkdir -p ${BACKUP_DIR}

# Backup SQLite database
echo "📁 Backup database SQLite..."
cp ${APP_DIR}/database/database.sqlite ${BACKUP_DIR}/database_${DATE}.sqlite

# Backup storage (uploaded files)
echo "📁 Backup storage files..."
tar -czf ${BACKUP_DIR}/storage_${DATE}.tar.gz -C ${APP_DIR} storage/app/public

# Backup .env
echo "📁 Backup .env..."
cp ${APP_DIR}/.env ${BACKUP_DIR}/env_${DATE}.bak

# Hapus backup lebih dari 30 hari
echo "🧹 Hapus backup lama (>30 hari)..."
find ${BACKUP_DIR} -type f -mtime +30 -delete

echo ""
echo "✅ Backup selesai!"
echo "   Lokasi: ${BACKUP_DIR}"
echo "   Database: database_${DATE}.sqlite"
echo "   Storage: storage_${DATE}.tar.gz"
echo ""
BACKUP_SCRIPT

    chmod +x ${APP_DIR}/backup.sh

    # Auto backup tiap hari jam 2 pagi
    (crontab -l 2>/dev/null; echo "0 2 * * * bash ${APP_DIR}/backup.sh >> /var/log/mudapreneur-backup.log 2>&1") | crontab -

    print_success "Script backup dibuat di ${APP_DIR}/backup.sh (auto backup jam 2 pagi)"
}

# ======================== TAMPILKAN RINGKASAN ========================
show_summary() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║        🎉  DEPLOYMENT SELESAI - MUDAPRENEUR.AI  🎉         ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${CYAN}📌 Ringkasan:${NC}"
    echo -e "  ─────────────────────────────────────────────"
    echo -e "  🌐 Website    : ${GREEN}https://${DOMAIN}${NC}"
    echo -e "  🌐 WWW        : ${GREEN}https://www.${DOMAIN}${NC}"
    echo -e "  📁 App Dir    : ${BLUE}${APP_DIR}${NC}"
    echo -e "  🗄️  Database   : ${BLUE}${APP_DIR}/database/database.sqlite${NC}"
    echo -e "  📝 Logs       : ${BLUE}${APP_DIR}/storage/logs/laravel.log${NC}"
    echo -e "  💾 Backups    : ${BLUE}/var/backups/${APP_NAME}/${NC}"
    echo ""
    echo -e "  ${CYAN}🛠️  Script Tersedia:${NC}"
    echo -e "  ─────────────────────────────────────────────"
    echo -e "  Update App    : ${YELLOW}sudo bash ${APP_DIR}/update.sh${NC}"
    echo -e "  Backup Data   : ${YELLOW}sudo bash ${APP_DIR}/backup.sh${NC}"
    echo ""
    echo -e "  ${CYAN}📋 Perintah Penting:${NC}"
    echo -e "  ─────────────────────────────────────────────"
    echo -e "  Restart PHP   : ${YELLOW}sudo systemctl restart php${PHP_VERSION}-fpm${NC}"
    echo -e "  Restart Nginx : ${YELLOW}sudo systemctl restart nginx${NC}"
    echo -e "  Restart Queue : ${YELLOW}sudo supervisorctl restart ${APP_NAME}-worker:*${NC}"
    echo -e "  Lihat Log     : ${YELLOW}tail -f ${APP_DIR}/storage/logs/laravel.log${NC}"
    echo -e "  Maintenance ON: ${YELLOW}cd ${APP_DIR} && php artisan down${NC}"
    echo -e "  Maintenance OF: ${YELLOW}cd ${APP_DIR} && php artisan up${NC}"
    echo ""
    echo -e "  ${CYAN}⚡ Yang Perlu Dilakukan Setelah Deploy:${NC}"
    echo -e "  ─────────────────────────────────────────────"
    echo -e "  1. Edit ${YELLOW}${APP_DIR}/.env${NC} - isi API keys"
    echo -e "  2. Jalankan ${YELLOW}php artisan db:seed${NC} jika perlu data awal"
    echo -e "  3. Jalankan ${YELLOW}php artisan config:cache${NC} setelah edit .env"
    echo -e "  4. Test akses ${GREEN}https://${DOMAIN}${NC}"
    echo ""
    echo -e "  ${RED}⚠️  PENTING:${NC}"
    echo -e "  ─────────────────────────────────────────────"
    echo -e "  • Jangan lupa ganti API keys di .env"
    echo -e "  • Backup rutin sudah aktif (setiap hari jam 2 pagi)"
    echo -e "  • SSL auto-renewal sudah aktif"
    echo ""
}

# ======================== MAIN EXECUTION ========================
main() {
    check_root
    show_config
    setup_system
    setup_swap
    install_php
    install_composer
    install_nodejs
    install_nginx
    deploy_app
    setup_ssl
    setup_supervisor
    setup_firewall
    create_update_script
    create_backup_script
    show_summary
}

# Run
main "$@"
