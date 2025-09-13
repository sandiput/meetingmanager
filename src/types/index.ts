// Data Types for Meeting Manager Application
export interface Attachment {
  id: string;
  meeting_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  file_category: string;
  uploaded_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  meeting_link?: string;
  participants: Participant[]; // Primary source from backend
  dress_code?: string;
  invitation_reference?: string;
  invitation_letter_reference?: string;
  attendance_link?: string;
  agenda?: string;
  discussion_results?: string;
  status?: 'upcoming' | 'completed';
  whatsapp_reminder_enabled: boolean;
  group_notification_enabled: boolean;
  invited_by?: string;
  created_at: string;
  updated_at: string;
  attendees?: Participant[];
  attachments?: Attachment[];
}

export interface Participant {
  id: string;
  name: string;
  whatsapp_number: string;
  nip: string; // Nomor Induk Pegawai
  seksi: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DaftarKantor {
  kd_kantor: string;
  nama_kantor_pendek: string;
  nama_kantor_lengkap: string;
  alamat?: string;
  eselon2?: string;
  is_kanwil?: string;
  kota?: string;
}

export interface Settings {
  id: string;
  group_notification_time: string; // Format: "07:00"
  group_notification_enabled: boolean;
  individual_reminder_minutes: number; // Minutes before meeting
  individual_reminder_enabled: boolean;
  whatsapp_connected: boolean;
  whatsapp_group_id?: string;
  notification_templates: {
    group_daily: string;
    individual_reminder: string;
  };
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

export interface ParticipantsPaginatedResponse {
  participants: Participant[];
  page: number;
  total_pages: number;
  total: number;
}

// Form Types
export interface CreateMeetingForm {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  meeting_link?: string;
  participants: string[]; // Array of participant names
  dress_code?: string;
  invitation_reference?: string;
  invitation_letter_reference?: string;
  attendance_link?: string;
  discussion_results?: string;
  whatsapp_reminder_enabled: boolean;
  group_notification_enabled: boolean;
  invited_by?: string;
  agenda?: string;
  attachments?: File[];
  photos?: File[];
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
  whatsapp_group_id?: string;
  notification_templates?: {
    group_daily?: string;
    individual_reminder?: string;
  };
}

// Review & Analytics Types
export interface ReviewStats {
  total_meetings: number;
  completed_meetings: number;
  attendance_rate: number;
  total_attendees: number;
  avg_duration: number;
  whatsapp_notifications: number;
  ontime_rate: number;
  whatsapp_response_rate: number;
  completion_rate: number;
  avg_participants: number;
}

export interface TopParticipant {
  id: string;
  name: string;
  seksi: string;
  meeting_count: number;
  attendance_rate: number;
}

export interface SeksiStats {
  seksi: string;
  meeting_count: number;
  participant_count: number;
  attendance_rate: number;
}

export interface MeetingTrend {
  period: string;
  count: number;
  completion_rate: number;
}

export interface TopInvitedBy {
  invited_by: string;
  meeting_count: number;
}