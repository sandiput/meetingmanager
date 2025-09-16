import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Users, TrendingUp, BarChart3, Clock, Award, Download } from 'lucide-react';
import { Header } from '../components/layout/Header';
import UserProfileHeader from '../components/UserProfileHeader';
import { reviewApi } from '../services/api';
import { ReviewStats, TopParticipant, SeksiStats, MeetingTrend, TopInvitedBy } from '../types';
import { useToast } from '../contexts/ToastContext';
import { clsx } from 'clsx';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type PeriodType = 'weekly' | 'monthly' | 'yearly' | 'custom';

export const Review: React.FC = () => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [topParticipants, setTopParticipants] = useState<TopParticipant[]>([]);
  const [topInvitedBy, setTopInvitedBy] = useState<TopInvitedBy[]>([]);
  const [seksiStats, setSeksiStats] = useState<SeksiStats[]>([]);
  const [meetingTrends, setMeetingTrends] = useState<MeetingTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const { error } = useToast();

  const fetchReviewData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters for custom period
      const queryParams = selectedPeriod === 'custom' && customStartDate && customEndDate 
        ? { startDate: customStartDate, endDate: customEndDate } as Record<string, string | number>
        : undefined;
      
      const [statsResponse, participantsResponse, invitedByResponse, seksiResponse, trendsResponse] = await Promise.all([
        reviewApi.getStats(selectedPeriod, queryParams),
        reviewApi.getTopParticipants(selectedPeriod, queryParams),
        reviewApi.getTopInvitedBy(selectedPeriod, queryParams),
        reviewApi.getSeksiStats(selectedPeriod, queryParams),
        reviewApi.getMeetingTrends(selectedPeriod, queryParams),
      ]);
      
      setStats(statsResponse.data);
      setTopParticipants(participantsResponse.data);
      // Data dari API sudah sesuai dengan interface TopInvitedBy, tidak perlu transformasi
      setTopInvitedBy(invitedByResponse.data);
      setSeksiStats(seksiResponse.data);
      setMeetingTrends(trendsResponse.data);
    } catch (err) {
      error('Failed to load review data');
      console.error('Review fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, customStartDate, customEndDate, error]);

  useEffect(() => {
    if (selectedPeriod !== 'custom') {
      fetchReviewData();
    }
  }, [selectedPeriod, fetchReviewData]);

  const getPeriodLabel = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'weekly':
        return `Week of ${format(startOfWeek(now), 'dd MMM yyyy')}`;
      case 'monthly':
        return format(startOfMonth(now), 'MMMM yyyy');
      case 'yearly':
        return format(startOfYear(now), 'yyyy');
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${format(new Date(customStartDate), 'dd MMM yyyy')} - ${format(new Date(customEndDate), 'dd MMM yyyy')}`;
        }
        return 'Custom Period';
      default:
        return '';
    }
  };

  const getSeksiColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-indigo-500',
    ];
    return colors[index % colors.length];
  };

  const exportReport = async () => {
    try {
      // Prepare query parameters for custom period
      const queryParams = selectedPeriod === 'custom' && customStartDate && customEndDate 
        ? { startDate: customStartDate, endDate: customEndDate } as Record<string, string | number>
        : undefined;
        
      const blob = await reviewApi.exportExcel(selectedPeriod, queryParams);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const dateLabel = selectedPeriod === 'custom' && customStartDate && customEndDate
        ? `${customStartDate}_to_${customEndDate}`
        : selectedPeriod;
      
      link.download = `meeting-review-${dateLabel}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      error('Failed to export Excel report');
      console.error('Export error:', err);
    }
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
        title="Review & Analytics"
        subtitle={`Meeting performance analysis for ${getPeriodLabel()}`}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                const newPeriod = e.target.value as PeriodType;
                setSelectedPeriod(newPeriod);
                if (newPeriod !== 'custom') {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }
              }}
              className="rounded-lg border-gray-200 text-sm px-3 py-2 focus:border-indigo-300 focus:ring-indigo-200"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
            
            {selectedPeriod === 'custom' && (
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="rounded-md border-gray-300 text-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="rounded-md border-gray-300 text-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      fetchReviewData();
                    }
                  }}
                  disabled={!customStartDate || !customEndDate}
                  className="mt-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Apply
                </button>
              </div>
            )}
            
            <button
              onClick={exportReport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            
            <UserProfileHeader />
          </div>
        }
      />
      
      <div className="container mx-auto px-6 py-8 sm:px-8">
        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Meetings</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total_meetings}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.completed_meetings} completed
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Registered Participants</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.avg_participants}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently active members
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
                  <p className="text-2xl font-bold text-gray-800">  {Math.round(stats.avg_duration)} min</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Per meeting average
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">WhatsApp Sent</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.whatsapp_notifications}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Notifications delivered
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
  {/* Kolom Kiri */}
  <div className="space-y-6">
    {/* Top 5 Most Active Participants */}
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-yellow-100">
          <Award className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Top 5 Most Active Participants</h3>
          <p className="text-sm text-gray-500">Participants with highest meeting attendance</p>
        </div>
      </div>

      <div className="space-y-3">
        {topParticipants.map((participant, index) => (
          <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold',
              index === 0 ? 'bg-yellow-500' :
              index === 1 ? 'bg-gray-400' :
              index === 2 ? 'bg-orange-400' :
              'bg-blue-500'
            )}>
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{participant.name}</p>
              <p className="text-xs text-gray-500">{participant.seksi}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-600">{participant.meeting_count}</p>
              <p className="text-xs text-gray-400">meetings</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Meeting Distribution by Seksi */}
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-100">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Meeting Distribution by Seksi</h3>
          <p className="text-sm text-gray-500">Participation breakdown by department</p>
        </div>
      </div>

      <div className="space-y-4">
        {seksiStats.map((seksi, index) => {
          const percentage = stats ? (seksi.meeting_count / stats.total_meetings * 100) : 0;
          return (
            <div key={seksi.seksi} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx('w-4 h-4 rounded-full', getSeksiColor(index))} />
                  <span className="text-sm font-medium text-gray-700">{seksi.seksi}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-indigo-600">{seksi.meeting_count}</span>
                  <span className="text-xs text-gray-400 ml-2">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={clsx('h-2 rounded-full transition-all duration-700', getSeksiColor(index))}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>

  {/* Kolom Kanan */}
  <div className="space-y-6">
    {/* Top 5 Invited By */}
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-green-100">
          <Users className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Top 5 Invited By</h3>
          <p className="text-sm text-gray-500">Most active meeting organizers</p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : topInvitedBy.length > 0 ? (
          topInvitedBy.map((inviter, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold',
                index === 0 ? 'bg-green-500' :
                index === 1 ? 'bg-blue-400' :
                index === 2 ? 'bg-purple-400' :
                'bg-indigo-500'
              )}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{inviter.invited_by}</p>
                <p className="text-xs text-gray-500">Meeting organizer</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">{inviter.meeting_count}</p>
                <p className="text-xs text-gray-400">meetings</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No data available for the selected period</p>
          </div>
        )}
      </div>
    </div>

    {/* Participants per Seksi Pie Chart */}
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-50">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Participants by Seksi</h3>
          <p className="text-sm text-gray-500">Distribution overview</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={seksiStats.map((seksi) => ({
                name: seksi.seksi,
                value: seksi.participant_count || seksi.meeting_count,
              }))}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {seksiStats.map((_, index) => {
                const colorMap = {
                  'bg-blue-500': '#3b82f6',
                  'bg-green-500': '#10b981',
                  'bg-purple-500': '#8b5cf6',
                  'bg-orange-500': '#f97316',
                  'bg-red-500': '#ef4444',
                  'bg-indigo-500': '#6366f1'
                };
                const colorClass = getSeksiColor(index);
                const color = colorMap[colorClass as keyof typeof colorMap] || '#6366f1';
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={3}
                  />
                );
              })}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              formatter={(value, name) => [`${value} participants`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {seksiStats.slice(0, 6).map((seksi, index) => {
          const colorMap = {
            'bg-blue-500': '#3b82f6',
            'bg-green-500': '#10b981',
            'bg-purple-500': '#8b5cf6',
            'bg-orange-500': '#f97316',
            'bg-red-500': '#ef4444',
            'bg-indigo-500': '#6366f1'
          };
          const colorClass = getSeksiColor(index);
          const color = colorMap[colorClass as keyof typeof colorMap] || '#6366f1';
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-600 truncate">{seksi.seksi}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</div>


        {/* Meeting Trends */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Meeting Trends</h3>
              <p className="text-sm text-gray-500">Meeting frequency over time</p>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={meetingTrends}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'semibold' }}
                  itemStyle={{ color: '#4f46e5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#4f46e5', strokeWidth: 2, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-100">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Report Actions</h3>
              <p className="text-sm text-gray-500">Generate detailed reports and analytics</p>
            </div>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={exportReport}
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold text-sm">Export Full Report</p>
                <p className="text-xs opacity-75">Download complete data</p>
              </div>
            </button>
              
            <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 transition-colors">
              <BarChart3 className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold text-sm">Generate Charts</p>
                <p className="text-xs opacity-75">Visual presentations</p>
              </div>
            </button>
              
            <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 transition-colors">
              <TrendingUp className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold text-sm">Trend Analysis</p>
                <p className="text-xs opacity-75">Performance trends</p>
              </div>
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};