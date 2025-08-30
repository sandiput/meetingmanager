import { Meeting } from '../types';

// Removed getMeetingStatus function - now using status from database

// Robust time parser that supports either "HH:mm" or full ISO in start_time/end_time
export const parseMeetingDateTime = (meeting: Meeting, which: 'start' | 'end'): Date => {
  try {
    // Default to current date if parsing fails
    const defaultDate = new Date();
    
    // Validasi data meeting - pengecekan lebih ketat
    if (!meeting) {
      console.warn('Invalid meeting data: meeting object is null or undefined');
      return defaultDate;
    }
    
    if (!meeting.date) {
      console.warn('Invalid meeting data: missing date');
      return defaultDate;
    }
    
    const timeStr = which === 'start' ? meeting.start_time : meeting.end_time;
    
    // Validasi timeStr lebih ketat
    if (!timeStr) {
      console.warn(`Invalid meeting data: missing ${which}_time`);
      return defaultDate;
    }
    
    // Jika timeStr sudah dalam format ISO dengan T
    if (typeof timeStr === 'string' && timeStr.includes('T')) {
      try {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid ISO time format: ${timeStr}`);
          return defaultDate;
        }
        return date;
      } catch (e) {
        console.error(`Error parsing ISO time: ${timeStr}`, e);
        return defaultDate;
      }
    }
    
    // Ekstrak tanggal dari meeting.date dengan validasi lebih ketat
    let dateOnly;
    try {
      dateOnly = typeof meeting.date === 'string' && meeting.date.includes('T') 
        ? meeting.date.split('T')[0] 
        : meeting.date;
        
      if (!dateOnly || typeof dateOnly !== 'string' || dateOnly.trim() === '') {
        console.warn(`Invalid date format: ${meeting.date}`);
        return defaultDate;
      }
    } catch (e) {
      console.error(`Error extracting date: ${meeting.date}`, e);
      return defaultDate;
    }
    
    // Validasi format waktu
    if (typeof timeStr !== 'string' || !timeStr.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)) {
      console.warn(`Time format may be invalid: ${timeStr}`);
      // Tetap lanjutkan, mungkin masih bisa diproses
    }
    
    // Buat objek Date dari kombinasi tanggal dan waktu dengan try-catch tambahan
    try {
      const dateTimeStr = `${dateOnly}T${timeStr}`;
      const dateTime = new Date(dateTimeStr);
      
      // Validasi hasil dengan pesan error yang lebih jelas
      if (isNaN(dateTime.getTime())) {
        console.error(`Invalid date/time combination: ${dateTimeStr}`);
        return defaultDate;
      }
      
      return dateTime;
    } catch (e) {
      console.error(`Error creating Date object from: ${dateOnly}T${timeStr}`, e);
      return defaultDate;
    }
  } catch (error) {
    console.error(`Error parsing meeting ${which} time:`, error);
    return new Date(); // Return current date as fallback
  }
};

// Utility function to get meetings with status from database
export const getMeetingsWithStatus = (meetings: Meeting[]): (Meeting & { status: 'upcoming' | 'completed' })[] => {
  return meetings.map(meeting => ({
    ...meeting,
    status: meeting.status || 'upcoming'
  }));
};

// Utility function to filter meetings by status
export const filterMeetingsByStatus = (
  meetings: Meeting[], 
  status: 'upcoming' | 'completed'
): Meeting[] => {
  return meetings.filter(meeting => (meeting.status || 'upcoming') === status);
};

// Utility function to get upcoming meetings (upcoming only)
export const getUpcomingMeetings = (meetings: Meeting[]): Meeting[] => {
  return filterMeetingsByStatus(meetings, 'upcoming')
    .sort((a, b) => {
      const dateA = parseMeetingDateTime(a, 'start').getTime();
      const dateB = parseMeetingDateTime(b, 'start').getTime();
      return dateA - dateB;
    });
};

// Utility function to get completed meetings
export const getCompletedMeetings = (meetings: Meeting[]): Meeting[] => {
  return filterMeetingsByStatus(meetings, 'completed')
    .sort((a, b) => {
      const dateA = parseMeetingDateTime(a, 'start').getTime();
      const dateB = parseMeetingDateTime(b, 'start').getTime();
      return dateB - dateA; // Most recent first
    });
};