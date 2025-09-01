import React, { useEffect, useState } from 'react';
import { Save, MessageCircle, Clock, Info, Eye, Send, Calendar, Users, User, MapPin, Shirt } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { RichTextEditor } from '../components/RichTextEditor';
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
    whatsapp_group_id: '',
    notification_templates: {
      group_daily: '',
      individual_reminder: ''
    }
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
  const [applyingGroupSelection, setApplyingGroupSelection] = useState(false);
  const { success, error } = useToast();

  // Convert WhatsApp format back to HTML for editor
  const convertFromWhatsAppFormat = (text: string): string => {
    if (!text) return '';
    
    let html = text;
    
    // Convert *text* to bold
    html = html.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    
    // Convert _text_ to italic
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Convert ~text~ to underline
    html = html.replace(/~([^~]+)~/g, '<u>$1</u>');
    
    // Convert numbered lists
    html = html.replace(/(\d+\. .+(?:\n\d+\. .+)*)/g, (match) => {
      const items = match.split('\n').map(line => {
        const content = line.replace(/^\d+\. /, '');
        return `<li>${content}</li>`;
      }).join('');
      return `<ol>${items}</ol>`;
    });
    
    // Convert bullet lists
    html = html.replace(/(• .+(?:\n• .+)*)/g, (match) => {
      const items = match.split('\n').map(line => {
        const content = line.replace(/^• /, '');
        return `<li>${content}</li>`;
      }).join('');
      return `<ul>${items}</ul>`;
    });
    
    // Convert single newlines to <br> tags
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags
    if (html.trim()) {
      html = `<p>${html}</p>`;
    }
    
    return html;
  };

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
        whatsapp_group_id: data.whatsapp_group_id || '',
        notification_templates: {
          group_daily: convertFromWhatsAppFormat(data.notification_templates?.group_daily || ''),
          individual_reminder: convertFromWhatsAppFormat(data.notification_templates?.individual_reminder || '')
        }
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

  // Convert HTML to WhatsApp-compatible plain text
  const convertToWhatsAppFormat = (html: string): string => {
    if (!html) return '';
    
    let text = html;
    
    // Convert bold tags to *text*
    text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gs, '*$1*');
    text = text.replace(/<b[^>]*>(.*?)<\/b>/gs, '*$1*');
    
    // Convert italic tags to _text_
    text = text.replace(/<em[^>]*>(.*?)<\/em>/gs, '_$1_');
    text = text.replace(/<i[^>]*>(.*?)<\/i>/gs, '_$1_');
    
    // Convert underline tags to ~text~ (strikethrough in WhatsApp)
    text = text.replace(/<u[^>]*>(.*?)<\/u>/gs, '~$1~');
    
    // Handle ordered lists first
    text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (match, content) => {
      let counter = 1;
      const listItems = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, () => {
        const itemContent = RegExp.$1.replace(/<[^>]*>/g, '').trim();
        return `${counter++}. ${itemContent}\n`;
      });
      return listItems;
    });
    
    // Handle unordered lists
    text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match, content) => {
      const listItems = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (liMatch, liContent) => {
        const itemContent = liContent.replace(/<[^>]*>/g, '').trim();
        return `• ${itemContent}\n`;
      });
      return listItems;
    });
    
    // Convert links
    text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/g, '$2 ($1)');
    
    // Convert <br> tags to single newlines
    text = text.replace(/<br\s*\/?>/g, '\n');
    
    // Convert paragraph breaks - treat each <p> as a separate line
    text = text.replace(/<\/p>\s*<p[^>]*>/g, '\n');
    text = text.replace(/<p[^>]*>/g, '');
    text = text.replace(/<\/p>/g, '');
    
    // Clean up multiple consecutive newlines
    text = text.replace(/\n{2,}/g, '\n');
    text = text.replace(/^\n+|\n+$/g, '');
    
    // Remove any remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    
    // Clean up extra whitespace but preserve line structure
    text = text.replace(/^\s+|\s+$/g, '');
    
    // Add proper spacing after colons and before dashes for better readability
    text = text.replace(/:/g, ': ');
    text = text.replace(/-([A-Z])/g, '- $1');
    
    // Clean up any double spaces that might have been created
    text = text.replace(/  +/g, ' ');
    
    // Ensure proper line breaks around content
    text = text.replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    return text;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      // Exclude whatsapp_group_id from general settings update (handled separately)
      const { whatsapp_group_id, ...settingsData } = formData;
      
      // Convert HTML templates to WhatsApp format before saving
      if (settingsData.notification_templates) {
        settingsData.notification_templates = {
          group_daily: convertToWhatsAppFormat(settingsData.notification_templates.group_daily || ''),
          individual_reminder: convertToWhatsAppFormat(settingsData.notification_templates.individual_reminder || '')
        };
      }
      
      const response = await settingsApi.update(settingsData);
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

  const handleTemplateChange = (
    templateType: 'group_daily' | 'individual_reminder',
    value: string
  ) => {
    // Store the raw HTML content, conversion will be done when saving
    setFormData(prev => ({
      ...prev,
      notification_templates: {
        ...prev.notification_templates!,
        [templateType]: value
      }
    }));
  };

  const handleApplyGroupSelection = async () => {
    if (!formData.whatsapp_group_id) {
      error('Please select a group first');
      return;
    }

    try {
      setApplyingGroupSelection(true);
      const response = await settingsApi.update({ whatsapp_group_id: formData.whatsapp_group_id });
      setSettings(response.data);
      const selectedGroup = whatsappGroups.find(g => g.id === formData.whatsapp_group_id);
      success(`WhatsApp group "${selectedGroup?.name}" has been selected for notifications`);
    } catch (err) {
      error('Failed to apply group selection');
      console.error('Group selection error:', err);
    } finally {
      setApplyingGroupSelection(false);
    }
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
    let message = `*Jadwal Rapat Hari Ini*\n`;
    message += `*${meeting.date}*\n`;
    message += `1. ${meeting.title}\n`;
    message += `Waktu : ${meeting.start_time.substring(0, 5)} s.d. ${meeting.end_time.substring(0, 5)}\n`;
    message += `Lokasi : ${meeting.location}`;
    
    if (meeting.meeting_link) {
      message += ` ${meeting.meeting_link}`;
    }
    message += `_\n`;
    
    if (meeting.dress_code) {
      message += `_Dresscode : ${meeting.dress_code}\n`;
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
              Select a WhatsApp group for notifications. Click Apply to save your selection.
            </p>
            
            {loadingGroups ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Loading groups...</span>
              </div>
            ) : whatsappGroups.length > 0 ? (
              <div className="space-y-3">
                {whatsappGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="selectedGroup"
                        value={group.id}
                        checked={formData.whatsapp_group_id === group.id}
                        onChange={(e) => handleInputChange('whatsapp_group_id', e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-200"
                      />
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
                
                {/* Apply Button */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex-1 mr-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Selected Group:</p>
                        <p className="text-sm text-blue-700 mt-1">
                          {formData.whatsapp_group_id ? 
                            whatsappGroups.find(g => g.id === formData.whatsapp_group_id)?.name || 'Unknown Group' : 
                            'No group selected'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                     type="button"
                     onClick={handleApplyGroupSelection}
                     disabled={applyingGroupSelection || !formData.whatsapp_group_id}
                     className={clsx(
                       'flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all',
                       applyingGroupSelection || !formData.whatsapp_group_id
                         ? 'bg-gray-400 cursor-not-allowed'
                         : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                     )}
                   >
                     <Save className="w-4 h-4" />
                     <span>{applyingGroupSelection ? 'Applying...' : 'Apply'}</span>
                   </button>
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

          {/* Message Templates Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Message Templates</h3>
                <p className="text-sm text-gray-600">Customize notification message templates</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Group Message Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Daily Notification Template
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  <div className="mb-1">Available variables:</div>
                  <div className="ml-2 space-y-1">
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{date}'}</code> - Current date</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{nomor}'}</code> - Meeting number (for multiple meetings)</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{title}'}</code> - Meeting title</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{start_time}'}</code> - Start time</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{end_time}'}</code> - End time</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{location}'}</code> - Meeting location</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{meeting_link}'}</code> - Meeting link (if available)</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{dress_code}'}</code> - Dress code (if specified)</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{attendance_link}'}</code> - Attendance confirmation link</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    <em>Note: For multiple meetings, you can loop through each meeting using these variables</em>
                  </div>
                </div>
                <RichTextEditor
                  value={formData.notification_templates?.group_daily || ''}
                  onChange={(value) => handleTemplateChange('group_daily', value)}
                  placeholder="Enter group notification template..."
                  height="180px"
                />
              </div>

              {/* Individual Message Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Individual Reminder Template
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  <div className="mb-1">Available variables:</div>
                  <div className="ml-2 space-y-1">
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{title}'}</code> - Meeting title</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{date}'}</code> - Meeting date</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{start_time}'}</code> - Start time</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{end_time}'}</code> - End time</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{location}'}</code> - Meeting location</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{meeting_link}'}</code> - Meeting link (if available)</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{dress_code}'}</code> - Dress code (if specified)</div>
                    <div>• <code className="bg-gray-100 px-1 rounded text-xs">{'{attendance_link}'}</code> - Attendance confirmation link</div>
                  </div>
                </div>
                <RichTextEditor
                  value={formData.notification_templates?.individual_reminder || ''}
                  onChange={(value) => handleTemplateChange('individual_reminder', value)}
                  placeholder="Enter individual reminder template..."
                  height="220px"
                />
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
                        {convertToWhatsAppFormat(previewMessage)}
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