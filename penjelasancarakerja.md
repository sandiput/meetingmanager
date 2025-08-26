Cara kerja dan Elemen data yang dibutuhkan
🏠 1. DASHBOARD
Proses Kerja:
Load Statistics: Fetch data statistik dari API
Display Metrics: Tampilkan 4 kartu statistik utama
Load All Meetings: Ambil semua meeting dan urutkan (upcoming first)
Real-time Status: Hitung status meeting berdasarkan waktu saat ini
Auto Refresh: Update data setiap 30 detik
Elemen Data:

// Dashboard Statistics
interface DashboardStats {
total_meetings: number; // Total semua meeting
this_week_meetings: number; // Meeting minggu ini
notifications_sent: number; // Notifikasi terkirim
active_participants: number; // Peserta aktif
}

// Meeting Display Data
interface Meeting {
id: string;
title: string; // Judul meeting
date: string; // Tanggal (YYYY-MM-DD)
start_time: string; // Waktu mulai (HH:mm)
end_time: string; // Waktu selesai (HH:mm)
location: string; // Lokasi meeting
meeting_link?: string; // Link virtual meeting
designated_attendees: string[]; // Array nama peserta
dress_code?: string; // Kode berpakaian
invitation_reference?: string; // Nomor surat undangan
attendance_link?: string; // Link absensi
discussion_results?: string; // Hasil diskusi
whatsapp_reminder_enabled: boolean;
group_notification_enabled: boolean;
created_at: string;
updated_at: string;
}
Actions Available:
➕ New Meeting: Buka modal create meeting
👁️ View Details: Lihat detail lengkap meeting
✏️ Edit Meeting: Ubah data meeting
💬 Send WhatsApp: Kirim reminder manual
🗑️ Delete Meeting: Hapus meeting
👥 2. PARTICIPANTS
Proses Kerja:
Load Participant List: Fetch data peserta dengan pagination
Display Table: Tampilkan dalam format tabel dengan kolom lengkap
Search & Filter: Real-time search berdasarkan nama/NIP/seksi
CRUD Operations: Create, edit, delete peserta
WhatsApp Validation: Format dan validasi nomor WhatsApp Indonesia
Elemen Data:

interface Participant {
id: string;
name: string; // Nama lengkap
nip: string; // NIP 18 digit
whatsapp_number: string; // Format +62xxxxxxxxxx
seksi: string; // Unit kerja
is_active: boolean; // Status aktif
created_at: string;
updated_at: string;
}

// Form Input Data
interface CreateParticipantForm {
name: string; // Required, 2-100 karakter
nip: string; // Required, exactly 18 digits
whatsapp_number: string; // Required, format Indonesia
seksi: string; // Required, dropdown selection
}

// Seksi Options
const SEKSI_OPTIONS = [
'Intelijen Kepabeanan I',
'Intelijen Kepabeanan II',
'Intelijen Cukai',
'Dukungan Operasi Intelijen'
];
Validasi Data:
NIP: Harus 18 digit angka
WhatsApp: Format +62xxxxxxxxxx (10-13 digit setelah +62)
Name: Minimal 2 karakter, maksimal 100
Seksi: Harus dari dropdown yang tersedia
Actions Available:
➕ Add Participant: Form input peserta baru
✏️ Edit: Ubah data peserta
🗑️ Delete: Hapus peserta (dengan konfirmasi)
🔍 Search: Pencarian real-time
📊 3. REVIEW & ANALYTICS
Proses Kerja:
Select Period: Pilih periode analisis (weekly/monthly/yearly)
Calculate Statistics: Hitung metrics dari data meeting
Generate Reports: Buat laporan visual dan numerik
Export Data: Download laporan dalam format JSON
Trend Analysis: Analisis pola meeting over time
Elemen Data:

// Review Statistics
interface ReviewStats {
total_meetings: number; // Total meeting
completed_meetings: number; // Meeting selesai
attendance_rate: number; // Persentase kehadiran
total_attendees: number; // Total peserta
avg_duration: number; // Rata-rata durasi (jam)
whatsapp_notifications: number; // Notifikasi terkirim
ontime_rate: number; // Tingkat ketepatan waktu
whatsapp_response_rate: number; // Response rate WhatsApp
completion_rate: number; // Tingkat penyelesaian
avg_participants: number; // Rata-rata peserta per meeting
}

// Top Participants
interface TopParticipant {
id: string;
name: string; // Nama peserta
seksi: string; // Unit kerja
meeting_count: number; // Jumlah meeting diikuti
attendance_rate: number; // Persentase kehadiran
}

// Seksi Statistics
interface SeksiStats {
seksi: string; // Nama seksi
meeting_count: number; // Jumlah meeting
participant_count: number; // Jumlah peserta aktif
attendance_rate: number; // Tingkat kehadiran seksi
}

