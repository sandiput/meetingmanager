import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Users, TrendingUp, MessageCircle, Clock } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { StatsCard } from '../components/dashboard/StatsCard';
import { MeetingCard } from '../components/dashboard/MeetingCard';
import { NewMeetingModal } from '../components/modals/NewMeetingModal';
import { EditMeetingModal } from '../components/modals/EditMeetingModal';
import { MeetingDetailModal } from '../components/modals/MeetingDetailModal';
import { WhatsAppReminderModal } from '../components/modals/WhatsAppReminderModal';
import { DeleteConfirmationModal } from '../components/modals/DeleteConfirmationModal';
import { meetingsApi, dashboardApi } from '../services/api';
import { Meeting, DashboardStats } from '../types';
import { useToast } from '../hooks/useToast';
import { format, parseISO } from 'date-fns';

type MeetingFilterType = 'all' | 'upcoming' | 'completed';

// Fungsi untuk mengurutkan meeting: upcoming terlebih dahulu, lalu completed
// Upcoming: meeting yang tanggal dan jam >= waktu saat ini
// Completed: meeting yang tanggal dan jam < waktu saat ini
const sortMeetings = (meetings: Meeting[]): Meeting[] => {
  const now = new Date();
  
  // Pisahkan meeting berdasarkan waktu saat ini, bukan status database
  const upcomingMeetings = meetings.filter(meeting => {
    const meetingDateTime = new Date(`${meeting.date}T${meeting.start_time}`);
    return meetingDateTime >= now;
  });
  
  const completedMeetings = meetings.filter(meeting => {
    const meetingDateTime = new Date(`${meeting.date}T${meeting.start_time}`);
    return meetingDateTime < now;
  });
  
  // Urutkan upcoming meetings berdasarkan tanggal terdekat (ascending)
  upcomingMeetings.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start_time}`);
    const dateB = new Date(`${b.date}T${b.start_time}`);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Urutkan completed meetings berdasarkan tanggal terbaru (descending)
  completedMeetings.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start_time}`);
    const dateB = new Date(`${b.date}T${b.start_time}`);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Gabungkan: upcoming terlebih dahulu, lalu completed
  return [...upcomingMeetings, ...completedMeetings];
};

