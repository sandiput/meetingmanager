<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'whatsapp_number',
        'nip',
        'seksi',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function meetings()
    {
        return $this->hasMany(Meeting::class, 'designated_attendee', 'name');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('whatsapp_number', 'like', "%{$search}%");
    }
}