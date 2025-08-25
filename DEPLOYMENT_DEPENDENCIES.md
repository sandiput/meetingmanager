# 🚀 Meeting Manager - Server Dependencies Installation Guide

## 📋 **SYSTEM REQUIREMENTS**

### **Operating System**
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Windows Server 2019+ (dengan WSL2)
- macOS 12+ (untuk development)

### **Core Software Requirements**
- **PHP**: 8.1 atau lebih tinggi
- **MySQL**: 8.0 atau lebih tinggi
- **Node.js**: 18.x atau lebih tinggi
- **Composer**: 2.x
- **Web Server**: Apache 2.4+ atau Nginx 1.18+

---

## 🔧 **1. SYSTEM DEPENDENCIES**

### **Ubuntu/Debian Installation:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.1 and extensions
sudo apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-curl \
php8.1-zip php8.1-mbstring php8.1-gd php8.1-json php8.1-bcmath \
php8.1-tokenizer php8.1-fileinfo php8.1-intl php8.1-redis

# Install MySQL 8.0
sudo apt install -y mysql-server-8.0

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Nginx
sudo apt install -y nginx

# Install Redis (for caching and queues)
sudo apt install -y redis-server

# Install Supervisor (for queue workers)
sudo apt install -y supervisor

# Install Git
sudo apt install -y git unzip curl wget
```

### **CentOS/RHEL Installation:**
```bash
# Update system
sudo yum update -y

# Install EPEL and Remi repositories
sudo yum install -y epel-release
sudo yum install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm

# Enable PHP 8.1
sudo yum module enable php:remi-8.1 -y

# Install PHP and extensions
sudo yum install -y php php-fpm php-mysql php-xml php-curl php-zip \
php-mbstring php-gd php-json php-bcmath php-tokenizer php-fileinfo \
php-intl php-redis

# Install MySQL 8.0
sudo yum install -y mysql-server

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Nginx
sudo yum install -y nginx

# Install Redis
sudo yum install -y redis

# Install Supervisor
sudo yum install -y supervisor
```

---

## 📦 **2. PHP DEPENDENCIES (Laravel Backend)**

### **Required PHP Extensions:**
```bash
# Verify PHP extensions are installed
php -m | grep -E "(mysql|pdo|curl|zip|mbstring|xml|json|bcmath|tokenizer|fileinfo|gd|intl)"
```

### **Install Laravel Dependencies:**
```bash
cd /path/to/your/project/laravel-backend

# Install Composer dependencies for production
composer install --optimize-autoloader --no-dev --no-interaction

# Install specific packages if not in composer.json
composer require guzzlehttp/guzzle:^7.2
composer require tymon/jwt-auth:^2.0
composer require barryvdh/laravel-cors:^2.0
composer require predis/predis:^2.0
```

### **Laravel Production Setup:**
```bash
# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run database migrations
php artisan migrate --force

# Cache configuration for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set proper permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 755 storage bootstrap/cache
```

---

## 🎨 **3. FRONTEND DEPENDENCIES (React/Vite)**

### **Install Node.js Dependencies:**
```bash
cd /path/to/your/project

# Install production dependencies
npm ci --only=production

# Or install all dependencies and build
npm install

# Build for production
npm run build

# The built files will be in 'dist' folder
```

### **Required Node.js Packages:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.8.2",
    "axios": "^1.11.0",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.344.0",
    "clsx": "^2.1.1",
    "react-hook-form": "^7.62.0",
    "@hookform/resolvers": "^5.2.1",
    "yup": "^1.7.0"
  }
}
```

---

## 🗄️ **4. DATABASE SETUP**

### **MySQL Configuration:**
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE meeting_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'meeting_user'@'localhost' IDENTIFIED BY 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON meeting_manager.* TO 'meeting_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### **Run Migrations:**
```bash
cd /path/to/your/project/laravel-backend

# Run migrations
php artisan migrate

# Seed default data (if needed)
php artisan db:seed
```

---

