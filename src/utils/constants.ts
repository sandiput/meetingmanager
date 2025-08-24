// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.PROD 
    ? 'https://your-laravel-backend.com/api' 
    : 'http://localhost:8000/api',
  TIMEOUT: 10000,
} as const;

// Application Constants
export const APP_CONFIG = {
  NAME: 'Meeting Manager',
  DESCRIPTION: 'Smart Scheduling for Intelligence Subdirectorate',
  VERSION: '1.0.0',
} as const;

// WhatsApp Configuration
export const WHATSAPP_CONFIG = {
  DEFAULT_REMINDER_MINUTES: 30,
  DEFAULT_GROUP_NOTIFICATION_TIME: '07:00',
  MESSAGE_TEMPLATES: {
    DAILY_REMINDER: `🗓️ *Daily Meeting Schedule*\n\n{meetings}\n\n📱 This is an automated message from Meeting Manager.`,
    INDIVIDUAL_REMINDER: (title: string, date: string, time: string, location: string, dress_code?: string) => 
      `⏰ *Meeting Reminder*\n\n📋 *${title}*\n📅 ${date} at ${time}\n📍 ${location}\n\n${dress_code ? `👔 Dress Code: ${dress_code}\n` : ''}Please be prepared and arrive on time.\n\n📱 This is an automated reminder.`,
  },
} as const;

// Seksi Options
export const SEKSI_OPTIONS = [
  'Intelijen Kepabeanan I',
  'Intelijen Kepabeanan II', 
  'Intelijen Cukai',
  'Dukungan Operasi Intelijen'
] as const;

// Date and Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'dd MMM yyyy, h:mm a',
} as const;

// Status Options
export const MEETING_STATUS = {
  INCOMING: 'incoming',
  COMPLETED: 'completed',
} as const;

export const STATUS_LABELS = {
  [MEETING_STATUS.INCOMING]: 'Incoming',
  [MEETING_STATUS.COMPLETED]: 'Completed',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PARTICIPANT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  WHATSAPP_NUMBER: {
    PATTERN: /^\+?[1-9]\d{1,14}$/,
  },
  MEETING_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 200,
  },
  LOCATION: {
    MAX_LENGTH: 200,
  },
} as const;