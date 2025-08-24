# Laravel Backend Implementation Guide

## Required Laravel Packages

```bash
composer require guzzlehttp/guzzle
composer require laravel/sanctum
composer require spatie/laravel-permission
```

## Environment Variables (.env)

```env
# WhatsApp Bot Configuration
WHATSAPP_BOT_TOKEN=your_bot_token_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Application Settings
APP_NAME="Meeting Manager"
APP_URL=http://localhost:8000

# Queue Configuration (for scheduled notifications)
QUEUE_CONNECTION=database
```

## Key Laravel Components

### 1. Models
- `Meeting.php` - Meeting model with relationships
- `Participant.php` - Participant model  
- `Settings.php` - Application settings model
- `WhatsappNotification.php` - Notification logging
- `MeetingAttachment.php` - File attachments

### 2. Controllers
- `DashboardController.php` - Dashboard statistics and data
- `MeetingController.php` - CRUD operations for meetings
- `ParticipantController.php` - CRUD operations for participants  
- `SettingsController.php` - Application settings management
- `WhatsAppController.php` - WhatsApp webhook and messaging

### 3. Jobs (Queue)
- `SendDailyMeetingNotification.php` - Daily group notifications
- `SendMeetingReminder.php` - Individual meeting reminders
- `ProcessWhatsAppWebhook.php` - Handle incoming WhatsApp messages

### 4. Commands (Artisan)
- `meeting:send-daily-notifications` - Send daily notifications
- `meeting:send-reminders` - Send meeting reminders
- `whatsapp:test-connection` - Test WhatsApp connectivity

## Example Model Implementation

```php
<?php
// app/Models/Meeting.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Meeting extends Model
{
    protected $fillable = [
        'title', 'date', 'time', 'location', 'designated_attendee',
        'dress_code', 'invitation_reference', 'attendance_link',
        'discussion_results', 'status', 'whatsapp_reminder_enabled',
        'group_notification_enabled'
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i',
        'whatsapp_reminder_enabled' => 'boolean',
        'group_notification_enabled' => 'boolean',
    ];

    public function attachments()
    {
        return $this->hasMany(MeetingAttachment::class);
    }

    public function participant()
    {
        return $this->belongsTo(Participant::class, 'designated_attendee', 'name');
    }

    public function getFullDateTimeAttribute()
    {
        return Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->time->format('H:i:s'));
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString())
                    ->orderBy('date')
                    ->orderBy('time');
    }
}
```

## WhatsApp Integration Service

```php
<?php
// app/Services/WhatsAppService.php
namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private $client;
    private $baseUrl;
    private $accessToken;
    private $phoneNumberId;

    public function __construct()
    {
        $this->client = new Client();
        $this->baseUrl = 'https://graph.facebook.com/v18.0';
        $this->accessToken = config('services.whatsapp.access_token');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
    }

    public function sendMessage($to, $message)
    {
        try {
            $response = $this->client->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", [
                'headers' => [
                    'Authorization' => "Bearer {$this->accessToken}",
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'text',
                    'text' => [
                        'body' => $message
                    ]
                ]
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('WhatsApp message failed', [
                'to' => $to,
                'message' => $message,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function testConnection()
    {
        try {
            $response = $this->client->get("{$this->baseUrl}/{$this->phoneNumberId}", [
                'headers' => [
                    'Authorization' => "Bearer {$this->accessToken}",
                ],
            ]);
            
            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            return false;
        }
    }
}
```

## Scheduled Jobs Configuration

```php
<?php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // Send daily meeting notifications at configured time
    $schedule->command('meeting:send-daily-notifications')
             ->dailyAt('07:00');

    // Check for meeting reminders every minute
    $schedule->command('meeting:send-reminders')
             ->everyMinute();
}
```

## API Routes

```php
<?php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/upcoming-meetings', [DashboardController::class, 'upcomingMeetings']);

    // Meetings
    Route::apiResource('meetings', MeetingController::class);
    Route::post('meetings/{meeting}/send-reminder', [MeetingController::class, 'sendReminder']);

    // Participants
    Route::apiResource('participants', ParticipantController::class);
    Route::get('participants/search', [ParticipantController::class, 'search']);

    // Settings
    Route::get('settings', [SettingsController::class, 'show']);
    Route::put('settings', [SettingsController::class, 'update']);
    Route::post('settings/test-whatsapp', [SettingsController::class, 'testWhatsApp']);
});

// WhatsApp Webhook (no auth required)
Route::post('/whatsapp/webhook', [WhatsAppController::class, 'webhook']);
Route::get('/whatsapp/webhook', [WhatsAppController::class, 'verify']);
```

## Deployment Checklist

1. **Database Setup**
   - Run migrations: `php artisan migrate`
   - Seed default data: `php artisan db:seed`

2. **Queue Configuration**
   - Set up queue worker: `php artisan queue:work`
   - Configure supervisor for production

3. **Task Scheduling**
   - Add cron job: `* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1`

4. **WhatsApp Setup**
   - Configure webhook URL in Facebook Developer Console
   - Verify webhook token matches environment configuration
   - Test WhatsApp connection

5. **Storage**
   - Link storage: `php artisan storage:link`
   - Set proper permissions for file uploads

6. **Security**
   - Configure CORS for frontend domain
   - Set up rate limiting
   - Configure authentication tokens