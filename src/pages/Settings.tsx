import React, { useEffect, useState, useCallback } from 'react';
import { Save, MessageCircle, Clock, Smartphone, QrCode, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Header } from '../components/layout/Header';
import UserProfileHeader from '../components/UserProfileHeader';
import { settingsApi } from '../services/api';
import { UpdateSettingsForm } from '../types';
import { useToast } from '../contexts/ToastContext';
import { clsx } from 'clsx';


export const Settings: React.FC = () => {
  const [formData, setFormData] = useState<UpdateSettingsForm>({
    group_notification_time: '07:00',
    group_notification_enabled: true,
    individual_reminder_minutes: 30,
    individual_reminder_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [whatsappStatus, setWhatsappStatus] = useState({
    connected: false,
    authenticated: false,
    qrCode: null,
    clientInfo: null
  });
  const [whatsappGroups, setWhatsappGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [templates, setTemplates] = useState({
    group_daily: '',
    individual_reminder: ''
  });
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);
  const { success, error } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settingsApi.get();
      const data = response.data;
      setFormData({
        group_notification_time: data.group_notification_time,
        group_notification_enabled: data.group_notification_enabled,
        individual_reminder_minutes: data.individual_reminder_minutes,
        individual_reminder_enabled: data.individual_reminder_enabled,
      });
      setSelectedGroupId(data.whatsapp_group_id || '');
    } catch {
      error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [error]);

  const fetchWhatsAppGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/groups');
      const data = await response.json();
      if (data.success) {
        setWhatsappGroups(data.data);
      }
    } catch {
      // Silent error handling for WhatsApp groups
    }
  }, []);

  const fetchWhatsAppStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      if (data.success) {
        setWhatsappStatus({
          connected: data.data.isConnected,
          authenticated: data.data.isInitialized,
          qrCode: data.data.qrCode,
          clientInfo: null
        });
        if (data.data.isConnected) {
          fetchWhatsAppGroups();
        }
      }
    } catch {
      // Silent error handling for WhatsApp status
    }
  }, [fetchWhatsAppGroups]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch {
      // Silent error handling for templates
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchWhatsAppStatus();
    fetchTemplates();
  }, [fetchSettings, fetchWhatsAppStatus, fetchTemplates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await settingsApi.update(formData);
      success('Settings saved successfully');
    } catch {
      error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateSettingsForm,
    value: string | number | boolean
  ) => {
    setFormData((prev: UpdateSettingsForm) => ({ ...prev, [field]: value }));
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
        actions={<UserProfileHeader />}
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

          {/* WhatsApp Configuration */}
          <div className="rounded-lg bg-white p-6 shadow-md border">
            <h3 className="mb-1 text-xl font-bold text-gray-800">
              WhatsApp Configuration
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Configure WhatsApp connection and message templates.
            </p>
            
            {/* Connection Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-gray-800">Connection Status</p>
                    <p className="text-sm text-gray-500">
                      {whatsappStatus.connected ? 'Connected and ready' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {whatsappStatus.connected ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setLoadingWhatsApp(true);
                      try {
                        const response = await fetch('/api/whatsapp/connect', {
                          method: 'POST'
                        });
                        const data = await response.json();
                        if (data.success) {
                          success('WhatsApp connection initiated');
                          setTimeout(fetchWhatsAppStatus, 2000);
                        } else {
                          error(data.message);
                        }
                      } catch {
                        error('Failed to connect WhatsApp');
                      } finally {
                        setLoadingWhatsApp(false);
                      }
                    }}
                    disabled={loadingWhatsApp}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <RefreshCw className={clsx('w-4 h-4', loadingWhatsApp && 'animate-spin')} />
                    {whatsappStatus.connected ? 'Reconnect' : 'Connect'}
                  </button>
                </div>
              </div>
              
              {/* QR Code */}
              {whatsappStatus.qrCode && !whatsappStatus.connected && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <p className="font-medium text-gray-800">Scan QR Code</p>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${whatsappStatus.qrCode}`} 
                      alt="WhatsApp QR Code" 
                      className="w-48 h-48 border rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Open WhatsApp on your phone and scan this QR code
                  </p>
                </div>
              )}
            </div>
            
            {/* Group Selection */}
            {whatsappStatus.connected && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select WhatsApp Group
                </label>
                <select
                  value={selectedGroupId}
                  onChange={async (e) => {
                    const groupId = e.target.value;
                    setSelectedGroupId(groupId);
                    try {
                      const response = await fetch('/api/whatsapp/group', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ groupId })
                      });
                      const data = await response.json();
                      if (data.success) {
                        success('WhatsApp group updated');
                      } else {
                        error(data.message);
                      }
                    } catch {
                      error('Failed to update group');
                    }
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a group...</option>
                  {whatsappGroups.map((group: { id: string; name: string }) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Message Templates */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Daily Message Template
                </label>
                <textarea
                  value={templates.group_daily}
                  onChange={(e) => setTemplates(prev => ({ ...prev, group_daily: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter template for daily group messages..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{date}'} for date and {'{meetings}'} for meeting list
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Individual Reminder Template
                </label>
                <textarea
                  value={templates.individual_reminder}
                  onChange={(e) => setTemplates(prev => ({ ...prev, individual_reminder: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter template for individual reminders..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{title}'}, {'{start_time}'}, {'{end_time}'}, {'{location}'}, {'{meeting_link}'}, {'{agenda}'}, {'{dress_code}'}, {'{participants}'}, {'{attendance_link}'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/whatsapp/templates', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(templates)
                    });
                    const data = await response.json();
                    if (data.success) {
                      success('Templates updated successfully');
                    } else {
                      error(data.message);
                    }
                  } catch {
                    error('Failed to update templates');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Save Templates
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