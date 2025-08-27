import React from 'react';
import { Clock, MapPin, User, CheckCircle, Ruler as Schedule, MoreVertical, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Meeting } from '../../types';
import { getMeetingStatus } from '../../utils/meetingUtils';
import { clsx } from 'clsx';
import { format, isToday, isTomorrow, differenceInDays, isPast } from 'date-fns';

interface MeetingCardProps {
  meeting: Meeting;
  isAuthenticated?: boolean; // Keep for backward compatibility but always true
  onView: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onSendReminder: (meeting: Meeting) => void;
}

const statusConfig = {
  incoming: {
    label: 'Incoming',
    icon: CheckCircle,
    className: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200',
  },
};

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  isAuthenticated = true, // Always authenticated now
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
    const now = new Date();
    
    if (isToday(startDateTime)) {
      return isPast(startDateTime) ? 'Today (Completed)' : 'Today';
    }
    
    if (isTomorrow(startDateTime)) {
      return 'Tomorrow';
    }
    
    const daysDiff = differenceInDays(startDateTime, now);
    
    if (daysDiff > 0) {
      return `in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
    } else {
      const absDays = Math.abs(daysDiff);
      return `${absDays} day${absDays > 1 ? 's' : ''} ago`;
    }
  };
console.log('meeting : ',meeting);
  // Safely resolve attendee names - prioritize participants array if available
  let attendeeNames = [];
  let primaryAttendeeName = 'Unknown';
  
  // Check if we have participants data from the relationship
  if (meeting.participants && meeting.participants.length > 0) {
    attendeeNames = meeting.participants.map(participant => participant.name);
    primaryAttendeeName = attendeeNames[0];
  } else if (meeting.designated_attendees && meeting.designated_attendees.length > 0) {
    // Fall back to designated_attendees if participants not available
    attendeeNames = meeting.designated_attendees;
    primaryAttendeeName = attendeeNames[0];
  } else if (meeting.designated_attendee) {
    // Last fallback to legacy field
    attendeeNames = [meeting.designated_attendee];
    primaryAttendeeName = meeting.designated_attendee;
  }
  
  const attendeeInitial = typeof primaryAttendeeName === 'string' && primaryAttendeeName.length > 0 ? primaryAttendeeName.charAt(0).toUpperCase() : '?';

  // Add visual indicator for completed meetings
  const isCompleted = status === 'completed';
  const cardOpacity = isCompleted ? 'opacity-75' : 'opacity-100';
  const borderColor = isCompleted ? 'border-l-gray-400' : 'border-l-indigo-500';
  return (
    <div 
      className={clsx(
        "bg-gradient-to-r from-white to-slate-50 rounded-2xl p-6 shadow-sm border-l-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer",
        cardOpacity,
        borderColor
      )}
      data-meeting-id={meeting.id}
      onClick={() => onView(meeting)}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={clsx(
              "text-lg font-bold",
              isCompleted ? "text-gray-600" : "text-gray-800"
            )}>
              {meeting.title}
            </h3>
            <span className={clsx(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold gap-1 border',
              statusInfo.className
            )}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </span>
          </div>
          {meeting.discussion_results && (
            <p className={clsx(
              "text-sm mb-3 line-clamp-2",
              isCompleted ? "text-gray-500" : "text-gray-600"
            )}>
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
            Attendees
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {attendeeInitial}
              </div>
              {attendeeNames.length > 1 && (
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  +{attendeeNames.length - 1}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {primaryAttendeeName}
              </p>
              {attendeeNames.length > 1 && (
                <p className="text-xs text-gray-500">
                  +{attendeeNames.length - 1} others
                </p>
              )}
            </div>
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
                  Auto Reminder
                </p>
              </>
            ) : (
              <>
                <Clock className="text-gray-500 w-4 h-4" />
                <p className="text-sm font-semibold text-yellow-600">
                  Manual Only
                </p>
              </>
            )}
          </div>
          {meeting.group_notification_enabled && (
            <p className="text-xs text-gray-500 mt-1">
              📢 Group notification enabled
            </p>
          )}
        </div>
      </div>
    </div>
  );
};