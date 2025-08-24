import React, { useEffect, useState } from 'react';
import { Save, MessageCircle, Clock, Info, Eye, Send, Calendar, Users } from 'lucide-react';
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
  const { success, error } = useToast();

  useEffect(() => {
    fetchSettings();
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

          {/* Group Message Preview Section */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">📱 Group Message Preview</h3>
                <p className="text-sm text-gray-500">Preview and test daily group notifications</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Select Date for Preview
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={previewDate}
                    onChange={(e) => setPreviewDate(e.target.value)}
                    className="rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                  />
                  <button
                    onClick={handlePreviewGroupMessage}
                    disabled={loadingPreview}
                    className={clsx(
                      'flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all',
                      loadingPreview
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    {loadingPreview ? 'Loading...' : 'Preview Message'}
                  </button>
                </div>
              </div>

              {/* Message Preview */}
              {showPreview && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        WhatsApp Group Message Preview
                      </h4>
                      <span className="text-sm text-gray-500">
                        {format(new Date(previewDate), 'dd MMM yyyy')}
                      </span>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                          {previewMessage}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  {previewMeetings.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        Meeting Details ({previewMeetings.length} meetings)
                      </h4>
                      <div className="space-y-3">
                        {previewMeetings.map((meeting, index) => (
                          <div key={meeting.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{meeting.title}</p>
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
                  <div className="flex justify-center">
                    <button
                      onClick={handleSendTestMessage}
                      disabled={sendingTest || !settings?.whatsapp_connected}
                      className={clsx(
                        'flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all',
                        sendingTest || !settings?.whatsapp_connected
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5'
                      )}
                    >
                      <Send className="w-4 h-4" />
                      {sendingTest ? 'Sending...' : 'Send Test Message to Group'}
                    </button>
                  </div>

                  {!settings?.whatsapp_connected && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          <strong>WhatsApp not connected.</strong> Please configure WhatsApp Bot settings to send test messages.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};