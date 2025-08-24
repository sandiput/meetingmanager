<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Settings;
use App\Models\Meeting;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SettingsController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    public function show()
    {
        try {
            $settings = Settings::getInstance();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $settings->id,
                    'group_notification_time' => $settings->group_notification_time->format('H:i'),
                    'group_notification_enabled' => $settings->group_notification_enabled,
                    'individual_reminder_minutes' => $settings->individual_reminder_minutes,
                    'individual_reminder_enabled' => $settings->individual_reminder_enabled,
                    'whatsapp_connected' => $settings->whatsapp_connected,
                    'updated_at' => $settings->updated_at->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'group_notification_time' => 'sometimes|required|date_format:H:i',
            'group_notification_enabled' => 'sometimes|required|boolean',
            'individual_reminder_minutes' => 'sometimes|required|integer|min:1|max:120',
            'individual_reminder_enabled' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $settings = Settings::getInstance();
            $settings->update($request->all());

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $settings->id,
                    'group_notification_time' => $settings->group_notification_time->format('H:i'),
                    'group_notification_enabled' => $settings->group_notification_enabled,
                    'individual_reminder_minutes' => $settings->individual_reminder_minutes,
                    'individual_reminder_enabled' => $settings->individual_reminder_enabled,
                    'whatsapp_connected' => $settings->whatsapp_connected,
                    'updated_at' => $settings->updated_at->toISOString(),
                ],
                'message' => 'Settings updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function testWhatsApp()
    {
        try {
            $connected = $this->whatsappService->testConnection();

            // Update connection status
            $settings = Settings::getInstance();
            $settings->update(['whatsapp_connected' => $connected]);

            return response()->json([
                'success' => true,
                'data' => [
                    'connected' => $connected
                ],
                'message' => $connected ? 'WhatsApp connection successful' : 'WhatsApp connection failed'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to test WhatsApp connection',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function previewGroupMessage(Request $request)
    {
        try {
            $date = $request->get('date', now()->toDateString());
            
            $meetings = Meeting::whereDate('date', $date)
                ->where('group_notification_enabled', true)
                ->orderBy('start_time')
                ->get();

            $message = $this->whatsappService->formatGroupNotificationMessage($meetings, $date);

            return response()->json([
                'success' => true,
                'data' => [
                    'message' => $message,
                    'meetings' => $meetings->map(function ($meeting) {
                        return [
                            'id' => $meeting->id,
                            'title' => $meeting->title,
                            'date' => $meeting->date->format('Y-m-d'),
                            'start_time' => $meeting->start_time->format('H:i'),
                            'end_time' => $meeting->end_time->format('H:i'),
                            'location' => $meeting->location,
                            'meeting_link' => $meeting->meeting_link,
                            'designated_attendee' => $meeting->designated_attendee,
                            'dress_code' => $meeting->dress_code,
                            'attendance_link' => $meeting->attendance_link,
                            'discussion_results' => $meeting->discussion_results,
                        ];
                    })
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate preview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendTestGroupMessage(Request $request)
    {
        try {
            $date = $request->get('date', now()->toDateString());
            
            $meetings = Meeting::whereDate('date', $date)
                ->where('group_notification_enabled', true)
                ->orderBy('start_time')
                ->get();

            $this->whatsappService->sendGroupNotification($meetings, $date);

            return response()->json([
                'success' => true,
                'message' => 'Test group message sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test message',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}