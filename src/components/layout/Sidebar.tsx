import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Eye, 
  Users, 
  Settings, 
  Search,
  MessageCircle,
  CheckCircle,
  PlusCircle,
  MoreVertical
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: '4',
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
    badge: '12',
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
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="w-full rounded-xl border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-300 focus:ring-indigo-200 transition-colors"
              placeholder="Search meetings..."
              type="text"
            />
          </div>
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
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                Administrator
              </p>
              <p className="text-xs text-gray-500 truncate">Sub. Inteligencia</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};