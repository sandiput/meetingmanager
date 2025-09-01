import React, { useEffect, useState } from 'react';
import { Save, MessageCircle, Clock, Info, Eye, Send, Calendar, Users, User, MapPin, Shirt } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { settingsApi } from '../services/api';
import { Settings as SettingsType, UpdateSettingsForm, Meeting } from '../types';
import { useToast } from '../hooks/useToast';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [formData, setFormData] = useState<UpdateSettingsForm>({
    group_notification_time: '07:00',
    group_notification_enabled: true,
    individual_reminder_minutes: 30,
    individual_reminder_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDate, setPreviewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [previewMessage, setPreviewMessage] = useState('');
  const [previewMeetings, setPreviewMeetings] = useState<Meeting[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [selectedPersonalMeeting, setSelectedPersonalMeeting] = useState<Meeting | null>(null);
  const [sendingPersonalTest, setSendingPersonalTest] = useState(false);
  const [whatsappGroups, setWhatsappGroups] = useState<{ id: string; name: string; participants: number }[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchWhatsAppGroups();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.get();
      const data = response.data;
      setSettings(data);
      setFormData({
        group_notification_time: data.group_notification_time,
        group_notification_enabled: data.group_notification_enabled,
        individual_reminder_minutes: data.individual_reminder_minutes,
        individual_reminder_enabled: data.individual_reminder_enabled,
      });
    } catch (err) {
      error('Failed to load settings');
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWhatsAppGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await settingsApi.getWhatsAppGroups();
      setWhatsappGroups(response.data);
    } catch (err) {
      console.error('Failed to load WhatsApp groups:', err);
      // Don't show error toast as this is optional feature
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await settingsApi.update(formData);
      setSettings(response.data);
      success('Settings saved successfully');
    } catch (err) {
      error('Failed to save settings');
      console.error('Settings update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateSettingsForm,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreviewGroupMessage = async () => {
    try {
      setLoadingPreview(true);
      const response = await settingsApi.previewGroupMessage(previewDate);
      setPreviewMessage(response.data.message);
      setPreviewMeetings(response.data.meetings);
      setShowPreview(true);
    } catch (err) {
      error('Failed to load message preview');
      console.error('Preview error:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSendTestMessage = async () => {
    try {
      setSendingTest(true);
      await settingsApi.sendTestGroupMessage(previewDate);
      success('Test message sent to WhatsApp group successfully!');
    } catch (err) {
      error('Failed to send test message');
      console.error('Send test error:', err);
    } finally {
      setSendingTest(false);
    }
  };

  const generatePersonalMessage = (meeting: Meeting): string => {
    // Use the same format as backend Settings model formatIndividualMessage
    let message = `⏰ _Meeting Reminder_\n\n`;
    message += `📋 _${meeting.title}_\n`;
    message += `📅 ${meeting.date}\n`;
    message += `⏰ ${meeting.start_time} - ${meeting.end_time}\n`;
    message += `📍 ${meeting.location}\n`;
    
    if (meeting.meeting_link) {
      message += `💻 Join: ${meeting.meeting_link}\n`;
    }
    
    if (meeting.dress_code) {
      message += `👔 Dress Code: ${meeting.dress_code}\n`;
    }
    
    if (meeting.attendance_link) {
      message += `🔗 Attendance: ${meeting.attendance_link}\n`;
    }
    
    message += `\nHarap bersiap dan datang tepat waktu.\n\n`;
    message += `📱 Pesan otomatis dari Meeting Manager\n`;
    message += `🤖 Subdirektorat Intelijen`;

    return message;
  };

  const handleSendTestPersonalMessage = async (meeting: Meeting) => {
    try {
      setSendingPersonalTest(true);
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      success(`Test personal reminder sent to ${meeting.designated_attendee}!`);
    } catch (err) {
      error('Failed to send test personal reminder');
      console.error('Send personal test error:', err);
    } finally {
      setSendingPersonalTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header
        title="Settings"
        subtitle="Configure your notification preferences."
      />
      
      <div className="container mx-auto px-6 py-8 sm:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* WhatsApp Group Notifications */}
          <div className="rounded-lg bg-white p-6 shadow-md border">
            <h3 className="mb-1 text-xl font-bold text-gray-800">
              WhatsApp Group Notifications
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Schedule routine messages for your WhatsApp group.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MessageCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-800">
                    Daily Routine Message
                  </p>
                  <p className="text-sm text-gray-500">
                    Send a message to the group every day.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="time"
                    value={formData.group_notification_time}
                    onChange={(e) => handleInputChange('group_notification_time', e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={!formData.group_notification_enabled}
                  />
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.group_notification_enabled}
                    onChange={(e) => handleInputChange('group_notification_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* WhatsApp Groups List */}
          <div className="rounded-lg bg-white p-6 shadow-md border">
            <h3 className="mb-1 text-xl font-bold text-gray-800">
              Available WhatsApp Groups
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              List of WhatsApp groups that the bot is currently part of.
            </p>
            
            {loadingGroups ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Loading groups...</span>
              </div>
            ) : whatsappGroups.length > 0 ? (
              <div className="space-y-3">
                {whatsappGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Users className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-semibold text-gray-800">{group.name}</p>
                        <p className="text-sm text-gray-500">
                          {group.participants} participants • ID: {group.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(group.id);
                          success('Group ID copied to clipboard!');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Copy ID
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">How to use:</p>
                      <p className="text-sm text-blue-700 mt-1">
                        The bot will automatically detect when it's added to new groups. 
                        You can copy the Group ID to configure notifications for specific groups.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No WhatsApp groups found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add the bot to a WhatsApp group to see it listed here.
                </p>
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={fetchWhatsAppGroups}
                disabled={loadingGroups}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loadingGroups ? 'Refreshing...' : 'Refresh Groups'}
              </button>
            </div>
          </div>

          {/* Employee Meeting Reminders */}
          <div className="rounded-lg bg-white p-6 shadow-md border">
            <h3 className="mb-1 text-xl font-bold text-gray-800">
              Employee Meeting Reminders
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Send automated reminders to designated employees before their meetings.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-semibold text-gray-800">
                    Pre-Meeting Reminder
                  </p>
                  <p className="text-sm text-gray-500">
                    Notify employees before a scheduled meeting.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.individual_reminder_minutes}
                    onChange={(e) => handleInputChange('individual_reminder_minutes', parseInt(e.target.value))}
                    className="w-20 rounded-md border-gray-300 text-center shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={!formData.individual_reminder_enabled}
                  />
                  <span className="text-sm text-gray-600">minutes before</span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.individual_reminder_enabled}
                    onChange={(e) => handleInputChange('individual_reminder_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* WhatsApp Connection Status */}
          {settings && (
            <div className={clsx(
              'rounded-lg p-4 border',
              settings.whatsapp_connected
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            )}>
              <div className="flex items-center gap-2">
                <Info className={clsx(
                  'w-5 h-5',
                  settings.whatsapp_connected ? 'text-green-600' : 'text-yellow-600'
                )} />
                <div>
                  <p className={clsx(
                    'text-sm font-medium',
                    settings.whatsapp_connected ? 'text-green-800' : 'text-yellow-800'
                  )}>
                    WhatsApp {settings.whatsapp_connected ? 'Connected' : 'Disconnected'}
                  </p>
                  <p className={clsx(
                    'text-xs',
                    settings.whatsapp_connected ? 'text-green-600' : 'text-yellow-600'
                  )}>
                    {settings.whatsapp_connected 
                      ? 'Notifications will be sent automatically' 
                      : 'Please check your WhatsApp Bot configuration'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
        {/* Message Preview Sections */}
        <div className="space-y-6">
          {/* Group Message Preview */}
          <div className="rounded-lg bg-white p-6 shadow-md border">
            <h3 className="mb-1 text-xl font-bold text-gray-800">
              Group Message Preview
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Preview and test daily group notifications.
            </p>

            <div className="space-y-4">
              {/* Date Selection */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date for Preview
                  </label>
                  <input
                    type="date"
                    value={previewDate}
                    onChange={(e) => setPreviewDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-shrink-0 pt-6">
                  <button
                    onClick={handlePreviewGroupMessage}
                    disabled={loadingPreview}
                    className={clsx(
                      'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all',
                      loadingPreview
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    {loadingPreview ? 'Loading...' : 'Preview'}
                  </button>
                </div>
              </div>

              {/* Message Preview */}
              {showPreview && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        WhatsApp Group Message
                      </h4>
                      <span className="text-sm text-gray-500">
                        {format(new Date(previewDate), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {previewMessage}
                      </pre>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  {previewMeetings.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Meeting Details ({previewMeetings.length} meetings)
                      </h4>
                      <div className="space-y-2">
                        {previewMeetings.map((meeting, index) => (
                          <div key={meeting.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{meeting.title}</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(`${meeting.date}T${meeting.start_time}`), 'HH:mm')} - 
                                {format(new Date(`${meeting.date}T${meeting.end_time}`), 'HH:mm')} • {meeting.location}
                              </p>
                              <p className="text-sm text-gray-500">👤 {meeting.designated_attendee}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Test Send Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendTestMessage}
                      disabled={sendingTest || !settings?.whatsapp_connected}
                      className={clsx(
                        'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all',
                        sendingTest || !settings?.whatsapp_connected
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      <Send className="w-4 h-4" />
                      {sendingTest ? 'Sending...' : 'Send Test Message'}
                    </button>
                  </div>

                  {!settings?.whatsapp_connected && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          <strong>WhatsApp not connected.</strong> Please configure WhatsApp Bot settings.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Personal Message Preview */}
          <div className="rounded-lg bg-white p-6 shadow-md border">
            <h3 className="mb-1 text-xl font-bold text-gray-800">
              Personal Message Preview
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Preview individual meeting reminders.
            </p>

            <div className="space-y-4">
              {/* Meeting Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Meeting for Personal Reminder Preview
                </label>
                <div className="space-y-2">
                  {previewMeetings.length > 0 ? (
                    <div className="space-y-2">
                      {previewMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => setSelectedPersonalMeeting(meeting)}
                        >
                          <input
                            type="radio"
                            name="personalMeeting"
                            checked={selectedPersonalMeeting?.id === meeting.id}
                            onChange={() => setSelectedPersonalMeeting(meeting)}
                            className="text-indigo-600 focus:ring-indigo-200"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{meeting.title}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(`${meeting.date}T${meeting.start_time}`), 'HH:mm')} - 
                              {format(new Date(`${meeting.date}T${meeting.end_time}`), 'HH:mm')} • {meeting.location}
                            </p>
                            <p className="text-sm text-gray-500">👤 {meeting.designated_attendee}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No meetings found for selected date</p>
                      <p className="text-xs">Please select a date with meetings first</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Message Preview */}
              {selectedPersonalMeeting && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        Personal WhatsApp Reminder
                      </h4>
                      <span className="text-sm text-gray-500">
                        To: {selectedPersonalMeeting.designated_attendee}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {generatePersonalMessage(selectedPersonalMeeting)}
                      </pre>
                    </div>
                  </div>

                  {/* Meeting Details Card */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Meeting Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Date & Time</p>
                            <p className="font-medium text-gray-800">
                              {format(new Date(selectedPersonalMeeting.date), 'dd MMM yyyy')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(`${selectedPersonalMeeting.date}T${selectedPersonalMeeting.start_time}`), 'HH:mm')} - 
                              {format(new Date(`${selectedPersonalMeeting.date}T${selectedPersonalMeeting.end_time}`), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-medium text-gray-800">{selectedPersonalMeeting.location}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Designated Attendee</p>
                            <p className="font-medium text-gray-800">{selectedPersonalMeeting.designated_attendee}</p>
                          </div>
                        </div>
                        {selectedPersonalMeeting.dress_code && (
                          <div className="flex items-center gap-3">
                            <Shirt className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Dress Code</p>
                              <p className="font-medium text-gray-800">{selectedPersonalMeeting.dress_code}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reminder Settings Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-blue-800">
                        <strong>Reminder Schedule:</strong> This message will be sent {formData.individual_reminder_minutes} minutes before the meeting starts
                      </p>
                    </div>
                  </div>

                  {/* Test Send Personal Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSendTestPersonalMessage(selectedPersonalMeeting)}
                      disabled={sendingPersonalTest || !settings?.whatsapp_connected}
                      className={clsx(
                        'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all',
                        sendingPersonalTest || !settings?.whatsapp_connected
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      )}
                    >
                      <Send className="w-4 h-4" />
                      {sendingPersonalTest ? 'Sending...' : 'Send Test Reminder'}
                    </button>
                  </div>

                  {!settings?.whatsapp_connected && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          <strong>WhatsApp not connected.</strong> Please configure WhatsApp Bot settings.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={clsx(
                'flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all',
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
              )}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};