import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Eye, 
  Users, 
  Settings, 
  Search,
  MessageCircle,
  CheckCircle,
  PlusCircle,
  MoreVertical,
  Calendar,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { meetingsApi } from '../../services/api';
import { Meeting } from '../../types';
import { MeetingDetailModal } from '../modals/MeetingDetailModal';
import { UserSettingsModal } from '../modals/UserSettingsModal';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Review',
    href: '/review',
    icon: Eye,
  },
  {
    name: 'Participants',
    href: '/participants',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const recentActivities = [
  {
    id: '1',
    title: 'Rapat Dikonfirmasi',
    subtitle: 'Rapat Koordinasi Bulanan',
    time: '2 min ago',
    icon: CheckCircle,
    iconColor: 'text-green-600 bg-green-100',
  },
  {
    id: '2',
    title: 'Rapat Baru',
    subtitle: 'Briefing Intelijen Mingguan',
    time: '15 min ago',
    icon: PlusCircle,
    iconColor: 'text-blue-600 bg-blue-100',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Meeting[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [showUserSettings, setShowUserSettings] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [selectedMeeting, setSelectedMeeting] = React.useState<Meeting | null>(null);
  const navigate = useNavigate();

  // Debounced search function
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await meetingsApi.search(query);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleMeetingSelect = (meeting: Meeting) => {
    setSearchQuery('');
    setShowResults(false);
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleUserSettings = () => {
    setShowUserSettings(true);
    setShowUserMenu(false);
  };

  return (
    <aside className={clsx(
      'sticky top-0 h-screen w-64 bg-gradient-to-b from-white to-slate-50 shadow-xl border-r border-gray-200',
      className
    )}>
      <div className="flex h-full flex-col">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Meeting Manager</h1>
            <p className="text-xs text-gray-500">Smart Scheduling</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="w-full rounded-xl border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-300 focus:ring-indigo-200 transition-colors"
              placeholder="Search meetings..."
              type="text"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.map((meeting) => {
                    const startDateTime = new Date(`${meeting.date}T${meeting.start_time}`);
                    const endDateTime = new Date(`${meeting.date}T${meeting.end_time}`);
                    return (
                      <button
                        key={meeting.id}
                        onClick={() => handleMeetingSelect(meeting)}
                        className="w-full px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mt-0.5">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {meeting.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(startDateTime, 'dd MMM yyyy')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(startDateTime, 'HH:mm')} - {format(endDateTime, 'HH:mm')}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              📍 {meeting.location}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              👤 {meeting.designated_attendee}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={clsx(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                              meeting.status === 'incoming'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            )}>
                              {meeting.status === 'incoming' ? 'Incoming' : 'Completed'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No meetings found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow space-y-1 px-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'text-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* WhatsApp Integration Status */}
        <div className="px-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-green-600 w-5 h-5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  WhatsApp Connected
                </p>
                <p className="text-xs text-green-600">
                  Auto notifications active
                </p>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex-grow px-4">
          <div className="border-t border-gray-200 pt-4">
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">
              Recent Activity
            </h3>
            <ul className="space-y-3">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-start gap-3">
                  <div className={clsx(
                    'flex size-8 items-center justify-center rounded-full flex-shrink-0',
                    activity.iconColor
                  )}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.subtitle}
                    </p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 relative">
            <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {user?.username || 'Administrator'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isAuthenticated ? 'Admin' : 'Guest'}
              </p>
            </div>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {/* User Menu Dropdown */}
            {showUserMenu && isAuthenticated && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleUserSettings}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                >
                  <UserIcon className="w-4 h-4" />
                  User Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        isOpen={showDetailModal}
        meeting={selectedMeeting}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMeeting(null);
        }}
      />
      
      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
      />
    </aside>
  );
};