import React from 'react';
import { Clock, MapPin, User, CheckCircle, Ruler as Schedule, MoreVertical, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Meeting } from '../../types';
import { getMeetingStatus } from '../../utils/meetingUtils';
import { clsx } from 'clsx';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

interface MeetingCardProps {
  meeting: Meeting;
  isAuthenticated?: boolean;
  onView: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onSendReminder: (meeting: Meeting) => void;
}

const statusConfig = {
  incoming: {
    label: 'Incoming',
    icon: CheckCircle,
    className: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800',
  },
};

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  isAuthenticated = false,
  onView,
  onEdit,
  onDelete,
  onSendReminder,
}) => {
  const status = getMeetingStatus(meeting);
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  
  // Robust parsing for meeting date & times
  const parseDate = (dateStr: string) => new Date(dateStr);
  const parseTime = (timeStr: string) => {
    // If backend returns ISO string with date part
    if (timeStr && timeStr.includes('T')) return new Date(timeStr);
    // Fallback: combine meeting.date (which may be ISO) with time
    const dateOnly = meeting.date.includes('T') ? meeting.date.split('T')[0] : meeting.date;
    return new Date(`${dateOnly}T${timeStr}`);
  };

  const startDateTime = parseTime(meeting.start_time);
  const endDateTime = parseTime(meeting.end_time);
  const meetingDate = parseDate(meeting.date);

  const formatRelativeTime = () => {
    if (isToday(startDateTime)) return 'Today';
    if (isTomorrow(startDateTime)) return 'Tomorrow';
    const daysDiff = differenceInDays(startDateTime, new Date());
    return daysDiff > 0 ? `in ${daysDiff} days` : `${Math.abs(daysDiff)} days ago`;
  };

  // Safely resolve designated attendee name
  const attendeeName = (meeting as any).designated_attendee || meeting.attendees?.[0]?.name || 'Unknown';
  const attendeeInitial = typeof attendeeName === 'string' && attendeeName.length > 0 ? attendeeName.charAt(0).toUpperCase() : '?';

  return (
    <div 
      className="bg-gradient-to-r from-white to-slate-50 rounded-2xl p-6 shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer"
      data-meeting-id={meeting.id}
      onClick={() => onView(meeting)}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-800">{meeting.title}</h3>
            <span className={clsx(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold gap-1',
              statusInfo.className
            )}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </span>
          </div>
          {meeting.discussion_results && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {meeting.discussion_results}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {meeting.whatsapp_reminder_enabled && (
            <button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-sm"
              title="Auto-reminder set"
            >
              <Clock className="w-3 h-3" />
            </button>
          )}
          <div className="relative group">
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="absolute right-0 z-10 mt-0 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(meeting);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                <Eye className="w-4 h-4" />
                Lihat Detail
              </button>
              {isAuthenticated && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(meeting);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Meeting
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendReminder(meeting);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    Send WhatsApp Reminder
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(meeting);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium uppercase text-gray-500 mb-1">
            Date & Time
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {format(meetingDate, 'dd MMM yyyy')}
          </p>
          <p className="text-xs text-gray-600">
            {format(startDateTime, 'h:mm a')} - {format(endDateTime, 'h:mm a')}
          </p>
          <p className="text-xs text-gray-500 mt-1">{formatRelativeTime()}</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium uppercase text-gray-500 mb-1">
            Location
          </p>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {meeting.location}
          </p>
          {meeting.meeting_link && (
            <a
              href={meeting.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 block"
            >
              Join Meeting
            </a>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium uppercase text-gray-500 mb-1">
            Attendee
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {attendeeInitial}
            </div>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {attendeeName}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium uppercase text-gray-500 mb-1">
            Notification
          </p>
          <div className="flex items-center gap-1">
            {meeting.whatsapp_reminder_enabled ? (
              <>
                <CheckCircle className="text-green-500 w-4 h-4" />
                <p className="text-sm font-semibold text-green-600">
                  WhatsApp Ready
                </p>
              </>
            ) : (
              <>
                <Clock className="text-yellow-500 w-4 h-4" />
                <p className="text-sm font-semibold text-yellow-600">
                  Scheduled
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};