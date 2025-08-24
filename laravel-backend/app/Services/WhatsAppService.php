<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use App\Models\Settings;
use App\Models\WhatsappNotification;

class WhatsAppService
{
    private $client;
    private $baseUrl;
    private $accessToken;
    private $phoneNumberId;
    private $settings;

    public function __construct()
    {
        $this->client = new Client();
        $this->settings = Settings::getInstance();
        $this->baseUrl = 'https://graph.facebook.com/' . config('services.whatsapp.api_version', 'v18.0');
        $this->accessToken = $this->settings->whatsapp_access_token ?? config('services.whatsapp.access_token');
        $this->phoneNumberId = $this->settings->whatsapp_phone_number_id ?? config('services.whatsapp.phone_number_id');
    }

    public function sendMessage($to, $message, $meetingId = null, $recipientType = 'individual')
    {
        try {
            // Log notification attempt
            $notification = WhatsappNotification::create([
                'meeting_id' => $meetingId,
                'recipient_type' => $recipientType,
                'recipient_number' => $recipientType === 'individual' ? $to : null,
                'message_content' => $message,
                'status' => 'pending'
            ]);

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

            $result = json_decode($response->getBody(), true);

            // Update notification status
            $notification->update([
                'status' => 'sent',
                'sent_at' => now(),
                'whatsapp_message_id' => $result['messages'][0]['id'] ?? null
            ]);

            Log::info('WhatsApp message sent successfully', [
                'to' => $to,
                'meeting_id' => $meetingId,
                'message_id' => $result['messages'][0]['id'] ?? null
            ]);

            return $result;

        } catch (\Exception $e) {
            // Update notification status on failure
            if (isset($notification)) {
                $notification->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()
                ]);
            }

            Log::error('WhatsApp message failed', [
                'to' => $to,
                'meeting_id' => $meetingId,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    public function sendMeetingReminder($meeting, $participant)
    {
        $message = $this->formatMeetingReminderMessage($meeting);
        return $this->sendMessage($participant->whatsapp_number, $message, $meeting->id, 'individual');
    }

    public function sendGroupNotification($meetings)
    {
        $message = $this->formatGroupNotificationMessage($meetings);
        $groupNumber = config('services.whatsapp.group_number');
        
        if (!$groupNumber) {
            throw new \Exception('WhatsApp group number not configured');
        }

        return $this->sendMessage($groupNumber, $message, null, 'group');
    }

    private function formatMeetingReminderMessage($meeting)
    {
        $message = "⏰ *Meeting Reminder*\n\n";
        $message .= "📋 *{$meeting->title}*\n";
        $message .= "📅 {$meeting->date->format('d M Y')} at {$meeting->start_time->format('H:i')} - {$meeting->end_time->format('H:i')}\n";
        $message .= "📍 {$meeting->location}\n";

        if ($meeting->meeting_link) {
            $message .= "💻 Join: {$meeting->meeting_link}\n";
        }

        if ($meeting->dress_code) {
            $message .= "👔 Dress Code: {$meeting->dress_code}\n";
        }

        if ($meeting->attendance_link) {
            $message .= "🔗 Attendance: {$meeting->attendance_link}\n";
        }

        $message .= "\nPlease be prepared and arrive on time.\n\n";
        $message .= "📱 This is an automated reminder from Meeting Manager.";

        return $message;
    }

    private function formatGroupNotificationMessage($meetings)
    {
        $message = "🗓️ *Daily Meeting Schedule*\n\n";

        if (empty($meetings)) {
            $message .= "No meetings scheduled for today.\n\n";
        } else {
            foreach ($meetings as $meeting) {
                $message .= "📋 *{$meeting->title}*\n";
                $message .= "⏰ {$meeting->start_time->format('H:i')} - {$meeting->end_time->format('H:i')}\n";
                $message .= "📍 {$meeting->location}\n";
                $message .= "👤 {$meeting->designated_attendee}\n\n";
            }
        }

        $message .= "📱 This is an automated message from Meeting Manager.";

        return $message;
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
            Log::error('WhatsApp connection test failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function handleWebhook($payload)
    {
        Log::info('WhatsApp webhook received', $payload);

        // Process webhook payload
        if (isset($payload['entry'])) {
            foreach ($payload['entry'] as $entry) {
                if (isset($entry['changes'])) {
                    foreach ($entry['changes'] as $change) {
                        if ($change['field'] === 'messages') {
                            $this->processMessageStatus($change['value']);
                        }
                    }
                }
            }
        }
    }

    private function processMessageStatus($value)
    {
        if (isset($value['statuses'])) {
            foreach ($value['statuses'] as $status) {
                $messageId = $status['id'];
                $statusType = $status['status']; // sent, delivered, read, failed

                // Update notification status in database
                WhatsappNotification::where('whatsapp_message_id', $messageId)
                    ->update(['status' => $statusType]);

                Log::info('WhatsApp message status updated', [
                    'message_id' => $messageId,
                    'status' => $statusType
                ]);
            }
        }
    }
}