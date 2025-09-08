import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { meetingsApi, api } from '../../services/api';
import { Meeting } from '../../types';
import { useToast } from '../../hooks/useToast';
import clsx from 'clsx';
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
  const [message, setMessage] = useState('');
  const [whatsappStatus, setWhatsappStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const { success, error } = useToast();

  useEffect(() => {
     if (isOpen) {
       checkWhatsAppStatus();
     }
   }, [isOpen]);

  const checkWhatsAppStatus = async () => {
    try {
      setWhatsappStatus('checking');
      const response = await api.settings.getWhatsAppStatus();
      const isConnected = response.data.whatsapp_connected || response.data.isConnected;
      setWhatsappStatus(isConnected ? 'connected' : 'disconnected');
    } catch (err) {
      console.error('Failed to check WhatsApp status:', err);
      setWhatsappStatus('disconnected');
    }
  };

  const handleSendReminder = async () => {
    if (!meeting) return;
    
    setLoading(true);
    try {
      // Check WhatsApp status before sending
      if (whatsappStatus !== 'connected') {
        error('WhatsApp is not connected. Please check the connection first.');
        return;
      }

      if (!sendToAttendee && !sendToGroup) {
        error('Please select at least one recipient option');
        return;
      }

      await meetingsApi.sendWhatsAppReminder(meeting.id, {
        sendToAttendee,
        sendToGroup,
        customMessage: message || undefined
      });
      
      let successMessage = 'WhatsApp reminder sent successfully';
      if (sendToAttendee && sendToGroup) {
        successMessage += ' to attendee and group';
      } else if (sendToAttendee) {
        successMessage += ' to attendee';
      } else {
        successMessage += ' to group';
      }
      
      success(successMessage);
      onClose();
    } catch (err) {
      console.error('Failed to send WhatsApp reminder:', err);
      error('Failed to send WhatsApp reminder. Please try again.');
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
 
              {/* Recipients */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Send To</h4>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={sendToAttendee}
                      onChange={(e) => setSendToAttendee(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-200 w-5 h-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base text-gray-800 font-semibold block">
                        Send to attendee
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Send reminder to individual attendees
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
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

              {/* Custom Message */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Custom Message (Optional)
                </h4>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter custom message for the reminder..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Status Info */}
              <div className={clsx(
                "rounded-xl p-4 border",
                whatsappStatus === 'connected' ? "bg-green-50 border-green-100" :
                whatsappStatus === 'disconnected' ? "bg-red-50 border-red-100" :
                "bg-yellow-50 border-yellow-100"
              )}>
                <div className="flex items-center gap-3">
                  {whatsappStatus === 'checking' && (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse flex-shrink-0"></div>
                      <span className="text-base text-yellow-800 font-semibold">
                        Checking WhatsApp connection...
                      </span>
                    </>
                  )}
                  {whatsappStatus === 'connected' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-base text-green-800 font-semibold">
                        WhatsApp Bot is connected and ready
                      </span>
                    </>
                  )}
                  {whatsappStatus === 'disconnected' && (
                    <>
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-base text-red-800 font-semibold">
                        WhatsApp Bot is not connected
                      </span>
                    </>
                  )}
                </div>
                {whatsappStatus === 'disconnected' && (
                  <div className="mt-2 text-sm text-red-700">
                    Please check the WhatsApp connection in settings before sending reminders.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Message Preview */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Message Preview
                </h4>
                
                {/* Individual Preview */}
                {sendToAttendee && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Individual Reminder:</h5>
                    <div className="bg-gray-50 rounded-xl p-5 border">
                      <div className="bg-white rounded-lg p-5 border shadow-sm">
                        <div className="font-semibold text-gray-800 mb-3 text-base">
                          *Pengingat Rapat*
                        </div>
                        <div className="space-y-2 leading-relaxed text-sm text-gray-700 whitespace-pre-line">
                          <div>📅 {meeting.title}</div>
                          <div>🕐 {formattedStartTime} - {formattedEndTime}</div>
                          <div>📍 {meeting.location || 'TBD'}</div>
                          <div className="mt-3">Rapat akan dimulai dalam 30 menit.</div>
                          {meeting.meeting_link && (
                            <div className="mt-2">
                              🔗 Link: <a href={meeting.meeting_link} className="text-blue-600 hover:underline font-medium">{meeting.meeting_link}</a>
                            </div>
                          )}
                          {message && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="font-medium text-gray-800">💬 Custom Message:</div>
                              <div className="text-gray-700 mt-1">{message}</div>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 italic">
                            📱 Pesan otomatis dari Meeting Manager
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Group Preview */}
                {sendToGroup && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Group Notification:</h5>
                    <div className="bg-gray-50 rounded-xl p-5 border">
                      <div className="bg-white rounded-lg p-5 border shadow-sm">
                        <div className="font-semibold text-gray-800 mb-3 text-base">
                          *Jadwal Rapat Hari Ini*
                        </div>
                        <div className="font-semibold text-gray-800 mb-3 text-sm">
                          *{formattedDate}*
                        </div>
                        <div className="space-y-3 leading-relaxed text-sm text-gray-700">
                          <div>
                            <div className="font-medium">1. {meeting.title}</div>
                            <div className="mt-1 ml-3 space-y-1">
                              <div>Waktu : {formattedStartTime} s.d. {formattedEndTime}</div>
                              <div>Lokasi : {meeting.location || 'TBD'}</div>
                              {meeting.meeting_link && (
                                <div>🔗 <a href={meeting.meeting_link} className="text-blue-600 hover:underline">{meeting.meeting_link}</a></div>
                              )}
                            </div>
                          </div>
                          {message && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="font-medium text-gray-800">💬 Custom Message:</div>
                              <div className="text-gray-700 mt-1">{message}</div>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 italic">
                            📱 Pesan otomatis dari Meeting Manager<br/>
                            🤖 Subdirektorat Intelijen
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* No selection message */}
                {!sendToAttendee && !sendToGroup && (
                  <div className="bg-gray-50 rounded-xl p-5 border">
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Pilih penerima untuk melihat preview pesan</p>
                    </div>
                  </div>
                )}
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
            disabled={loading || (!sendToAttendee && !sendToGroup) || whatsappStatus !== 'connected'}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all',
              loading || (!sendToAttendee && !sendToGroup) || whatsappStatus !== 'connected'
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