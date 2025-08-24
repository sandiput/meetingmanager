-- Meeting Manager Database Schema
-- This SQL can be used to create the database structure in Laravel migrations

-- Settings table
CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_notification_time TIME NOT NULL DEFAULT '07:00:00',
    group_notification_enabled BOOLEAN NOT NULL DEFAULT true,
    individual_reminder_minutes INT NOT NULL DEFAULT 30,
    individual_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    whatsapp_connected BOOLEAN NOT NULL DEFAULT false,
    whatsapp_webhook_url VARCHAR(255) NULL,
    whatsapp_bot_token VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Participants table  
CREATE TABLE participants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY unique_whatsapp_number (whatsapp_number),
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Meetings table
CREATE TABLE meetings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    designated_attendee VARCHAR(100) NOT NULL,
    dress_code VARCHAR(100) NULL,
    invitation_reference VARCHAR(100) NULL,
    attendance_link TEXT NULL,
    discussion_results TEXT NULL,
    status ENUM('confirmed', 'pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    whatsapp_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    group_notification_enabled BOOLEAN NOT NULL DEFAULT true,
    reminder_sent_at TIMESTAMP NULL DEFAULT NULL,
    group_notification_sent_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_designated_attendee (designated_attendee),
    INDEX idx_upcoming (date, time),
    FOREIGN KEY (designated_attendee) REFERENCES participants(name) ON UPDATE CASCADE
);

-- Meeting attachments table
CREATE TABLE meeting_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    attachment_type ENUM('document', 'photo') NOT NULL DEFAULT 'document',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_type (attachment_type)
);

-- WhatsApp notifications log table
CREATE TABLE whatsapp_notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT UNSIGNED NULL,
    recipient_type ENUM('individual', 'group') NOT NULL,
    recipient_number VARCHAR(20) NULL, -- For individual messages
    message_content TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP NULL DEFAULT NULL,
    error_message TEXT NULL,
    whatsapp_message_id VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL,
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_status (status),
    INDEX idx_recipient_type (recipient_type),
    INDEX idx_sent_at (sent_at)
);

-- Scheduled jobs table (for Laravel queue system)
CREATE TABLE scheduled_notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT UNSIGNED NOT NULL,
    notification_type ENUM('individual_reminder', 'group_notification') NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    status ENUM('pending', 'processed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_status (status)
);

-- Insert default settings
INSERT INTO settings (
    group_notification_time,
    group_notification_enabled,
    individual_reminder_minutes,
    individual_reminder_enabled,
    whatsapp_connected,
    created_at,
    updated_at
) VALUES (
    '07:00:00',
    true,
    30,
    true,
    false,
    NOW(),
    NOW()
);