#!/bin/bash
# Quick Update - git pull + rebuild only
cd /var/www/mudapreneur

echo "⏳ Maintenance mode ON..."
php artisan down --retry=60

echo "📥 Git pull..."
git pull origin main

echo "📦 Composer install..."
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction

echo "🔨 NPM build..."
npm ci --production=false
npm run build

echo "🔄 Clear cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "♻️ Restart queue..."
supervisorctl restart mudapreneur-worker:*

echo "✅ Maintenance mode OFF..."
php artisan up

echo "🎉 Update selesai!"
