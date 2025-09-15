import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { NewParticipantModal } from '../components/modals/NewParticipantModal';
import { EditParticipantModal } from '../components/modals/EditParticipantModal';
import { DeleteParticipantModal } from '../components/modals/DeleteParticipantModal';
import UserProfileHeader from '../components/UserProfileHeader';
import { participantsApi } from '../services/api';
import { Participant } from '../types';
import { useToast } from '../contexts/ToastContext';
import { clsx } from 'clsx';

export const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [deletingParticipant, setDeletingParticipant] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const { success, error } = useToast();

  const fetchParticipants = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await participantsApi.getAll(page);
      setParticipants(response.data.participants.map((participant: Participant) => ({
        ...participant,
        whatsapp_number: participant.whatsapp_number.replace(/^(\+62|62|0)/, ""),
      })));
      setPagination({
        current_page: response.data.page,
        last_page: response.data.total_pages,
        per_page: 10, // Default per page from backend
        total: response.data.total,
      });
    } catch {
      error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleDeleteParticipant = async (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowDeleteModal(true);
  };

  const confirmDeleteParticipant = async () => {
    if (!selectedParticipant) return;
    
    try {
      setDeletingParticipant(true);
      await participantsApi.delete(selectedParticipant.id);
      
      // Smooth animation: fade out the participant row
      const participantElement = document.querySelector(`[data-participant-id="${selectedParticipant.id}"]`);
      if (participantElement) {
        participantElement.classList.add('animate-pulse', 'opacity-50');
        setTimeout(() => {
          setParticipants(prev => prev.filter(p => p.id !== selectedParticipant.id));
        }, 300);
      } else {
        setParticipants(prev => prev.filter(p => p.id !== selectedParticipant.id));
      }
      
      success('Participant deleted successfully');
      setShowDeleteModal(false);
      setSelectedParticipant(null);
    } catch {
      error('Failed to delete participant');
    } finally {
      setDeletingParticipant(false);
    }
  };

  const handleNewParticipant = () => {
    setShowNewModal(true);
  };

  const handleEditParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowEditModal(true);
  };

  const handleModalSuccess = () => {
    // Refresh the participants list
    fetchParticipants();
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
        title="Participants"
        subtitle="Manage employee information for meetings."
        actions={
          <div className="flex items-center gap-4">
            <button
              onClick={handleNewParticipant}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Participant</span>
            </button>
            <UserProfileHeader />
          </div>
        }
      />
      
      <div className="container mx-auto px-6 py-8 sm:px-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-xs font-medium uppercase text-gray-500">
                    Name
                  </th>
                  <th className="py-3 px-4 text-xs font-medium uppercase text-gray-500">
                    NIP
                  </th>
                  <th className="py-3 px-4 text-xs font-medium uppercase text-gray-500">
                    WhatsApp Number
                  </th>
                  <th className="py-3 px-4 text-xs font-medium uppercase text-gray-500">
                    Seksi
                  </th>
                  <th className="py-3 px-4 text-xs font-medium uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {participants.map((participant, index) => (
                  <tr 
                    key={participant.id}
                    data-participant-id={participant.id}
                    className={clsx(
                      'hover:bg-gray-50 transition-colors',
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    )}
                  >
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900">
                      {participant.name}
                    </td>
                    <td className="whitespace-nowrap py-4 px-4">
                      <span className="text-sm text-gray-900">
                        {participant.nip}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 px-4">
                      <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex items-center bg-gray-100 px-3 py-2 border-r border-gray-200">
                          <span className="text-sm mr-1">🇮🇩</span>
                          <span className="text-sm text-gray-600">+62</span>
                        </div>
                        <div className="px-3 py-2 bg-white">
                          <span className="text-sm text-gray-900">
                            {participant.whatsapp_number.replace('+62 ', '').replace('+62', '').replace(/\s/g, '')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {participant.seksi}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-right">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditParticipant(participant)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteParticipant(participant)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {participants.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No participants yet</h3>
                <p className="text-sm text-gray-600 mb-4">Add participants to start managing meetings</p>
                <button
                  onClick={handleNewParticipant}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Add Participant
                </button>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <p className="text-sm text-gray-600 font-medium">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} participants
              </p>
              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchParticipants(page)}
                    className={clsx(
                      'px-3 py-1.5 rounded-md text-sm font-semibold transition-colors',
                      page === pagination.current_page
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewParticipantModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={handleModalSuccess}
      />
      
      <EditParticipantModal
        isOpen={showEditModal}
        participant={selectedParticipant}
        onClose={() => {
          setShowEditModal(false);
          setSelectedParticipant(null);
        }}
        onSuccess={handleModalSuccess}
      />
      
      <DeleteParticipantModal
        isOpen={showDeleteModal}
        participant={selectedParticipant}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedParticipant(null);
        }}
        onConfirm={confirmDeleteParticipant}
        loading={deletingParticipant}
      />
    </div>
  );
};