<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->time('group_notification_time')->default('07:00:00');
            $table->boolean('group_notification_enabled')->default(true);
            $table->integer('individual_reminder_minutes')->default(30);
            $table->boolean('individual_reminder_enabled')->default(true);
            $table->boolean('whatsapp_connected')->default(false);
            $table->string('whatsapp_webhook_url')->nullable();
            $table->text('whatsapp_access_token')->nullable();
            $table->string('whatsapp_phone_number_id')->nullable();
            $table->string('whatsapp_business_account_id')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('settings')->insert([
            'group_notification_time' => '07:00:00',
            'group_notification_enabled' => true,
            'individual_reminder_minutes' => 30,
            'individual_reminder_enabled' => true,
            'whatsapp_connected' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};