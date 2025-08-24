import React, { useEffect, useState } from 'react';
import { Save, MessageCircle, Clock, Info } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { settingsApi } from '../services/api';
import { Settings as SettingsType, UpdateSettingsForm } from '../types';
import { useToast } from '../hooks/useToast';
import { clsx } from 'clsx';

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
        </form>
      </div>
    </div>
  );
};