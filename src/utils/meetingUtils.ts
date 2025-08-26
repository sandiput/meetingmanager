import { Meeting } from '../types';

// Utility function to determine meeting status based on current time
export const getMeetingStatus = (meeting: Meeting): 'incoming' | 'completed' => {
  const now = new Date();
  const end = parseMeetingTime(meeting, 'end');
  return end > now ? 'incoming' : 'completed';
};

// Robust time parser that supports either "HH:mm" or full ISO in start_time/end_time
const parseMeetingTime = (meeting: Meeting, which: 'start' | 'end'): Date => {
  const timeStr = which === 'start' ? (meeting as any).start_time : (meeting as any).end_time;
  if (typeof timeStr === 'string' && timeStr.includes('T')) {
    return new Date(timeStr);
  }
  const dateOnly = meeting.date.includes('T') ? meeting.date.split('T')[0] : meeting.date;
  return new Date(`${dateOnly}T${timeStr}`);
};

// Utility function to get meetings with computed status
export const getMeetingsWithStatus = (meetings: Meeting[]): (Meeting & { status: 'incoming' | 'completed' })[] => {
  return meetings.map(meeting => ({
    ...meeting,
    status: getMeetingStatus(meeting)
  }));
};

// Utility function to filter meetings by status
export const filterMeetingsByStatus = (
  meetings: Meeting[], 
  status: 'incoming' | 'completed'
): Meeting[] => {
  return meetings.filter(meeting => getMeetingStatus(meeting) === status);
};

// Utility function to get upcoming meetings (incoming only)
export const getUpcomingMeetings = (meetings: Meeting[]): Meeting[] => {
  return filterMeetingsByStatus(meetings, 'incoming')
    .sort((a, b) => {
      const dateA = parseMeetingTime(a, 'start').getTime();
      const dateB = parseMeetingTime(b, 'start').getTime();
      return dateA - dateB;
    });
};

// Utility function to get completed meetings
export const getCompletedMeetings = (meetings: Meeting[]): Meeting[] => {
  return filterMeetingsByStatus(meetings, 'completed')
    .sort((a, b) => {
      const dateA = parseMeetingTime(a, 'start').getTime();
      const dateB = parseMeetingTime(b, 'start').getTime();
      return dateB - dateA; // Most recent first
    });
};