## 🔄 **5. QUEUE SYSTEM SETUP**

### **Install Supervisor:**
```bash
# Create supervisor configuration
sudo nano /etc/supervisor/conf.d/meeting-manager-worker.conf
```

```ini
[program:meeting-manager-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/laravel-backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/your/project/laravel-backend/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
# Update supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start meeting-manager-worker:*
```

### **Setup Cron Jobs:**
```bash
# Edit crontab
sudo crontab -e

# Add Laravel scheduler
* * * * * cd /path/to/your/project/laravel-backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🌐 **6. WEB SERVER CONFIGURATION**

### **Nginx Configuration:**
```bash
sudo nano /etc/nginx/sites-available/meeting-manager
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/project/laravel-backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    # Handle Laravel API routes
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Serve React frontend
    location / {
        root /path/to/your/project/dist;
        try_files $uri $uri/ /index.html;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/meeting-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📱 **7. WHATSAPP API DEPENDENCIES**

### **Required for WhatsApp Integration:**
```bash
# Already included in Laravel dependencies
# - guzzlehttp/guzzle (for HTTP requests)
# - Laravel HTTP client

# No additional system packages needed
# WhatsApp Business API works via HTTP requests
```

### **WhatsApp Configuration:**
```env
# Add to .env file
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
WHATSAPP_GROUP_NUMBER=your_group_whatsapp_number
```

---

## 🔒 **8. SECURITY & SSL**

### **Install SSL Certificate (Let's Encrypt):**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔍 **9. MONITORING & LOGGING**

### **Setup Log Rotation:**
```bash
sudo nano /etc/logrotate.d/meeting-manager
```

```
/path/to/your/project/laravel-backend/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0644 www-data www-data
}
```

---

## ✅ **10. VERIFICATION CHECKLIST**

### **Test All Services:**
```bash
# Test PHP
php -v

# Test MySQL
mysql --version
sudo systemctl status mysql

# Test Node.js
node --version
npm --version

# Test Nginx
sudo nginx -t
sudo systemctl status nginx

# Test Redis
redis-cli ping

# Test Supervisor
sudo supervisorctl status

# Test Laravel
cd /path/to/your/project/laravel-backend
php artisan --version

# Test database connection
php artisan tinker
>>> DB::connection()->getPdo();

# Test queue
php artisan queue:work --once
```

---

## 🚀 **FINAL DEPLOYMENT COMMANDS**

```bash
# 1. Clone repository
git clone your-repository-url /path/to/your/project
cd /path/to/your/project

# 2. Setup Laravel backend
cd laravel-backend
composer install --optimize-autoloader --no-dev
cp .env.example .env
# Edit .env with your configurations
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Setup frontend
cd ..
npm install
npm run build

# 4. Set permissions
sudo chown -R www-data:www-data laravel-backend/storage laravel-backend/bootstrap/cache
sudo chmod -R 755 laravel-backend/storage laravel-backend/bootstrap/cache

# 5. Start services
sudo systemctl start nginx
sudo systemctl start mysql
sudo systemctl start redis
sudo supervisorctl start meeting-manager-worker:*

# 6. Test application
curl -X GET http://your-domain.com/api/dashboard/stats
```

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues:**
1. **Permission errors**: Check file ownership and permissions
2. **Database connection**: Verify MySQL credentials and service status
3. **Queue not working**: Check supervisor configuration and logs
4. **WhatsApp not sending**: Verify API credentials and webhook URL

### **Log Locations:**
- **Laravel**: `/path/to/project/laravel-backend/storage/logs/laravel.log`
- **Nginx**: `/var/log/nginx/error.log`
- **PHP-FPM**: `/var/log/php8.1-fpm.log`
- **MySQL**: `/var/log/mysql/error.log`
- **Supervisor**: `/var/log/supervisor/supervisord.log`

---

## 🎯 **PRODUCTION READY!**

Setelah mengikuti semua langkah di atas, aplikasi Meeting Manager akan siap berjalan di production server dengan semua fitur yang berfungsi penuh!