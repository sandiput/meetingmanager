import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Info, Users, Search, UserPlus } from 'lucide-react';
import { participantsApi, meetingsApi, daftarKantorApi, attachmentsApi } from '../../services/api';
import { Participant, Meeting, CreateMeetingForm, Attachment } from '../../types';

// Extended form interface for editing meetings (includes id)
interface EditMeetingForm extends CreateMeetingForm {
  id: string;
}
import { useToast } from '../../contexts/ToastContext';
import { clsx } from 'clsx';
import { FileUpload } from '../FileUpload';

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
  
  // State for invited_by field
  const [invitedByInput, setInvitedByInput] = useState('');
  const [invitedByKantorList, setInvitedByKantorList] = useState<{ kd_kantor: string; nama_kantor_pendek: string; nama_kantor_lengkap: string }[]>([]);
  const [showInvitedBySuggestions, setShowInvitedBySuggestions] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState<EditMeetingForm>({
    id: '',
    title: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    participants: [],
    dress_code: '',
    invitation_reference: '',
    invitation_letter_reference: '',
    attendance_link: '',
    discussion_results: '',
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    invited_by: '',
    agenda: '',
    attachments: [],
    photos: [],
  });
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<Attachment[]>([]);

  useEffect(() => {
    if (isOpen && meeting) {
      
      // Pastikan designated_attendees selalu array dan tangani berbagai format data
      let attendees: string[] = [];
      
      // Use participants from backend as primary data source
      if (meeting.participants && Array.isArray(meeting.participants) && meeting.participants.length > 0) {
        // Extract names from participants objects
        attendees = meeting.participants.map(participant => participant.name);
        console.log('Using participants data:', attendees);
      }
      // If no participants, set empty array
      else {
        attendees = [];
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
        participants: attendees,
        dress_code: meeting.dress_code || '',
        invitation_letter_reference: meeting.invitation_letter_reference || '',
        attendance_link: meeting.attendance_link || '',
        agenda: meeting.agenda || '',
        discussion_results: meeting.discussion_results || '',
        whatsapp_reminder_enabled: meeting.whatsapp_reminder_enabled,
        group_notification_enabled: meeting.group_notification_enabled,
        meeting_link: meeting.meeting_link || '',
        invited_by: meeting.invited_by || '',
      });
      
      // Set invited_by input if exists
      if (meeting.invited_by) {
        setInvitedByInput(meeting.invited_by);
      }
      
      // Load existing attachments and photos
      if (meeting.attachments) {
        const allFiles = meeting.attachments || [];
        const attachments = allFiles.filter((file: Attachment) => file.file_category === 'attachment' || !file.file_category);
        const photos = allFiles.filter((file: Attachment) => file.file_category === 'photo');
        setExistingAttachments(attachments);
        setExistingPhotos(photos);
      }
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
  
  // Filter daftar kantor for invited_by field
  useEffect(() => {
    const searchKantor = async () => {
      if (invitedByInput.length >= 2) {
        try {
          const response = await daftarKantorApi.search(invitedByInput);
          if (response.success) {
            setInvitedByKantorList(response.data.slice(0, 5));
          }
        } catch (error) {
          console.error('Error searching kantor:', error);
          setInvitedByKantorList([]);
          setShowInvitedBySuggestions(false);
        }
      } else {
        setInvitedByKantorList([]);
        setShowInvitedBySuggestions(false);
      }
    };
    
    const debounceTimer = setTimeout(searchKantor, 300);
    return () => clearTimeout(debounceTimer);
  }, [invitedByInput]);
  
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
        setInvitedByInput("");
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttendeeSelect = (participantName: string) => {
    if (!selectedAttendees.includes(participantName)) {
      const newSelectedAttendees = [...selectedAttendees, participantName];
      setSelectedAttendees(newSelectedAttendees);
      // Update formData to include the new attendee
      setFormData(prev => ({
        ...prev,
        participants: newSelectedAttendees
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
      participants: newSelectedAttendees
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
  
  // Handler functions for invited_by field
  const handleInvitedBySelect = (kantor: { kd_kantor: string; nama_kantor_pendek: string; nama_kantor_lengkap: string }) => {
    setInvitedByInput(kantor.nama_kantor_pendek);
    setFormData(prev => ({ ...prev, invited_by: kantor.nama_kantor_pendek }));
    setShowInvitedBySuggestions(false);
  };
  
  const handleInvitedByInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && invitedByKantorList.length > 0) {
      e.preventDefault();
      handleInvitedBySelect(invitedByKantorList[0]);
    } else if (e.key === 'Escape') {
      setShowInvitedBySuggestions(false);
    }
  };
  
  const handleInvitedByInputChange = (value: string) => {
    setInvitedByInput(value);
    setFormData(prev => ({ ...prev, invited_by: value }));
  };

  const handleDeleteExisting = async (attachmentId: string, fileCategory: 'attachment' | 'photo' = 'attachment') => {
    try {
      await attachmentsApi.delete(attachmentId);
      if (fileCategory === 'attachment') {
        setExistingAttachments(prev => prev.filter(att => att.id !== attachmentId));
      } else {
        setExistingPhotos(prev => prev.filter(att => att.id !== attachmentId));
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error);
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
      console.log('Updating meeting with data:', { ...formData, participants: selectedAttendees });
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
      
      // Prepare data for backend, converting empty strings to undefined
      const meetingData = {
        id: formData.id,
        title: formData.title,
        date: formData.date,
        start_time: formatTimeValue(formData.start_time),
        end_time: formatTimeValue(formData.end_time),
        location: formData.location,
        dress_code: formData.dress_code || undefined,
        invitation_letter_reference: formData.invitation_letter_reference || undefined,
        attendance_link: formData.attendance_link || undefined,
        meeting_link: formData.meeting_link || undefined,
        agenda: formData.agenda || undefined,
        discussion_results: formData.discussion_results || undefined,
        whatsapp_reminder_enabled: formData.whatsapp_reminder_enabled,
        group_notification_enabled: formData.group_notification_enabled,
        invited_by: formData.invited_by || undefined,
        // Send participants as array of names (form format)
        participants: selectedAttendees,
      };
      
      console.log('Final meeting data being sent:', meetingData);
      
      // Validate meeting ID before sending request
      if (!meeting || !meeting.id) {
        throw new Error('Meeting ID is missing. Cannot update meeting.');
      }
      
      console.log('Final meeting data being sent:', meetingData);
      console.log('Meeting ID being used:', meeting.id);
      const result = await meetingsApi.update(meeting.id, meetingData);
      console.log('Update result:', result);
      
      // Upload new attachments if any
      if (formData.attachments && formData.attachments.length > 0) {
        console.log('Uploading new attachments for meeting:', meeting.id);
        for (const file of formData.attachments) {
          // Only upload if it's a new file (File object, not existing attachment)
          if (file instanceof File) {
            try {
              await attachmentsApi.upload(meeting.id, file, 'attachment');
            } catch (uploadErr) {
              console.error('Failed to upload attachment:', uploadErr);
              // Continue with other files even if one fails
            }
          }
        }
      }
      
      // Upload new photos if any
      if (formData.photos && formData.photos.length > 0) {
        console.log('Uploading new photos for meeting:', meeting.id);
        for (const file of formData.photos) {
          // Only upload if it's a new file (File object, not existing photo)
          if (file instanceof File) {
            try {
              await attachmentsApi.upload(meeting.id, file, 'photo');
            } catch (uploadErr) {
              console.error('Failed to upload photo:', uploadErr);
              // Continue with other files even if one fails
            }
          }
        }
      }
      
      success('Meeting updated successfully!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update meeting:', err);
      
      // Provide more specific error message if available
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        if (axiosErr.response?.data?.message) {
          error(`Failed to update meeting: ${axiosErr.response.data.message}`);
        } else {
          error('Failed to update meeting. Please try again.');
        }
      } else if (err instanceof Error) {
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
        // Only close if clicking directly on the backdrop, not on any child elements
        if (e.target === e.currentTarget && !e.defaultPrevented) {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }
      }}
    >
      <div 
        className="flex w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl m-4 max-h-[90vh]"
        onClick={(e) => {
          // Prevent any clicks inside the modal from bubbling up to the backdrop
          e.stopPropagation();
        }}
      >
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
                            setFormData(prev => ({ ...prev, participants: [] }));
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
                value={formData.invitation_letter_reference}
                onChange={(e) => handleInputChange('invitation_letter_reference', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                placeholder="e.g., REF-2024-001"
              />
            </div>

            {/* Invited By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invited By
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={invitedByInput}
                  onChange={(e) => handleInvitedByInputChange(e.target.value)}
                  onKeyDown={handleInvitedByInputKeyDown}
                  onFocus={() => {
                    if (invitedByInput.trim().length > 0) {
                      setShowInvitedBySuggestions(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowInvitedBySuggestions(false), 200)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                  placeholder="Type name of person who invited..."
                  autoComplete="off"
                />
                
                {/* Invited By Suggestions Dropdown */}
                {showInvitedBySuggestions && invitedByKantorList.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-50">
                    {invitedByKantorList.map((kantor) => (
                      <button
                        key={kantor.kd_kantor}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleInvitedBySelect(kantor);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                          {kantor.nama_kantor_pendek.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">{kantor.nama_kantor_pendek}</div>
                          <div className="text-xs text-gray-500">{kantor.nama_kantor_lengkap}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Display selected invited by */}
              {formData.invited_by && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Selected:</span> {formData.invited_by}
                  </p>
                </div>
              )}
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
              <FileUpload
                onFilesChange={(files) => setFormData(prev => ({ ...prev, attachments: files }))}
                acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx']}
                maxFileSize={10}
                multiple={true}
                existingAttachments={existingAttachments}
                onDeleteExisting={(fileId) => handleDeleteExisting(fileId, 'attachment')}
                fileCategory="attachment"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos
              </label>
              <FileUpload
                onFilesChange={(files) => setFormData(prev => ({ ...prev, photos: files }))}
                acceptedTypes={['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']}
                maxFileSize={5}
                multiple={true}
                existingAttachments={existingPhotos}
                onDeleteExisting={(fileId) => handleDeleteExisting(fileId, 'photo')}
                fileCategory="photo"
              />
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