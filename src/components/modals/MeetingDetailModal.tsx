import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  FileText,
  Link,
  Shirt,
  Hash,
  MessageCircle,
  Info,
  Download,
  Eye,
  Image,
  Paperclip,
  Grid,
  List,
} from "lucide-react";
import { Meeting, Attachment } from "../../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { attachmentsApi } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

interface MeetingDetailModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  isOpen,
  meeting,
  onClose,
}) => {
  const [previewImage, setPreviewImage] = useState<Attachment | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [attachmentView, setAttachmentView] = useState<"grid" | "list">("grid");
  const { addToast } = useToast();

  if (!isOpen || !meeting) return null;

  const status = meeting.status || "upcoming";

  // Separate attachments and photos
  const attachments =
    meeting.attachments?.filter((att) => att.file_category === "attachment") ||
    [];
  const photos =
    meeting.attachments?.filter((att) => att.file_category === "photo") || [];

  // Validasi data tanggal dan waktu sebelum membuat objek Date
  let formattedDate = "N/A";
  let formattedStartTime = "N/A";
  let formattedEndTime = "N/A";

  try {
    if (meeting.date && meeting.start_time) {
      let startTime = meeting.start_time;
      if (!startTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)) {
        console.warn(`Invalid start_time format: ${startTime}`);
      } else {
        if (startTime.split(":").length === 2) {
          startTime = `${startTime}:00`;
        }

        const startDateTime = new Date(`${meeting.date}T${startTime}`);
        if (!isNaN(startDateTime.getTime())) {
          formattedDate = format(startDateTime, "dd MMM yyyy");
          formattedStartTime = format(startDateTime, "h:mm a");
        }
      }
    }

    if (meeting.date && meeting.end_time) {
      let endTime = meeting.end_time;
      if (!endTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)) {
        console.warn(`Invalid end_time format: ${endTime}`);
      } else {
        if (endTime.split(":").length === 2) {
          endTime = `${endTime}:00`;
        }

        const endDateTime = new Date(`${meeting.date}T${endTime}`);
        if (!isNaN(endDateTime.getTime())) {
          formattedEndTime = format(endDateTime, "h:mm a");
        }
      }
    }
  } catch (error) {
    console.error("Error formatting date/time:", error);
  }

  // Helper functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    return <Paperclip className="w-5 h-5 text-gray-600" />;
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const blob = await attachmentsApi.download(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast({ type: 'success', title: 'File berhasil didownload' });
    } catch (error) {
      console.error("Download failed:", error);
      addToast({ type: 'error', title: 'Gagal mendownload file' });
    }
  };

  const handlePreview = (attachment: Attachment) => {
    if (attachment.file_type.startsWith("image/")) {
      setPreviewImage(attachment);
      setShowPreview(true);
    }
  };

  const closePreview = () => {
    setPreviewImage(null);
    setShowPreview(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="flex w-full max-w-6xl flex-col bg-white shadow-2xl m-4 max-h-[95vh] overflow-hidden rounded-2xl">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-white/80 backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-8 py-6">
              <div className="flex items-start gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                      {meeting.title}
                    </h1>
                    <span
                      className={clsx(
                        "px-4 py-2 rounded-full text-sm font-semibold",
                        status === "upcoming"
                          ? "bg-emerald-100 text-emerald-700"
                          : status === "completed"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {status === "upcoming"
                        ? "Akan datang"
                        : status === "completed"
                        ? "Selesai"
                        : "Berlangsung"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-8 space-y-12">
              {/* Informasi Meeting */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Info className="w-7 h-7 text-indigo-600" />
                  Informasi Meeting
                </h2>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">
                          Tanggal
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {formattedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">
                          Waktu
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {formattedStartTime} - {formattedEndTime}
                        </p>
                      </div>
                    </div>

                    {meeting.location && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">
                            Lokasi
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {meeting.location}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">
                          WhatsApp
                        </p>
                        <div className="space-y-1">
                          <p
                            className={clsx(
                              "text-lg font-bold",
                              meeting.group_notification_enabled
                                ? "text-green-600"
                                : "text-gray-500"
                            )}
                          >
                            Notifikasi Grup:{" "}
                            {meeting.group_notification_enabled
                              ? "Aktif"
                              : "Nonaktif"}
                          </p>
                          <p
                            className={clsx(
                              "text-lg font-bold",
                              meeting.whatsapp_reminder_enabled
                                ? "text-blue-600"
                                : "text-gray-400"
                            )}
                          >
                            Notifikasi Individu:{" "}
                            {meeting.whatsapp_reminder_enabled
                              ? "Aktif"
                              : "Nonaktif"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-violet-600 font-semibold uppercase tracking-wide">
                          Diundang Oleh
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {meeting.invited_by || "Admin Meeting"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-amber-600 font-semibold uppercase tracking-wide">
                          Referensi Surat
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {meeting.invitation_letter_reference || "Tidak ada"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Agenda */}
              {meeting.agenda && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <FileText className="w-7 h-7 text-blue-600" />
                    Agenda Meeting
                  </h2>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                      {meeting.agenda}
                    </p>
                  </div>
                </section>
              )}

              {/* Discussion Results */}
              {meeting.discussion_results && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <MessageCircle className="w-7 h-7 text-emerald-600" />
                    Hasil Diskusi
                  </h2>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                      {meeting.discussion_results}
                    </p>
                  </div>
                </section>
              )}

              {/* Participants */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Users className="w-7 h-7 text-violet-600" />
                  Peserta Meeting
                  <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-sm font-semibold px-4 py-2 rounded-full border border-violet-200">
                    {meeting.participants?.length ||
                      meeting.attendees?.length ||
                      0}
                  </span>
                </h2>

                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meeting.participants && meeting.participants.length > 0 ? (
                      meeting.participants.map((participant, index) => (
                        <div
                          key={participant.id || index}
                          className="flex items-center gap-4 bg-white rounded-xl p-4 hover:shadow-lg transition-all hover:scale-105 border border-violet-100 hover:border-violet-200"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">
                              {participant.name}
                            </p>
                            <p className="text-violet-600 font-medium">
                              {participant.seksi}
                            </p>
                            {participant.whatsapp_number && (
                              <p className="text-sm text-gray-500">
                                {participant.whatsapp_number}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : meeting.attendees && meeting.attendees.length > 0 ? (
                      meeting.attendees.map((attendee, index) => (
                        <div
                          key={attendee.id || index}
                          className="flex items-center gap-4 bg-white rounded-xl p-4 hover:shadow-lg transition-all hover:scale-105 border border-violet-100 hover:border-violet-200"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                            {attendee.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">
                              {attendee.name}
                            </p>
                            <p className="text-violet-600 font-medium">
                              {attendee.seksi}
                            </p>
                            {attendee.whatsapp_number && (
                              <p className="text-sm text-gray-500">
                                {attendee.whatsapp_number}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-violet-300" />
                        <p>Tidak ada peserta yang ditunjuk</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* File Attachments */}
              {attachments.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Paperclip className="w-7 h-7 text-amber-600" />
                      File Lampiran
                      <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full border border-amber-200">
                        {attachments.length}
                      </span>
                    </h2>
                    <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-amber-200">
                      <button
                        onClick={() => setAttachmentView("grid")}
                        className={clsx(
                          "p-2 rounded-lg transition-all",
                          attachmentView === "grid"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                            : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                        )}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAttachmentView("list")}
                        className={clsx(
                          "p-2 rounded-lg transition-all",
                          attachmentView === "list"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                            : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                        )}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                    <div
                      className={clsx(
                        attachmentView === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                          : "space-y-3"
                      )}
                    >
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="bg-white rounded-xl border border-amber-100 transition-all hover:shadow-lg hover:border-amber-200 hover:scale-105 p-4"
                        >
                          <div
                            className={clsx(
                              "flex items-center gap-3",
                              attachmentView === "grid"
                                ? "flex-col text-center"
                                : "flex-row"
                            )}
                          >
                            <div className="flex-shrink-0">
                              {getFileIcon(attachment.file_type)}
                            </div>
                            <div
                              className={clsx(
                                "flex-1 min-w-0",
                                attachmentView === "grid" ? "text-center" : ""
                              )}
                            >
                              <p className="font-medium text-gray-900 truncate">
                                {attachment.original_filename}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(attachment.file_size)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {attachment.file_type.startsWith("image/") && (
                                <button
                                  onClick={() => handlePreview(attachment)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(attachment)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Photo Gallery */}
              {photos.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Image className="w-7 h-7 text-pink-600" />
                    Galeri Foto
                    <span className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 text-sm font-semibold px-4 py-2 rounded-full border border-pink-200">
                      {photos.length}
                    </span>
                  </h2>

                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative aspect-square bg-white rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-105 border border-pink-100 hover:border-pink-200"
                          onClick={() => handlePreview(photo)}
                        >
                          <img
                            src={`${
                              import.meta.env.VITE_API_BASE_URL
                            }/attachments/download/${photo.id}`}
                            alt={photo.original_filename}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreview(photo);
                                }}
                                className="p-2 bg-white/90 text-pink-600 rounded-full hover:bg-white hover:text-pink-700 transition-all shadow-lg"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(photo);
                                }}
                                className="p-2 bg-white/90 text-pink-600 rounded-full hover:bg-white hover:text-pink-700 transition-all shadow-lg"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-500/80 to-transparent p-3">
                            <p className="text-white text-xs font-medium truncate">
                              {photo.original_filename}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Additional Details */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Info className="w-7 h-7 text-gray-600" />
                  Informasi Tambahan
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Meeting Details */}
                  <div className="space-y-6">
                    {meeting.dress_code && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Shirt className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            Dress Code
                          </p>
                          <p className="text-gray-700">{meeting.dress_code}</p>
                        </div>
                      </div>
                    )}

                    {meeting.invitation_reference && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Hash className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            Referensi Undangan
                          </p>
                          <p className="text-gray-700">
                            {meeting.invitation_reference}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          Dibuat oleh
                        </p>
                        <p className="text-gray-700">
                          {meeting.invited_by || "Admin"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Links and Settings */}
                  <div className="space-y-6">
                    {meeting.meeting_link && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Link className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">
                            Link Meeting
                          </p>
                          <a
                            href={meeting.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {meeting.meeting_link}
                          </a>
                        </div>
                      </div>
                    )}

                    {meeting.attendance_link && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Link className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">
                            Link Kehadiran
                          </p>
                          <a
                            href={meeting.attendance_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {meeting.attendance_link}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500 flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <span>ID: {meeting.id}</span>
                    {meeting.created_at && (
                      <span>
                        Dibuat:{" "}
                        {format(
                          new Date(meeting.created_at),
                          "dd MMM yyyy, HH:mm"
                        )}
                      </span>
                    )}
                  </div>
                  {meeting.updated_at && (
                    <span>
                      Terakhir diubah:{" "}
                      {format(
                        new Date(meeting.updated_at),
                        "dd MMM yyyy, HH:mm"
                      )}
                    </span>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && previewImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div className="relative max-w-5xl max-h-[90vh] mx-4">
            <button
              onClick={closePreview}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/attachments/download/${
                previewImage.id
              }`}
              alt={previewImage.original_filename}
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-xl">
              <p className="text-white text-center font-medium text-lg">
                {previewImage.original_filename}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetingDetailModal;
