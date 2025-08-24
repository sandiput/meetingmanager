import { Meeting } from '../types';

// Utility function to determine meeting status based on current time
export const getMeetingStatus = (meeting: Meeting): 'incoming' | 'completed' => {
  const now = new Date();
  const meetingEndDateTime = new Date(`${meeting.date}T${meeting.end_time}`);
  
  return meetingEndDateTime > now ? 'incoming' : 'completed';
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
      const dateA = new Date(`${a.date}T${a.start_time}`);
      const dateB = new Date(`${b.date}T${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    });
};

// Utility function to get completed meetings
export const getCompletedMeetings = (meetings: Meeting[]): Meeting[] => {
  return filterMeetingsByStatus(meetings, 'completed')
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.start_time}`);
      const dateB = new Date(`${b.date}T${b.start_time}`);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
};