import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, Bell, Users as UsersIcon } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { StatsCard } from '../components/dashboard/StatsCard';
import { MeetingCard } from '../components/dashboard/MeetingCard';
import { NewMeetingModal } from '../components/modals/NewMeetingModal';
import { EditMeetingModal } from '../components/modals/EditMeetingModal';
import { WhatsAppReminderModal } from '../components/modals/WhatsAppReminderModal';
import { DeleteConfirmationModal } from '../components/modals/DeleteConfirmationModal';
import { dashboardApi, meetingsApi } from '../services/api';
import { DashboardStats, Meeting } from '../types';
import { useToast } from '../hooks/useToast';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_meetings: 0,
    this_week_meetings: 0,
    notifications_sent: 0,
    active_participants: 0,
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, meetingsResponse] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getUpcomingMeetings(),
        ]);
        
        setStats(statsResponse.data);
        setUpcomingMeetings(meetingsResponse.data);
      } catch (err) {
        error('Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [error]);

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowEditMeetingModal(true);
  };

  const handleDeleteMeeting = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDeleteModal(true);
  };

  const confirmDeleteMeeting = async () => {
    if (!selectedMeeting) return;
    
    try {
      setDeletingMeeting(true);
      await meetingsApi.delete(selectedMeeting.id);
      
      // Smooth animation: fade out the meeting card
      const meetingElement = document.querySelector(`[data-meeting-id="${selectedMeeting.id}"]`);
      if (meetingElement) {
        meetingElement.classList.add('animate-pulse', 'opacity-50');
        setTimeout(() => {
          setUpcomingMeetings(prev => prev.filter(m => m.id !== selectedMeeting.id));
        }, 300);
      } else {
        setUpcomingMeetings(prev => prev.filter(m => m.id !== selectedMeeting.id));
      }
      
      success('Meeting deleted successfully');
      setShowDeleteModal(false);
      setSelectedMeeting(null);
    } catch (err) {
      error('Failed to delete meeting');
    } finally {
      setDeletingMeeting(false);
    }
  };

  const handleSendReminder = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowWhatsAppModal(true);
  };

  const handleNewMeeting = () => {
    setShowNewMeetingModal(true);
  };

  const handleModalSuccess = () => {
    // Refresh the meetings list
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, meetingsResponse] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getUpcomingMeetings(),
        ]);
        
        setStats(statsResponse.data);
        setUpcomingMeetings(meetingsResponse.data);
      } catch (err) {
        error('Failed to refresh data');
      }
    };
    
    fetchDashboardData();
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
        title="Dashboard"
        subtitle="Manage your meetings and automated WhatsApp notifications"
        actions={
          <button
            onClick={handleNewMeeting}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Meeting</span>
          </button>
        }
      />
      
      <div className="container mx-auto px-6 py-8 sm:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Meetings"
            value={stats.total_meetings}
            icon={Calendar}
            iconColor="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="This Week"
            value={stats.this_week_meetings}
            icon={Clock}
            iconColor="bg-green-100 text-green-600"
          />
          <StatsCard
            title="Notifications Sent"
            value={stats.notifications_sent}
            icon={Bell}
            iconColor="bg-purple-100 text-purple-600"
          />
          <StatsCard
            title="Active Participants"
            value={stats.active_participants}
            icon={UsersIcon}
            iconColor="bg-orange-100 text-orange-600"
          />
        </div>

        {/* Upcoming Meetings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              Upcoming Meetings
            </h3>
            <div className="flex items-center gap-2">
              <select className="rounded-lg border-gray-200 text-sm px-3 py-2 focus:border-indigo-300 focus:ring-indigo-200">
                <option>All Meetings</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No upcoming meetings</h3>
                <p className="text-gray-500 mb-4">Start by creating your first meeting</p>
                <button
                  onClick={handleNewMeeting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Meeting
                </button>
              </div>
            ) : (
              upcomingMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  data-meeting-id={meeting.id}
                  meeting={meeting}
                  onEdit={handleEditMeeting}
                  onDelete={handleDeleteMeeting}
                  onSendReminder={handleSendReminder}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewMeetingModal
        isOpen={showNewMeetingModal}
        onClose={() => setShowNewMeetingModal(false)}
        onSuccess={handleModalSuccess}
      />
      
      <EditMeetingModal
        isOpen={showEditMeetingModal}
        meeting={selectedMeeting}
        onClose={() => {
          setShowEditMeetingModal(false);
          setSelectedMeeting(null);
        }}
        onSuccess={handleModalSuccess}
      />
      
      <WhatsAppReminderModal
        isOpen={showWhatsAppModal}
        meeting={selectedMeeting}
        onClose={() => {
          setShowWhatsAppModal(false);
          setSelectedMeeting(null);
        }}
      />
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        meeting={selectedMeeting}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMeeting(null);
        }}
        onConfirm={confirmDeleteMeeting}
        loading={deletingMeeting}
      />
    </div>
  );
};