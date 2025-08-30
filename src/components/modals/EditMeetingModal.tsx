import React, { useState, useEffect } from 'react';
import { X, Upload, MessageCircle, Info, Users, Search, UserPlus } from 'lucide-react';
import { participantsApi, meetingsApi } from '../../services/api';
import { Participant, Meeting, CreateMeetingForm } from '../../types';
import { useToast } from '../../hooks/useToast';
import { clsx } from 'clsx';

interface EditMeetingModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditMeetingModal: React.FC<EditMeetingModalProps> = ({
  isOpen,
  meeting,
  onClose,
  onSuccess,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState<CreateMeetingForm>({
    id: '',
    title: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    designated_attendees: [],
    dress_code: '',
    invitation_reference: '',
    attendance_link: '',
    discussion_results: '',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
  });

  useEffect(() => {
    if (isOpen && meeting) {
      // Pastikan designated_attendees selalu array dan tangani berbagai format data
      let attendees = [];
      
      // Prioritaskan participants jika tersedia
      if (meeting.participants && Array.isArray(meeting.participants) && meeting.participants.length > 0) {
        // Ekstrak nama dari objek participants
        attendees = meeting.participants.map(participant => participant.name);
        console.log('Using participants data:', attendees);
      }
      // Fallback ke attendees (untuk kompatibilitas mundur)
      else if (meeting.attendees && Array.isArray(meeting.attendees) && meeting.attendees.length > 0) {
        // Ekstrak nama dari objek attendees
        attendees = meeting.attendees.map(attendee => attendee.name);
        console.log('Using attendees data:', attendees);
      }
      // Cek apakah designated_attendees ada dan merupakan array
      else if (Array.isArray(meeting.designated_attendees)) {
        attendees = meeting.designated_attendees;
      } 
      // Cek apakah designated_attendees adalah string yang bisa di-parse sebagai array
      else if (typeof meeting.designated_attendees === 'string' && (meeting.designated_attendees as string).trim() !== '') {
        try {
          // Coba parse jika string adalah JSON array
          const parsed = JSON.parse(meeting.designated_attendees);
          if (Array.isArray(parsed)) {
            attendees = parsed;
          } else {
            // Jika bukan array, tambahkan sebagai single item
            attendees = [meeting.designated_attendees];
          }
        } catch (e) {
          // Jika gagal parse, gunakan sebagai single string
          attendees = [meeting.designated_attendees];
        }
      }
      // Fallback ke designated_attendee jika tidak ada designated_attendees
      else if (meeting.designated_attendee && typeof meeting.designated_attendee === 'string') {
        attendees = [meeting.designated_attendee];
      }
      
      console.log('Setting initial attendees:', attendees);
      
      fetchParticipants();
      setSelectedAttendees(attendees);
      setFormData({
        id: meeting.id,
        title: meeting.title,
        date: meeting.date,
        start_time: meeting.start_time,
        end_time: meeting.end_time,
        location: meeting.location,
        designated_attendees: attendees,
        dress_code: meeting.dress_code || '',
        invitation_reference: meeting.invitation_reference || '',
        attendance_link: meeting.attendance_link || '',
        agenda: meeting.agenda || '',
        discussion_results: meeting.discussion_results || '',
        whatsapp_reminder_enabled: meeting.whatsapp_reminder_enabled,
        group_notification_enabled: meeting.group_notification_enabled,
        meeting_link: meeting.meeting_link || '',
      });
    }
  }, [isOpen, meeting]);

  // Filter participants based on input
  useEffect(() => {
    if (attendeeInput.trim().length > 0 && participants && participants.length > 0) {
      const filtered = participants.filter(participant =>
        participant.name.toLowerCase().includes(attendeeInput.toLowerCase()) ||
        participant.whatsapp_number.includes(attendeeInput) ||
        participant.seksi.toLowerCase().includes(attendeeInput.toLowerCase())
      ).filter(participant => !selectedAttendees.includes(participant.name));
      setFilteredParticipants(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredParticipants([]);
      setShowSuggestions(false);
    }
  }, [attendeeInput, participants, selectedAttendees]);
  
  // Fetch participants when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchParticipants();
    }
    
    // Cleanup function
    return () => {
      // Reset state when modal closes
      if (!isOpen) {
        setFilteredParticipants([]);
        setShowSuggestions(false);
      }
    };
  }, [isOpen]);
  
  const fetchParticipants = async () => {
    try {
      console.log('Fetching participants...');
      const response = await participantsApi.getAll();
      if (response && response.data && Array.isArray(response.data.participants)) {
        console.log('Participants fetched:', response.data.participants.length);
        setParticipants(response.data.participants);
      } else {
        console.error('Invalid participants data format:', response);
        setParticipants([]);
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
      setParticipants([]);
    }
  };

  const handleInputChange = (field: keyof CreateMeetingForm, value: string | boolean) => {
    if (field === 'designated_attendees') {
      // This shouldn't happen with current UI, but keeping for type safety
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttendeeSelect = (participantName: string) => {
    if (!selectedAttendees.includes(participantName)) {
      const newSelectedAttendees = [...selectedAttendees, participantName];
      setSelectedAttendees(newSelectedAttendees);
      // Update formData to include the new attendee
      setFormData(prev => ({
        ...prev,
        designated_attendees: newSelectedAttendees
      }));
      
      console.log('Added attendee:', participantName);
      console.log('Updated attendees:', newSelectedAttendees);
    }
    setAttendeeInput('');
    setShowSuggestions(false);
    // Focus back on the input field to allow adding more attendees
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder="Type participant name to search..."]');
      if (inputElement) {
        (inputElement as HTMLInputElement).focus();
      }
    }, 50);
  };

  const handleAttendeeRemove = (participantName: string) => {
    const newSelectedAttendees = selectedAttendees.filter(name => name !== participantName);
    setSelectedAttendees(newSelectedAttendees);
    // Also update formData to remove the attendee
    setFormData(prev => ({
      ...prev,
      designated_attendees: newSelectedAttendees
    }));
    
    console.log('Removed attendee:', participantName);
    console.log('Updated attendees:', newSelectedAttendees);
  };

  const handleAttendeeInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredParticipants.length > 0) {
      e.preventDefault();
      handleAttendeeSelect(filteredParticipants[0].name);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setAttendeeInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', formData);
    console.log('meeting', meeting);
    
    if (!meeting || !formData.id || !formData.title || !formData.date || !formData.start_time || !formData.end_time || !formData.location || selectedAttendees.length === 0) {
      error('Please fill in all required fields');
      console.log('Validation failed', { formData, selectedAttendees });
      return;
    }

    try {
      setLoading(true);
      console.log('Updating meeting with data:', { ...formData, designated_attendees: selectedAttendees });
      // Format time values to match backend expectations (HH:mm:ss format)
      const formatTimeValue = (timeValue: string) => {
        if (!timeValue) return '';
        
        // If time is already in HH:mm:ss format, return it as is
        if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(timeValue)) {
          const [hours, minutes, seconds] = timeValue.split(':');
          return `${hours.padStart(2, '0')}:${minutes}:${seconds}`;
        }
        
        // If time is in HH:mm format, add seconds
        if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)) {
          const [hours, minutes] = timeValue.split(':');
          return `${hours.padStart(2, '0')}:${minutes}:00`;
        }
        
        return timeValue;
      };
      
      // Prepare data for backend, removing any fields that might cause issues
      const meetingData = {
        id: formData.id,
        title: formData.title,
        date: formData.date,
        start_time: formatTimeValue(formData.start_time),
        end_time: formatTimeValue(formData.end_time),
        location: formData.location,
        dress_code: formData.dress_code,
        invitation_reference: formData.invitation_reference,
        attendance_link: formData.attendance_link,
        agenda: formData.agenda,
        discussion_results: formData.discussion_results,
        whatsapp_reminder_enabled: formData.whatsapp_reminder_enabled,
        group_notification_enabled: formData.group_notification_enabled,
        designated_attendees: selectedAttendees,
        participants: selectedAttendees.map(name => ({ name })),
        // Include designated_attendee for backward compatibility
        designated_attendee: selectedAttendees.length > 0 ? selectedAttendees[0] : '',
      };
      
      console.log('Final meeting data being sent:', meetingData);
      
      // Ensure data format is correct for the API
      if (!meetingData.designated_attendee && meetingData.designated_attendees && meetingData.designated_attendees.length > 0) {
        meetingData.designated_attendee = meetingData.designated_attendees[0];
      }
      
      // Validate meeting ID before sending request
      if (!meeting || !meeting.id) {
        throw new Error('Meeting ID is missing. Cannot update meeting.');
      }
      
      console.log('Final meeting data being sent:', meetingData);
      console.log('Meeting ID being used:', meeting.id);
      const result = await meetingsApi.update(meeting.id, meetingData);
      console.log('Update result:', result);
      success('Meeting updated successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update meeting:', err);
      
      // Provide more specific error message if available
      if (err.response && err.response.data && err.response.data.message) {
        error(`Failed to update meeting: ${err.response.data.message}`);
      } else if (err.message) {
        error(`Failed to update meeting: ${err.message}`);
      } else {
        error('Failed to update meeting. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !meeting) return null;

  return (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="flex w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl m-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Meeting</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update meeting details and notification settings
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6">
          <form id="editMeetingForm" onSubmit={handleSubmit} className="space-y-6">
            {/* Meeting Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="Enter meeting title"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                  placeholder="e.g., Conference Room A, Virtual Meeting"
                  required
                />
                <input
                  type="url"
                  value={formData.meeting_link || ''}
                  onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                  placeholder="Meeting link (Zoom, Teams, etc.) - Optional"
                />
              </div>
            </div>

            {/* Designated Attendee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Designated Attendees *
              </label>
              
              {/* Attendee Input with Autocomplete */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    onKeyDown={handleAttendeeInputKeyDown}
                    onFocus={() => {
                      if (attendeeInput.trim().length > 0) {
                        setShowSuggestions(true);
                      } else if (participants && participants.length > 0) {
                        // Jika input kosong, tampilkan semua peserta yang belum dipilih
                        const filtered = participants.filter(participant => 
                          !selectedAttendees.includes(participant.name)
                        );
                        setFilteredParticipants(filtered);
                        setShowSuggestions(filtered.length > 0);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 500)}
                    className="w-full rounded-lg border-2 border-gray-200 pl-10 pr-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                    placeholder="Type participant name to search..."
                    autoComplete="off"
                  />
                </div>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredParticipants.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                    {filteredParticipants.map((participant) => (
                      <button
                        key={participant.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur event from firing before click
                          handleAttendeeSelect(participant.name);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">{participant.name}</div>
                          <div className="text-xs text-gray-500">{participant.seksi}</div>
                          <div className="text-xs text-gray-400">{participant.whatsapp_number}</div>
                        </div>
                        <UserPlus className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Type to search and select participants who will attend this meeting
              </p>
              
              {/* Selected Attendees Display */}
              {selectedAttendees.length > 0 && (
                <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-indigo-800">
                      Selected: {selectedAttendees.length} attendee{selectedAttendees.length > 1 ? 's' : ''}
                    </p>
                    {selectedAttendees.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to remove all attendees?')) {
                            setSelectedAttendees([]);
                            setFormData(prev => ({ ...prev, designated_attendees: [] }));
                          }
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAttendees.map((name) => (
                      <span key={name} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-800 text-xs rounded-full shadow-sm">
                        {name}
                        <button
                          type="button"
                          onClick={() => handleAttendeeRemove(name)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dress Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dress Code
              </label>
              <input
                type="text"
                value={formData.dress_code}
                onChange={(e) => handleInputChange('dress_code', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g., Business Casual, Formal"
              />
            </div>

            {/* Invitation Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invitation Letter Reference
              </label>
              <input
                type="text"
                value={formData.invitation_reference}
                onChange={(e) => handleInputChange('invitation_reference', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g., REF-2024-001"
              />
            </div>

            {/* Attendance Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendance Link
              </label>
              <input
                type="url"
                value={formData.attendance_link}
                onChange={(e) => handleInputChange('attendance_link', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g., https://forms.example.com/attendance"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments/Supporting Documents
              </label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 hover:border-indigo-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="edit-file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload files</span>
                      <input id="edit-file-upload" name="edit-file-upload" type="file" className="sr-only" multiple />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Agenda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Agenda
              </label>
              <textarea
                value={formData.agenda}
                onChange={(e) => handleInputChange('agenda', e.target.value)}
                rows={4}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300 resize-none"
                placeholder="Enter meeting agenda and topics to be discussed..."
              />
            </div>

            {/* Discussion Results */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Discussion Results
              </label>
              <textarea
                value={formData.discussion_results}
                onChange={(e) => handleInputChange('discussion_results', e.target.value)}
                rows={4}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300 resize-none"
                placeholder="Enter meeting notes, decisions, and outcomes..."
              />
            </div>

            {/* Meeting Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Photos
              </label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 hover:border-indigo-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="edit-photo-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload photos</span>
                      <input id="edit-photo-upload" name="edit-photo-upload" type="file" className="sr-only" multiple accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Notification Settings */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">
                  WhatsApp Notification Settings
                </h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.whatsapp_reminder_enabled}
                    onChange={(e) => handleInputChange('whatsapp_reminder_enabled', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-200"
                  />
                  <span className="text-sm text-green-700">
                    Send reminder to attendee (30 minutes before)
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.group_notification_enabled}
                    onChange={(e) => handleInputChange('group_notification_enabled', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-200"
                  />
                  <span className="text-sm text-green-700">
                    Notify WhatsApp group
                  </span>
                </label>
                <div className="flex items-center gap-2 mt-2 p-2 bg-green-100 rounded-lg">
                  <Info className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700">
                    Changes to notification settings will apply to future reminders
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 border-t border-gray-200 p-6">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editMeetingForm"
            disabled={loading}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all',
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
            )}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};