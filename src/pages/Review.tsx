import React, { useEffect, useState } from 'react';
import { Calendar, Users, TrendingUp, BarChart3, PieChart, Clock, Award, Target, FileText, Download } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { reviewApi } from '../services/api';
import { ReviewStats, TopParticipant, SeksiStats, MeetingTrend } from '../types';
import { useToast } from '../hooks/useToast';
import { clsx } from 'clsx';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

type PeriodType = 'weekly' | 'monthly' | 'yearly';

export const Review: React.FC = () => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [topParticipants, setTopParticipants] = useState<TopParticipant[]>([]);
  const [seksiStats, setSeksiStats] = useState<SeksiStats[]>([]);
  const [meetingTrends, setMeetingTrends] = useState<MeetingTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const { error } = useToast();

  useEffect(() => {
    fetchReviewData();
  }, [selectedPeriod]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const [statsResponse, participantsResponse, seksiResponse, trendsResponse] = await Promise.all([
        reviewApi.getStats(selectedPeriod),
        reviewApi.getTopParticipants(selectedPeriod),
        reviewApi.getSeksiStats(selectedPeriod),
        reviewApi.getMeetingTrends(selectedPeriod),
      ]);
      
      setStats(statsResponse.data);
      setTopParticipants(participantsResponse.data);
      setSeksiStats(seksiResponse.data);
      setMeetingTrends(trendsResponse.data);
    } catch (err) {
      error('Failed to load review data');
      console.error('Review fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'weekly':
        return `Week of ${format(startOfWeek(now), 'dd MMM yyyy')}`;
      case 'monthly':
        return format(startOfMonth(now), 'MMMM yyyy');
      case 'yearly':
        return format(startOfYear(now), 'yyyy');
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

  const exportReport = () => {
    // Mock export functionality
    const reportData = {
      period: selectedPeriod,
      periodLabel: getPeriodLabel(),
      stats,
      topParticipants,
      seksiStats,
      meetingTrends,
      generatedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting-review-${selectedPeriod}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
              onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
              className="rounded-lg border-gray-200 text-sm px-3 py-2 focus:border-indigo-300 focus:ring-indigo-200"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button
              onClick={exportReport}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        }
      />
      
      <div className="container mx-auto px-6 py-8 sm:px-8">
        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 mb-1">Total Meetings</p>
                  <p className="text-3xl font-bold text-blue-800">{stats.total_meetings}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.completed_meetings} completed, {stats.total_meetings - stats.completed_meetings} upcoming
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-200">
                  <Calendar className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 mb-1">Attendance Rate</p>
                  <p className="text-3xl font-bold text-green-800">{stats.attendance_rate}%</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.total_attendees} total attendees
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-200">
                  <Users className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 mb-1">Avg Duration</p>
                  <p className="text-3xl font-bold text-purple-800">{stats.avg_duration}h</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Per meeting average
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-200">
                  <Clock className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 mb-1">WhatsApp Sent</p>
                  <p className="text-3xl font-bold text-orange-800">{stats.whatsapp_notifications}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Notifications delivered
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-orange-200">
                  <TrendingUp className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top 10 Participants */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Top 10 Most Active Participants</h3>
                <p className="text-sm text-gray-600">Participants with highest meeting attendance</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {topParticipants.map((participant, index) => (
                <div key={participant.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold',
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                    index === 2 ? 'bg-gradient-to-r from-orange-300 to-orange-400' :
                    'bg-gradient-to-r from-blue-400 to-blue-500'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{participant.name}</p>
                    <p className="text-sm text-gray-600">{participant.seksi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{participant.meeting_count}</p>
                    <p className="text-xs text-gray-500">meetings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seksi Statistics Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                <PieChart className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Meeting Distribution by Seksi</h3>
                <p className="text-sm text-gray-600">Participation breakdown by department</p>
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
                        <span className="text-sm font-bold text-gray-800">{seksi.meeting_count}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={clsx('h-2 rounded-full transition-all duration-500', getSeksiColor(index))}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Meeting Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Meeting Trends</h3>
              <p className="text-sm text-gray-600">Meeting frequency over time</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {meetingTrends.map((trend, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">{trend.period}</p>
                  <p className="text-2xl font-bold text-gray-800 mb-2">{trend.count}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                      style={{ width: `${(trend.count / Math.max(...meetingTrends.map(t => t.count))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meeting Efficiency */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Meeting Efficiency Metrics</h3>
                <p className="text-sm text-gray-600">Performance indicators</p>
              </div>
            </div>
            
            {stats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">On-time Start Rate</span>
                  <span className="text-lg font-bold text-green-800">{stats.ontime_rate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">WhatsApp Response Rate</span>
                  <span className="text-lg font-bold text-blue-800">{stats.whatsapp_response_rate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-800">Meeting Completion Rate</span>
                  <span className="text-lg font-bold text-purple-800">{stats.completion_rate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-800">Average Participants</span>
                  <span className="text-lg font-bold text-orange-800">{stats.avg_participants}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Report Actions</h3>
                <p className="text-sm text-gray-600">Generate detailed reports</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={exportReport}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 transition-all"
              >
                <Download className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-blue-800">Export Full Report</p>
                  <p className="text-xs text-blue-600">Download complete analytics data</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg border border-green-200 transition-all">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-green-800">Generate Charts</p>
                  <p className="text-xs text-green-600">Create visual presentations</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg border border-purple-200 transition-all">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-purple-800">Trend Analysis</p>
                  <p className="text-xs text-purple-600">Detailed performance trends</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};