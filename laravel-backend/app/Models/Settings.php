<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_notification_time',
        'group_notification_enabled',
        'individual_reminder_minutes',
        'individual_reminder_enabled',
        'whatsapp_connected',
        'whatsapp_webhook_url',
        'whatsapp_access_token',
        'whatsapp_phone_number_id',
        'whatsapp_business_account_id'
    ];

    protected $casts = [
        'group_notification_time' => 'datetime:H:i',
        'group_notification_enabled' => 'boolean',
        'individual_reminder_enabled' => 'boolean',
        'whatsapp_connected' => 'boolean',
    ];

    public static function getInstance()
    {
        return self::first() ?? self::create([
            'group_notification_time' => '07:00:00',
            'group_notification_enabled' => true,
            'individual_reminder_minutes' => 30,
            'individual_reminder_enabled' => true,
            'whatsapp_connected' => false,
        ]);
    }
}