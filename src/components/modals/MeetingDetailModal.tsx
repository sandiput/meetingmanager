import React from 'react';
import { X, Calendar, Clock, MapPin, User, Users, FileText, Link, Shirt, Hash, MessageCircle, Info } from 'lucide-react';
import { Meeting } from '../../types';
import { getMeetingStatus } from '../../utils/meetingUtils';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface MeetingDetailModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  isOpen,
  meeting,
  onClose,
}) => {
  if (!isOpen || !meeting) return null;

  const status = getMeetingStatus(meeting);
  
  // Validasi data tanggal dan waktu sebelum membuat objek Date
  let formattedDate = 'N/A';
  let formattedStartTime = 'N/A';
  let formattedEndTime = 'N/A';
  
  try {
    if (meeting.date && meeting.start_time) {
      const startDateTime = new Date(`${meeting.date}T${meeting.start_time}`);
      if (!isNaN(startDateTime.getTime())) {
        formattedDate = format(startDateTime, 'dd MMM yyyy');
        formattedStartTime = format(startDateTime, 'h:mm a');
      }
    }
    
    if (meeting.date && meeting.end_time) {
      const endDateTime = new Date(`${meeting.date}T${meeting.end_time}`);
      if (!isNaN(endDateTime.getTime())) {
        formattedEndTime = format(endDateTime, 'h:mm a');
      }
    }
  } catch (error) {
    console.error('Error formatting date/time:', error);
  }

  const statusConfig = {
    incoming: {
      label: 'Incoming',
      className: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800',
    },
    completed: {
      label: 'Completed',
      className: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800',
    },
    default: {
      label: 'Unknown',
      className: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800',
    }
  };

  // Pastikan statusInfo selalu memiliki nilai valid
  let statusInfo;
  try {
    statusInfo = statusConfig[status] || statusConfig.default;
  } catch (error) {
    console.error('Error getting status info:', error);
    statusInfo = statusConfig.default;
  }

  return (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl m-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Detail Meeting</h2>
              <p className="text-sm text-gray-600 mt-1">
                Informasi lengkap meeting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Meeting Title & Status */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{meeting.title}</h3>
                <span className={clsx(
                  'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
                  statusInfo.className
                )}>
                  {statusInfo.label}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tanggal & Waktu</p>
                    <p className="text-lg font-semibold text-gray-800">{formattedDate}</p>
                    <p className="text-sm text-gray-600">{formattedStartTime} - {formattedEndTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lokasi</p>
                    <p className="text-lg font-semibold text-gray-800">{meeting.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendee Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Peserta Meeting ({meeting.attendees?.length || meeting.designated_attendees?.length || 0} orang)
              </h4>
              <div className="space-y-3">
                {meeting.attendees && meeting.attendees.length > 0 ? (
                  meeting.attendees.map((attendee, index) => (
                    <div key={attendee.id || index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                        {attendee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-800">{attendee.name}</p>
                        <p className="text-sm text-gray-600">{attendee.seksi}</p>
                        <p className="text-xs text-gray-500">{attendee.whatsapp_number}</p>
                      </div>
                    </div>
                  ))
                ) : meeting.designated_attendees?.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                      {attendee.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{attendee}</p>
                      <p className="text-sm text-gray-600">Peserta yang Ditunjuk</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Tidak ada peserta yang ditunjuk</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Attendee Summary */}
            {((meeting.attendees && meeting.attendees.length > 0) || (meeting.designated_attendees && meeting.designated_attendees.length > 0)) && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <p className="text-sm font-medium text-indigo-800">
                    Ringkasan Peserta
                  </p>
                </div>
                <div className="text-sm text-indigo-700">
                  <p>Total: {meeting.attendees?.length || meeting.designated_attendees?.length || 0} peserta</p>
                  <p className="mt-1">
                    {meeting.attendees && meeting.attendees.length > 0 
                      ? meeting.attendees.map(a => a.name).join(', ')
                      : meeting.designated_attendees?.join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Meeting Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {meeting.dress_code && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Shirt className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-medium text-gray-600">Dress Code</p>
                    </div>
                    <p className="text-base font-semibold text-gray-800">{meeting.dress_code}</p>
                  </div>
                )}

                {meeting.invitation_reference && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Hash className="w-5 h-5 text-orange-600" />
                      <p className="text-sm font-medium text-gray-600">Referensi Undangan</p>
                    </div>
                    <p className="text-base font-semibold text-gray-800">{meeting.invitation_reference}</p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {meeting.attendance_link && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Link className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-gray-600">Link Kehadiran</p>
                    </div>
                    <a
                      href={meeting.attendance_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {meeting.attendance_link}
                    </a>
                  </div>
                )}

                {meeting.meeting_link && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Link className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-gray-600">Link Meeting</p>
                    </div>
                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-green-600 hover:text-green-800 hover:underline break-all"
                    >
                      {meeting.meeting_link}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Discussion Results */}
            {meeting.discussion_results && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Hasil Diskusi Meeting
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {meeting.discussion_results}
                  </p>
                </div>
              </div>
            )}

            {/* WhatsApp Notification Settings */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-semibold text-green-800">
                  Pengaturan Notifikasi WhatsApp
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-4 h-4 rounded-full',
                    meeting.whatsapp_reminder_enabled ? 'bg-green-500' : 'bg-gray-300'
                  )} />
                  <span className="text-sm text-green-700">
                    Reminder ke peserta (30 menit sebelumnya)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-4 h-4 rounded-full',
                    meeting.group_notification_enabled ? 'bg-green-500' : 'bg-gray-300'
                  )} />
                  <span className="text-sm text-green-700">
                    Notifikasi grup WhatsApp
                  </span>
                </div>
              </div>
            </div>

            {/* Meeting Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">
                    Informasi Meeting
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>Dibuat: {format(new Date(meeting.created_at), 'dd MMM yyyy, HH:mm')}</p>
                    <p>Terakhir diubah: {format(new Date(meeting.updated_at), 'dd MMM yyyy, HH:mm')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="rounded-lg border-2 border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};