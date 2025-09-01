import React, { useState } from 'react';
import { X, MessageCircle, Send, Clock, Users } from 'lucide-react';
import { meetingsApi } from '../../services/api';
import { Meeting } from '../../types';
import { useToast } from '../../hooks/useToast';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  meeting,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [sendToAttendee, setSendToAttendee] = useState(true);
  const [sendToGroup, setSendToGroup] = useState(false);
  const { success, error } = useToast();

  const handleSendReminder = async () => {
    if (!meeting) return;

    if (!sendToAttendee && !sendToGroup) {
      error('Please select at least one recipient');
      return;
    }

    try {
      setLoading(true);
      await meetingsApi.sendWhatsAppReminder(meeting.id, {
        sendToAttendee,
        sendToGroup
      });
      
      let message = 'WhatsApp reminder sent successfully';
      if (sendToAttendee && sendToGroup) {
        message += ' to attendee and group';
      } else if (sendToAttendee) {
        message += ' to attendee';
      } else {
        message += ' to group';
      }
      
      success(message);
      onClose();
    } catch (err) {
      error('Failed to send WhatsApp reminder');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !meeting) return null;

  const startDateTime = new Date(`${meeting.date}T${meeting.start_time}`);
  const endDateTime = new Date(`${meeting.date}T${meeting.end_time}`);
  const formattedDate = format(startDateTime, 'dd MMM yyyy');
  const formattedStartTime = format(startDateTime, 'h:mm a');
  const formattedEndTime = format(endDateTime, 'h:mm a');
  const formattedDateTime = `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`;

  return (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl m-4">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">
                Send WhatsApp Reminder
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Send meeting reminder via WhatsApp
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Meeting Details & Recipients */}
            <div className="space-y-6">
              {/* Meeting Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Meeting Details
                </h4>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <h5 className="font-semibold text-green-800 mb-3 text-base">{meeting.title}</h5>
                  {meeting.discussion_results && (
                    <div className="mb-3 p-3 bg-green-100 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 flex-shrink-0">📝</span>
                        <div>
                          <span className="font-medium text-green-800">Description:</span>
                          <p className="text-green-700 mt-1 leading-relaxed text-sm">
                            {meeting.discussion_results.substring(0, 150)}{meeting.discussion_results.length > 150 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{formattedDate}, {formattedStartTime} - {formattedEndTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>Attendee: <span className="font-medium">{meeting.designated_attendee}</span></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 flex-shrink-0">📍</span>
                      <span className="font-medium">{meeting.location}</span>
                    </div>
                    {meeting.dress_code && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 flex-shrink-0">👔</span>
                        <span>Dress Code: <span className="font-medium">{meeting.dress_code}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipients Selection */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Select Recipients
                </h4>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendToAttendee}
                      onChange={(e) => setSendToAttendee(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-200 w-5 h-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base text-gray-800 font-semibold block">
                        Send to designated attendee
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Individual reminder to {meeting.designated_attendee}
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendToGroup}
                      onChange={(e) => setSendToGroup(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-200 w-5 h-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base text-gray-800 font-semibold block">
                        Send to WhatsApp group
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Notify the entire Subdirektorat group
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-base text-blue-800 font-semibold">
                    WhatsApp Bot is connected and ready
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Message Preview */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Message Preview
                </h4>
                <div className="bg-gray-50 rounded-xl p-5 border">
                  <div className="bg-white rounded-lg p-5 border shadow-sm">
                    <div className="font-semibold text-gray-800 mb-3 text-base">
                      ⏰ Meeting Reminder
                    </div>
                    <div className="space-y-2 leading-relaxed text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0">📋</span>
                        <span><strong className="text-gray-800">{meeting.title}</strong></span>
                      </div>
                      {meeting.discussion_results && (
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0">📝</span>
                          <div>
                            <span className="font-medium text-gray-800">Description:</span>
                            <p className="text-gray-700 mt-1 leading-relaxed text-xs">
                              {meeting.discussion_results.substring(0, 150)}{meeting.discussion_results.length > 150 ? '...' : ''}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0">📅</span>
                        <span className="font-medium">{formattedDateTime}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0">📍</span>
                        <span className="font-medium">{meeting.location}</span>
                      </div>
                      {meeting.dress_code && (
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0">👔</span>
                          <span>Dress Code: <span className="font-medium">{meeting.dress_code}</span></span>
                        </div>
                      )}
                      {meeting.attendance_link && (
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0">🔗</span>
                          <a href={meeting.attendance_link} className="text-blue-600 hover:underline font-medium">Attendance Link</a>
                        </div>
                      )}
                      {meeting.meeting_link && (
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0">💻</span>
                          <a href={meeting.meeting_link} className="text-blue-600 hover:underline font-medium">Join Meeting</a>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0">👥</span>
                        <span>Attendees: <span className="font-medium">{meeting.designated_attendees?.join(', ') || 'None'}</span></span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 italic">
                        📱 This is an automated reminder from Meeting Manager.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSendReminder}
            disabled={loading || (!sendToAttendee && !sendToGroup)}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all',
              loading || (!sendToAttendee && !sendToGroup)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            )}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reminder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};