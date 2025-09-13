import React, { useState, useEffect } from "react";
import { X, MessageCircle, Info, Users, Search, UserPlus } from "lucide-react";
import {
  participantsApi,
  meetingsApi,
  daftarKantorApi,
  attachmentsApi,
} from "../../services/api";
import { Participant, CreateMeetingForm } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import clsx from "clsx";
import { NewParticipantModal } from "./NewParticipantModal";
import { FileUpload } from "../FileUpload";

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewParticipantModal, setShowNewParticipantModal] = useState(false);

  // State for invited_by field
  const [invitedByInput, setInvitedByInput] = useState("");
  const [invitedByKantorList, setInvitedByKantorList] = useState<
    {
      kd_kantor: string;
      nama_kantor_pendek: string;
      nama_kantor_lengkap: string;
    }[]
  >([]);
  const [showInvitedBySuggestions, setShowInvitedBySuggestions] =
    useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState<CreateMeetingForm>({
    title: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    meeting_link: "",
    participants: [],
    dress_code: "",
    invitation_reference: "",
    invitation_letter_reference: "",
    attendance_link: "",
    discussion_results: "",
    whatsapp_reminder_enabled: true,
    group_notification_enabled: true,
    invited_by: "",
    agenda: "",
    attachments: [],
    photos: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchParticipants();
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      // Set default start time to current hour + 1
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const startTimeString = now.toTimeString().slice(0, 5);
      // Set default end time to start time + 1 hour
      now.setHours(now.getHours() + 1);
      const endTimeString = now.toTimeString().slice(0, 5);

      setFormData((prev) => ({
        ...prev,
        date: today,
        start_time: startTimeString,
        end_time: endTimeString,
      }));
    }
  }, [isOpen]);

  // Filter participants based on input
  useEffect(() => {
    if (
      attendeeInput.trim().length > 0 &&
      participants &&
      participants.length > 0
    ) {
      const filtered = participants
        .filter(
          (participant) =>
            participant.name
              .toLowerCase()
              .includes(attendeeInput.toLowerCase()) ||
            participant.whatsapp_number.includes(attendeeInput) ||
            participant.seksi
              .toLowerCase()
              .includes(attendeeInput.toLowerCase())
        )
        .filter((participant) => !selectedAttendees.includes(participant.name));
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
            setShowInvitedBySuggestions(response.data.length > 0);
          }
        } catch (error) {
          console.error("Error searching kantor:", error);
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
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      // Set default start time to current hour + 1
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const startTimeString = now.toTimeString().slice(0, 5);
      // Set default end time to start time + 1 hour
      now.setHours(now.getHours() + 1);
      const endTimeString = now.toTimeString().slice(0, 5);

      setFormData((prev) => ({
        ...prev,
        date: today,
        start_time: startTimeString,
        end_time: endTimeString,
      }));
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
      console.log("Fetching participants...");
      const response = await participantsApi.getAll();
      if (
        response &&
        response.data &&
        Array.isArray(response.data.participants)
      ) {
        console.log("Participants fetched:", response.data.participants.length);
        setParticipants(response.data.participants);
      } else {
        console.error("Invalid participants data format:", response);
        setParticipants([]);
      }
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      setParticipants([]);
    }
  };

  const handleInputChange = (
    field: keyof CreateMeetingForm,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttendeeSelect = (participantName: string) => {
    if (!selectedAttendees.includes(participantName)) {
      setSelectedAttendees((prev) => [...prev, participantName]);
    }
    setAttendeeInput("");
    setShowSuggestions(false);
  };

  const handleAttendeeRemove = (participantName: string) => {
    setSelectedAttendees((prev) =>
      prev.filter((name) => name !== participantName)
    );
  };

  const handleAttendeeInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredParticipants.length > 0) {
        handleAttendeeSelect(filteredParticipants[0].name);
      } else if (attendeeInput.trim() !== "") {
        // If no matching participant found, open the new participant modal
        setShowNewParticipantModal(true);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setAttendeeInput("");
    }
  };

  // Handler functions for invited_by field
  const handleInvitedBySelect = (kantor: {
    kd_kantor: string;
    nama_kantor_pendek: string;
    nama_kantor_lengkap: string;
  }) => {
    setInvitedByInput(kantor.nama_kantor_pendek);
    setFormData((prev) => ({ ...prev, invited_by: kantor.nama_kantor_pendek }));
    setShowInvitedBySuggestions(false);
  };

  const handleInvitedByInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && invitedByKantorList.length > 0) {
      e.preventDefault();
      handleInvitedBySelect(invitedByKantorList[0]);
    } else if (e.key === "Escape") {
      setShowInvitedBySuggestions(false);
    }
  };

  const handleInvitedByInputChange = (value: string) => {
    setInvitedByInput(value);
    setFormData((prev) => ({ ...prev, invited_by: value }));
  };

  const handleParticipantAdded = async () => {
    // Refresh participants list
    try {
      const response = await participantsApi.getAll();
      setParticipants(response.data.participants);

      // If the new participant matches the current input, add them to selected attendees
      const newParticipant = response.data.participants.find(
        (p: Participant) => p.name.toLowerCase() === attendeeInput.toLowerCase()
      );

      if (newParticipant) {
        handleAttendeeSelect(newParticipant.name);
      }
    } catch (err) {
      console.error("Failed to refresh participants:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.date ||
      !formData.start_time ||
      !formData.end_time ||
      !formData.location ||
      selectedAttendees.length === 0
    ) {
      error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Format time values to match backend expectations (HH:mm:ss format)
      const formatTimeValue = (timeValue: string) => {
        if (!timeValue) return "";

        // If time is already in HH:mm:ss format, return it as is
        if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(timeValue)) {
          const [hours, minutes, seconds] = timeValue.split(":");
          return `${hours.padStart(2, "0")}:${minutes}:${seconds}`;
        }

        // If time is in HH:mm format, add seconds
        if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)) {
          const [hours, minutes] = timeValue.split(":");
          return `${hours.padStart(2, "0")}:${minutes}:00`;
        }

        return timeValue;
      };

      // Prepare data for backend, converting empty strings to undefined
      const meetingData = {
        title: formData.title,
        date: formData.date,
        start_time: formatTimeValue(formData.start_time),
        end_time: formatTimeValue(formData.end_time),
        location: formData.location,
        meeting_link: formData.meeting_link || undefined,
        dress_code: formData.dress_code || undefined,
        invitation_letter_reference: formData.invitation_letter_reference || undefined,
        invited_by: formData.invited_by || undefined,
        attendance_link: formData.attendance_link || undefined,
        agenda: formData.agenda || undefined,
        discussion_results: formData.discussion_results || undefined,
        whatsapp_reminder_enabled: formData.whatsapp_reminder_enabled,
        group_notification_enabled: formData.group_notification_enabled,
        // Send participants as array of strings (CreateMeetingForm format)
        participants: selectedAttendees,
      };

      console.log("Final meeting data being sent:", meetingData);
      console.log("Selected attendees:", selectedAttendees);

      // Check if any of the selected attendees exist in the participants database
      try {
        const participantsResponse = await fetch(
          "http://localhost:8000/api/participants?limit=1000"
        );
        const participantsData = await participantsResponse.json();
        const existingParticipants = participantsData.data.participants || [];

        console.log(
          "Available participants in database:",
          existingParticipants.map((p: Participant) => p.name)
        );

        const matchingParticipants = existingParticipants.filter(
          (p: Participant) => selectedAttendees.includes(p.name)
        );

        console.log(
          "Matching participants found:",
          matchingParticipants.map((p: Participant) => p.name)
        );

        if (matchingParticipants.length === 0) {
          console.warn(
            "Warning: None of the selected attendees exist in the participants database"
          );
          error(
            "Selected attendees do not exist in the database. Please add them as participants first."
          );
          setLoading(false);
          return;
        }
      } catch (participantErr) {
        console.error("Error checking participants:", participantErr);
      }

      const response = await meetingsApi.create({
        ...meetingData,
      });
      console.log("Response from backend:", response);

      // Upload attachments if any
      if (formData.attachments && formData.attachments.length > 0) {
        console.log("Uploading attachments for meeting:", response.data.id);
        for (const file of formData.attachments) {
          try {
            await attachmentsApi.upload(response.data.id, file, "attachment");
          } catch (uploadErr) {
            console.error("Failed to upload attachment:", uploadErr);
            // Continue with other files even if one fails
          }
        }
      }

      // Upload photos if any
      if (formData.photos && formData.photos.length > 0) {
        console.log("Uploading photos for meeting:", response.data.id);
        for (const file of formData.photos) {
          try {
            await attachmentsApi.upload(response.data.id, file, "photo");
          } catch (uploadErr) {
            console.error("Failed to upload photo:", uploadErr);
            // Continue with other files even if one fails
          }
        }
      }

      success("Meeting created successfully!");
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error("Failed to create meeting:", err);
      error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      start_time: "",
      end_time: "",
      location: "",
      meeting_link: "",
      participants: [],
      dress_code: "",
      invitation_reference: "",
      invitation_letter_reference: "",
      attendance_link: "",
      discussion_results: "",
      whatsapp_reminder_enabled: true,
      group_notification_enabled: true,
      invited_by: "",
      agenda: "",
      attachments: [],
    });
    setSelectedAttendees([]);
    setAttendeeInput("");
    setShowSuggestions(false);
    setInvitedByInput("");
    setShowInvitedBySuggestions(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <>
      <NewParticipantModal
        isOpen={showNewParticipantModal}
        onClose={() => setShowNewParticipantModal(false)}
        onSuccess={handleParticipantAdded}
        initialName={attendeeInput}
      />
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
              <h2 className="text-xl font-bold text-gray-800">
                Create New Meeting
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Schedule a meeting with automated WhatsApp notifications
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
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
                    onChange={(e) => handleInputChange("date", e.target.value)}
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
                    onChange={(e) =>
                      handleInputChange("start_time", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("end_time", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                    placeholder="e.g., Conference Room A, Virtual Meeting"
                    required
                  />
                  <input
                    type="url"
                    value={formData.meeting_link || ""}
                    onChange={(e) =>
                      handleInputChange("meeting_link", e.target.value)
                    }
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
                          const filtered = participants.filter(
                            (participant) =>
                              !selectedAttendees.includes(participant.name)
                          );
                          setFilteredParticipants(filtered);
                          setShowSuggestions(filtered.length > 0);
                        }
                      }}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 500)
                      }
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
                            <div className="font-medium text-sm text-gray-800">
                              {participant.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {participant.seksi}
                            </div>
                            <div className="text-xs text-gray-400">
                              {participant.whatsapp_number}
                            </div>
                          </div>
                          <UserPlus className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Type to search and select participants who will attend this
                  meeting
                </p>

                {/* Selected Attendees Display */}
                {selectedAttendees.length > 0 && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-indigo-800">
                        Selected: {selectedAttendees.length} attendee
                        {selectedAttendees.length > 1 ? "s" : ""}
                      </p>
                      {selectedAttendees.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to remove all attendees?"
                              )
                            ) {
                              setSelectedAttendees([]);
                              setFormData((prev) => ({
                                ...prev,
                                participants: [],
                              }));
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
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-800 text-xs rounded-full shadow-sm"
                        >
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
                  onChange={(e) =>
                    handleInputChange("dress_code", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      "invitation_letter_reference",
                      e.target.value
                    )
                  }
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
                    onBlur={() =>
                      setTimeout(() => setShowInvitedBySuggestions(false), 200)
                    }
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none hover:border-gray-300"
                    placeholder="Type name of person who invited..."
                    autoComplete="off"
                  />

                  {/* Invited By Suggestions Dropdown */}
                  {showInvitedBySuggestions &&
                    invitedByKantorList.length > 0 && (
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
                              {kantor.nama_kantor_pendek
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-800">
                                {kantor.nama_kantor_pendek}
                              </div>
                              <div className="text-xs text-gray-500">
                                {kantor.nama_kantor_lengkap}
                              </div>
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
                      <span className="font-medium">Selected:</span>{" "}
                      {formData.invited_by}
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
                  onChange={(e) =>
                    handleInputChange("attendance_link", e.target.value)
                  }
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
                  onFilesChange={(files) =>
                    setFormData((prev) => ({ ...prev, attachments: files }))
                  }
                  acceptedTypes={[
                    ".pdf",
                    ".doc",
                    ".docx",
                    ".txt",
                    ".xls",
                    ".xlsx",
                    ".ppt",
                    ".pptx",
                  ]}
                  maxFileSize={10}
                  multiple={true}
                  fileCategory="attachment"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos
                </label>
                <FileUpload
                  onFilesChange={(files) =>
                    setFormData((prev) => ({ ...prev, photos: files }))
                  }
                  acceptedTypes={["image/*"]}
                  maxFileSize={5}
                  multiple={true}
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
                  onChange={(e) => handleInputChange("agenda", e.target.value)}
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
                  onChange={(e) =>
                    handleInputChange("discussion_results", e.target.value)
                  }
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
                <FileUpload
                  onFilesChange={(files) => {
                    const currentPhotos = formData.photos || [];
                    const allFiles = [...currentPhotos, ...files];
                    setFormData((prev) => ({ ...prev, photos: allFiles }));
                  }}
                  acceptedTypes={["image/*"]}
                  maxFileSize={10}
                  multiple={true}
                  fileCategory="photo"
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
                      onChange={(e) =>
                        handleInputChange(
                          "whatsapp_reminder_enabled",
                          e.target.checked
                        )
                      }
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
                      onChange={(e) =>
                        handleInputChange(
                          "group_notification_enabled",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-200"
                    />
                    <span className="text-sm text-green-700">
                      Notify WhatsApp group
                    </span>
                  </label>
                  <div className="flex items-center gap-2 mt-2 p-2 bg-green-100 rounded-lg">
                    <Info className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700">
                      Notifications will be sent automatically based on your
                      settings
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
              onClick={handleSubmit}
              disabled={loading}
              className={clsx(
                "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all",
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
              )}
            >
              {loading ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