export const Dashboard: React.FC = () => {
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState(false);
  const [filterType, setFilterType] = useState<MeetingFilterType>('all');
  const { success, error } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('🚀 Dashboard: Starting data fetch...');
        setLoading(true);
        
        // Fetch both stats and meetings
        const [statsResponse, meetingsResponse] = await Promise.all([
          dashboardApi.getStats(),
          filterType === 'all' 
            ? meetingsApi.getAll(1) 
            : meetingsApi.getAll(1, { status: filterType })
        ]);
        
        if (statsResponse && statsResponse.data) {
          setStats(statsResponse.data);
          console.log('✅ Dashboard stats loaded:', statsResponse.data);
        }
        
        if (meetingsResponse && meetingsResponse.data) {
          // Handle paginated response from meetingsApi.getAll()
          let meetings = [];
          if (meetingsResponse.data.data) {
            meetings = meetingsResponse.data.data;
            
            // Urutkan meeting berdasarkan waktu saat ini:
            // Upcoming (>= waktu saat ini) terlebih dahulu, lalu completed (< waktu saat ini)
            meetings = sortMeetings(meetings);
          }
          
          setAllMeetings(meetings);
          setFilteredMeetings(meetings);
          console.log('✅ Dashboard: All meetings loaded:', meetings.length, 'meetings');
          console.log('📋 Dashboard: Meeting titles:', meetings.map(m => `${m.title} (${m.date})`));
        } else {
          setAllMeetings([]);
          setFilteredMeetings([]);
          console.log('❌ Dashboard: No meetings data received');
        }
      } catch (err) {
        console.error('❌ Dashboard fetch error:', err);
        error('Failed to load dashboard data');
        setAllMeetings([]);
        setFilteredMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [error, filterType]);

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowEditMeetingModal(true);
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
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
      
      // Remove meeting from state
      setAllMeetings(prev => prev.filter(m => m.id !== selectedMeeting.id));
      
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
    // Refresh the meetings list after creating, editing or deleting a meeting
    console.log('🔄 Refreshing data after modal success...');
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, meetingsResponse] = await Promise.all([
          dashboardApi.getStats(),
          filterType === 'all' 
            ? meetingsApi.getAll(1) 
            : meetingsApi.getAll(1, { status: filterType })
        ]);
        
        if (statsResponse && statsResponse.data) {
          setStats(statsResponse.data);
          console.log('✅ Dashboard stats refreshed');
        }
        
        if (meetingsResponse && meetingsResponse.data) {
          // Handle paginated response from meetingsApi.getAll()
          let meetings = [];
          if (meetingsResponse.data.data) {
            meetings = meetingsResponse.data.data;
            
            // Urutkan meeting berdasarkan waktu saat ini:
            // Upcoming (>= waktu saat ini) terlebih dahulu, lalu completed (< waktu saat ini)
            meetings = sortMeetings(meetings);
          }
          
          setAllMeetings(meetings);
          setFilteredMeetings(meetings);
          console.log('✅ Refreshed meetings:', meetings.length);
        } else {
          setAllMeetings([]);
          setFilteredMeetings([]);
          console.log('❌ No meetings after refresh');
        }
      } catch (err) {
        console.error('❌ Refresh error:', err);
        error('Failed to refresh dashboard data');
        setAllMeetings([]);
        setFilteredMeetings([]);
      }
    };
    
    fetchDashboardData();
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as MeetingFilterType;
    setFilterType(value);
  };

  if (loading) {
    return (
      <div className="flex-1">
        <Header
          title="Dashboard"
          subtitle="Loading meeting data..."
        />
        <div className="container mx-auto px-6 py-8 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="bg-gray-50 rounded-xl p-4">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
        {/* Dashboard Stats */}
        {stats && (
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
              icon={MessageCircle}
              iconColor="bg-purple-100 text-purple-600"
            />
            <StatsCard
              title="Active Participants"
              value={stats.active_participants}
              icon={Users}
              iconColor="bg-orange-100 text-orange-600"
            />
          </div>
        )}

        {/* All Meetings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              All Meetings (Upcoming First by Date, Completed Latest First)
            </h3>
            <div className="flex items-center gap-2">
              <select 
                className="rounded-lg border-gray-200 text-sm px-3 py-2 focus:border-indigo-300 focus:ring-indigo-200"
                value={filterType}
                onChange={handleFilterChange}
              >
                <option value="all">All Meetings</option>
                <option value="upcoming">Upcoming Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No meetings found</h3>
                <p className="text-gray-500 mb-4">Start by creating your first meeting</p>
                <button
                  onClick={handleNewMeeting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Meeting
                </button>
              </div>
            ) : (
              filteredMeetings.map((meeting, index) => {
                // Determine if meeting is upcoming based on current time, not database status
                const now = new Date();
                const meetingDateTime = new Date(`${meeting.date}T${meeting.start_time}`);
                const isUpcoming = meetingDateTime >= now;
                
                // Add section divider between upcoming and completed
                const prevMeeting = index > 0 ? filteredMeetings[index - 1] : null;
                const prevMeetingDateTime = prevMeeting ? new Date(`${prevMeeting.date}T${prevMeeting.start_time}`) : null;
                const prevIsUpcoming = prevMeetingDateTime ? prevMeetingDateTime >= now : true;
                
                const showDivider = index > 0 && prevIsUpcoming && !isUpcoming;
                
                return (
                  <React.Fragment key={meeting.id}>
                    {showDivider && (
                      <div className="flex items-center gap-4 py-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        <div className="bg-gray-100 px-4 py-2 rounded-full">
                          <span className="text-sm font-medium text-gray-600">Completed Meetings</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      </div>
                    )}
                <MeetingCard
                  meeting={meeting}
                  onView={handleViewMeeting}
                  onEdit={handleEditMeeting}
                  onDelete={handleDeleteMeeting}
                  onSendReminder={handleSendReminder}
                  isAuthenticated={true}
                />
                  </React.Fragment>
                );
              })
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
      
      <MeetingDetailModal
        isOpen={showDetailModal}
        meeting={selectedMeeting}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMeeting(null);
        }}
      />
    </div>
  );
};