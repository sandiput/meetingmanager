import React, { useState, useEffect } from 'react';
import { Clock, Edit, Trash2, Check } from 'lucide-react';
import { ApiResponse } from '../types';

interface RecentActivityType {
  id: number;
  title: string;
  description: string;
  action_type: string;
  table_name: string;
  full_name: string;
  time_ago: string;
}

interface RecentActivityProps {
  limit?: number;
  showHeader?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ 
  limit = 3, 
  showHeader = true 
}) => {
  const [activities, setActivities] = useState<RecentActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentActivities();
  }, [limit]);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/recent-activities?limit=${limit}`, {
        method: 'GET',
        credentials: 'include', // Include cookies in request
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data: ApiResponse<RecentActivityType[]> = await response.json();
      
      if (data.success) {
        setActivities(data.data);
      } else {
        setError('Gagal memuat aktivitas terbaru');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data');
      console.error('Error fetching recent activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType?.toUpperCase()) {
      case 'CREATE':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'UPDATE':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h3>
          </div>
        )}
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg border-l-4 border-l-gray-300">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h3>
          </div>
        )}
        <div className="text-red-500 text-sm">{error}</div>
        <button 
          onClick={fetchRecentActivities}
          className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h3>
          </div>
        )}
        <div className="text-gray-500 text-sm">Belum ada aktivitas terbaru</div>
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">
          Recent Activity
        </h3>
      )}
      
      <ul className="space-y-3">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mt-1">
              {getActionIcon(activity.action_type)}
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 truncate">
                by {activity.full_name || 'Unknown User'}
              </p>
              <p className="text-xs text-gray-400">{activity.time_ago}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;