// Meeting Trends
interface MeetingTrend {
period: string; // Periode (Week 1, Week 2, etc)
count: number; // Jumlah meeting
completion_rate: number; // Tingkat penyelesaian
}
Visualisasi Data:
📈 Bar Charts: Distribusi meeting per seksi
🏆 Ranking: Top 10 peserta paling aktif
📊 Trend Lines: Pola meeting over time
🎯 KPI Cards: Metrics utama dengan persentase
⚙️ 4. SETTINGS
Proses Kerja:
Load Current Settings: Ambil konfigurasi saat ini
WhatsApp Status Check: Verifikasi koneksi WhatsApp Bot
Message Preview: Generate preview pesan untuk tanggal tertentu
Test Messaging: Kirim test message ke grup/individu
Save Configuration: Update settings ke database
Elemen Data:

interface Settings {
id: string;
group_notification_time: string; // Format "HH:mm"
group_notification_enabled: boolean; // Toggle grup notifikasi
individual_reminder_minutes: number; // Menit sebelum meeting
individual_reminder_enabled: boolean; // Toggle reminder individu
whatsapp_connected: boolean; // Status koneksi
updated_at: string;
}

// Update Form
interface UpdateSettingsForm {
group_notification_time: string; // Time picker
group_notification_enabled: boolean; // Checkbox
individual_reminder_minutes: number; // Number input (1-120)
individual_reminder_enabled: boolean; // Checkbox
}
WhatsApp Message Templates:

// Group Daily Message
const groupMessage = `
🗓️ _Jadwal Meeting Hari Ini_
📅 ${formattedDate}

${meetings.map((meeting, index) => `
${index + 1}. _${meeting.title}_
⏰ ${meeting.start_time} - ${meeting.end_time}
📍 ${meeting.location}
👥 ${meeting.designated_attendees.join(', ')}
${meeting.dress_code ? `👔 ${meeting.dress_code}` : ''}
`).join('\n')}

📱 Pesan otomatis dari Meeting Manager
🤖 Subdirektorat Intelijen
`;

// Individual Reminder
const individualMessage = `
⏰ _Meeting Reminder_

📋 _${meeting.title}_
📅 ${formattedDate}
⏰ ${meeting.start_time} - ${meeting.end_time}
📍 ${meeting.location}
${meeting.meeting_link ? `💻 Join: ${meeting.meeting_link}` : ''}
${meeting.dress_code ? `👔 Dress Code: ${meeting.dress_code}` : ''}
${meeting.attendance_link ? `🔗 Attendance: ${meeting.attendance_link}` : ''}

Harap bersiap dan datang tepat waktu.

📱 Pesan otomatis dari Meeting Manager
🤖 Subdirektorat Intelijen
`;
🔍 GLOBAL SEARCH (Sidebar)
Proses Kerja:
Real-time Search: Ketik query di search box
Debounced API Call: Delay 300ms untuk optimasi
Multi-field Search: Cari di title, location, attendees
Display Results: Dropdown dengan meeting cards
Quick Access: Klik untuk buka detail modal
Elemen Data:

// Search Query & Results
interface SearchState {
query: string; // Search input
results: Meeting[]; // Hasil pencarian
isSearching: boolean; // Loading state
showResults: boolean; // Toggle dropdown
}

// Search Fields
const searchFields = [
'title', // Judul meeting
'location', // Lokasi
'designated_attendees', // Nama peserta
'discussion_results' // Hasil diskusi
];
📱 WHATSAPP INTEGRATION WORKFLOW
Automated Notifications:
Daily Group Message: Jam 07:00 setiap hari
Individual Reminders: 30 menit sebelum meeting
Manual Reminders: On-demand dari dashboard
Message Delivery Process:
Queue Job: Background processing
WhatsApp API Call: Send via Business API
Delivery Tracking: Log status dan response
Error Handling: Retry mechanism untuk failed messages
Data Flow:

Meeting Created → Schedule Notifications → Queue Jobs →
WhatsApp API → Delivery Confirmation → Update Logs
🔄 DATA SYNCHRONIZATION
Real-time Updates:
Auto Refresh: Dashboard update setiap 30 detik
Status Calculation: Dynamic status berdasarkan current time
Cache Management: Optimized data loading
Error Recovery: Fallback mechanisms
Data Consistency:
Referential Integrity: Participant names linked to meetings
Cascade Updates: Update participant name updates all meetings
Soft Deletes: Preserve historical data
Audit Trail: Track all changes dengan timestamps
Setiap menu memiliki workflow yang terintegrasi dengan sistem notifikasi WhatsApp dan database yang konsisten untuk memastikan operasional yang smooth dan reliable.
