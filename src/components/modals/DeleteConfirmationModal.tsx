import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Meeting } from '../../types';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  meeting,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen || !meeting) return null;

  const startDateTime = new Date(`${meeting.date}T${meeting.start_time}`);
  const endDateTime = new Date(`${meeting.date}T${meeting.end_time}`);
  const formattedDate = format(startDateTime, 'dd MMM yyyy');
  const formattedStartTime = format(startDateTime, 'h:mm a');
  const formattedEndTime = format(endDateTime, 'h:mm a');

  return (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl m-4 transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">
                Delete Meeting
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                This action cannot be undone
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-800 mb-1">
                  {meeting.title}
                </h4>
                <p className="text-sm text-red-700 mb-2">
                  {formattedDate}, {formattedStartTime} - {formattedEndTime}
                </p>
                <div className="text-sm text-red-600">
                  <p>📍 {meeting.location}</p>
                  <p>👤 Attendees: {meeting.participants?.map(p => p.name).join(', ') || 'No attendees'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will permanently delete the meeting and all associated data.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all',
              loading
                ? 'bg-red-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 hover:shadow-lg hover:-translate-y-0.5'
            )}
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Deleting...' : 'Delete Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
};