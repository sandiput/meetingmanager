# Meeting Manager - Production Setup Instructions

## 1. Frontend Setup (React + Vite)

### Install Dependencies
```bash
npm install
```

### Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Meeting Manager
VITE_APP_VERSION=1.0.0
```

### Build for Production
```bash
npm run build
```

## 2. Laravel Backend Setup

### Create Laravel Project
```bash
cd laravel-backend
composer install
```

### Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

### Database Setup
1. Create MySQL database named `meeting_manager`
2. Update `.env` file with database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=meeting_manager
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Run Migrations
```bash
php artisan migrate
```

### JWT Setup
```bash
php artisan jwt:secret
```

### Storage Link
```bash
php artisan storage:link
```

### Queue Setup (for background jobs)
```bash
php artisan queue:table
php artisan migrate
```

## 3. WhatsApp Business API Setup

### Get WhatsApp Business API Credentials
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add WhatsApp Business API product
4. Get the following credentials:
   - Access Token
   - Phone Number ID
   - Business Account ID
   - Webhook Verify Token

### Update Laravel .env
```env
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
WHATSAPP_GROUP_NUMBER=your_group_whatsapp_number
```

### Configure Webhook
Set webhook URL in Facebook Developer Console:
```
https://your-domain.com/api/whatsapp/webhook
```

## 4. Production Deployment

### Server Requirements
- PHP 8.1+
- MySQL 8.0+
- Composer
- Node.js 18+
- Web server (Apache/Nginx)

### Laravel Production Setup
```bash
# Install dependencies
composer install --optimize-autoloader --no-dev

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 755 storage bootstrap/cache
```

### Queue Worker Setup (Supervisor)
Create `/etc/supervisor/conf.d/meeting-manager-worker.conf`:
```ini
[program:meeting-manager-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/worker.log
stopwaitsecs=3600
```

### Cron Job Setup
Add to crontab:
```bash
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/project/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
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

## 5. Testing the Setup

### Test Database Connection
```bash
php artisan tinker
>>> DB::connection()->getPdo();
```

### Test WhatsApp Connection
```bash
php artisan tinker
>>> app(\App\Services\WhatsAppService::class)->testConnection();
```

### Test Authentication
```bash
curl -X POST http://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 6. Default Credentials

### Admin Login
- Username: `admin`
- Password: `admin123`

**Important**: Change the default password after first login!

## 7. Monitoring & Maintenance

### Log Files
- Laravel logs: `storage/logs/laravel.log`
- Queue worker logs: `storage/logs/worker.log`
- WhatsApp logs: Check Laravel logs for WhatsApp-related entries

### Regular Maintenance
```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan optimize
```

## 8. Security Considerations

1. **Change default credentials**
2. **Use HTTPS in production**
3. **Set proper file permissions**
4. **Keep dependencies updated**
5. **Monitor logs regularly**
6. **Backup database regularly**
7. **Use environment variables for sensitive data**

## 9. Troubleshooting

### Common Issues
1. **Queue not processing**: Check supervisor configuration
2. **WhatsApp not sending**: Verify API credentials and webhook
3. **Database connection**: Check MySQL service and credentials
4. **File permissions**: Ensure proper ownership and permissions

### Debug Commands
```bash
# Check queue status
php artisan queue:work --verbose

# Test scheduled commands
php artisan schedule:run

# Check logs
tail -f storage/logs/laravel.log
```