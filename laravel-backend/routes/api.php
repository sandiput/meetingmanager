<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\ParticipantController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WhatsAppController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    
    Route::middleware('auth:api')->group(function () {
        Route::put('profile', [AuthController::class, 'profile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// WhatsApp webhook (no auth required)
Route::prefix('whatsapp')->group(function () {
    Route::post('webhook', [WhatsAppController::class, 'webhook']);
    Route::get('webhook', [WhatsAppController::class, 'verify']);
});

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::get('upcoming-meetings', [DashboardController::class, 'upcomingMeetings']);
    });

    // Meetings
    Route::prefix('meetings')->group(function () {
        Route::get('/', [MeetingController::class, 'index']);
        Route::post('/', [MeetingController::class, 'store']);
        Route::get('search', [MeetingController::class, 'search']);
        Route::get('{meeting}', [MeetingController::class, 'show']);
        Route::put('{meeting}', [MeetingController::class, 'update']);
        Route::delete('{meeting}', [MeetingController::class, 'destroy']);
        Route::post('{meeting}/send-reminder', [MeetingController::class, 'sendReminder']);
    });

    // Participants
    Route::prefix('participants')->group(function () {
        Route::get('/', [ParticipantController::class, 'index']);
        Route::post('/', [ParticipantController::class, 'store']);
        Route::get('search', [ParticipantController::class, 'search']);
        Route::get('{participant}', [ParticipantController::class, 'show']);
        Route::put('{participant}', [ParticipantController::class, 'update']);
        Route::delete('{participant}', [ParticipantController::class, 'destroy']);
    });

    // Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'show']);
        Route::put('/', [SettingsController::class, 'update']);
        Route::post('test-whatsapp', [SettingsController::class, 'testWhatsApp']);
    });

    // Review & Analytics
    Route::prefix('review')->group(function () {
        Route::get('stats', [ReviewController::class, 'stats']);
        Route::get('top-participants', [ReviewController::class, 'topParticipants']);
        Route::get('seksi-stats', [ReviewController::class, 'seksiStats']);
        Route::get('meeting-trends', [ReviewController::class, 'meetingTrends']);
    });
});