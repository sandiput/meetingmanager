<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'date',
        'start_time',
        'end_time',
        'location',
        'meeting_link',
        'designated_attendee',
        'dress_code',
        'invitation_reference',
        'attendance_link',
        'discussion_results',
        'whatsapp_reminder_enabled',
        'group_notification_enabled'
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'whatsapp_reminder_enabled' => 'boolean',
        'group_notification_enabled' => 'boolean',
        'reminder_sent_at' => 'datetime',
        'group_notification_sent_at' => 'datetime',
    ];

    public function attachments()
    {
        return $this->hasMany(MeetingAttachment::class);
    }

    public function participant()
    {
        return $this->belongsTo(Participant::class, 'designated_attendee', 'name');
    }

    public function whatsappNotifications()
    {
        return $this->hasMany(WhatsappNotification::class);
    }

    public function scheduledNotifications()
    {
        return $this->hasMany(ScheduledNotification::class);
    }

    public function getFullDateTimeAttribute()
    {
        return Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->start_time->format('H:i:s'));
    }

    public function getEndDateTimeAttribute()
    {
        return Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->end_time->format('H:i:s'));
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString())
                    ->orderBy('date')
                    ->orderBy('start_time');
    }

    public function scopeCompleted($query)
    {
        return $query->whereRaw('CONCAT(date, " ", end_time) < ?', [now()])
                    ->orderBy('date', 'desc')
                    ->orderBy('start_time', 'desc');
    }

    public function scopeSearch($query, $search)
    {
        return $query->whereFullText(['title', 'location', 'discussion_results'], $search)
                    ->orWhere('designated_attendee', 'like', "%{$search}%");
    }
}