// Data Types for Meeting Manager Application
export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  meeting_link?: string;
  designated_attendee: string;
  dress_code?: string;
  invitation_reference?: string;
  attendance_link?: string;
  discussion_results?: string;
  status: 'incoming' | 'completed';
  whatsapp_reminder_enabled: boolean;
  group_notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  name: string;
  whatsapp_number: string;
  nip: string; // Nomor Induk Pegawai
  seksi: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  group_notification_time: string; // Format: "07:00"
  group_notification_enabled: boolean;
  individual_reminder_minutes: number; // Minutes before meeting
  individual_reminder_enabled: boolean;
  whatsapp_bot_token?: string;
  whatsapp_phone_number_id?: string;
  whatsapp_business_account_id?: string;
  updated_at: string;
}

export interface DashboardStats {
  total_meetings: number;
  this_week_meetings: number;
  notifications_sent: number;
  active_participants: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Form Types
export interface CreateMeetingForm {
  title: string;
  date: string;
  time: string;
  location: string;
  meeting_link?: string;
  designated_attendee: string;
  dress_code?: string;
  invitation_reference?: string;
  attendance_link?: string;
  discussion_results?: string;
  whatsapp_reminder_enabled: boolean;
  group_notification_enabled: boolean;
}

export interface CreateParticipantForm {
  name: string;
  whatsapp_number: string;
  nip: string;
  seksi: string;
}

export interface UpdateSettingsForm {
  group_notification_time: string;
  group_notification_enabled: boolean;
  individual_reminder_minutes: number;
  individual_reminder_enabled: boolean;
}