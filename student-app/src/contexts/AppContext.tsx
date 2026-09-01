import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, mapCourse, mapHistoryRecord, MappedCourse, MappedHistoryRecord, ApiError } from '../lib/api';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';
import { useNotifications } from './NotificationContext';

export interface ScannerPayload {
  token: string;
  courseId: string;
  courseCode: string;
  lat?: number;
  lng?: number;
  lecturerAccuracy?: number;
  radius?: number;
}

interface AppContextType {
  courses: MappedCourse[];
  history: MappedHistoryRecord[];
  historyLoading: boolean;
  coursesLoading: boolean;
  fetchCourses: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  joinCourse: (code: string) => Promise<MappedCourse>;
  previewCourse: (code: string) => Promise<{ course: MappedCourse; alreadyEnrolled: boolean }>;
  markAttendance: (payload: { token: string; courseId: string; latitude?: number; longitude?: number; accuracy: number }) => Promise<void>;
  checkAttendance: (courseId: string) => Promise<{ alreadyMarked: boolean; sessionId?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const notifiedSessions = new Set<string>();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<MappedCourse[]>([]);
  const [history, setHistory] = useState<MappedHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Fetch courses and history when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
      fetchHistory();
    } else {
      // Clear data when logged out
      setCourses([]);
      setHistory([]);
    }
  }, [isAuthenticated]);

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const backendCourses = await api.getCourses();
      setCourses(backendCourses.map(mapCourse));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const records = await api.getHistory();
      setHistory(records.map(mapHistoryRecord));
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const previewCourse = async (code: string): Promise<{ course: MappedCourse; alreadyEnrolled: boolean }> => {
    try {
      const response = await api.previewCourse(code);
      return {
        course: mapCourse(response.course),
        alreadyEnrolled: response.alreadyEnrolled,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to preview course');
    }
  };

  const joinCourse = async (code: string): Promise<MappedCourse> => {
    try {
      const course = await api.joinCourse(code);
      const mapped = mapCourse(course);
      setCourses(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to join course');
    }
  };

  const markAttendance = async (payload: { token: string; courseId: string; latitude?: number; longitude?: number; accuracy: number }) => {
    try {
      await api.markAttendance(payload);
      // Refresh history to include new record
      await fetchHistory();
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle specific errors
        if (error.status === 409) {
          throw new Error('Attendance already recorded for this session');
        }
        if (error.message.includes('expired')) {
          throw new Error('QR code has expired. Please scan again.');
        }
        throw new Error(error.message);
      }
      throw new Error('Failed to mark attendance');
    }
  };

  const checkAttendance = async (courseId: string): Promise<{ alreadyMarked: boolean; sessionId?: string }> => {
    try {
      return await api.checkAttendance(courseId);
    } catch (error) {
      console.error('Failed to check attendance:', error);
      return { alreadyMarked: false };
    }
  };

  const { addNotification } = useNotifications();

  // Check for upcoming/starting sessions and send notifications
  useEffect(() => {
    if (!isAuthenticated || courses.length === 0) return;

    const checkInterval = setInterval(async () => {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const course of courses) {
        if (!course.schedule) continue;

        try {
          // Parse schedule: "Monday, 09:00 - 10:30"
          const parts = course.schedule.split(',');
          if (parts.length < 2) continue;

          const dayName = parts[0].trim();
          const timeRange = parts[1].trim();
          const [startTime] = timeRange.split('-').map(t => t.trim());

          // Check if it's the right day
          if (dayName !== currentDay) continue;

          // Parse start time
          const [hours, minutes] = startTime.split(':').map(Number);
          const scheduledMinutes = hours * 60 + minutes;

          // Check if it's exactly the start time
          const minutesUntilStart = scheduledMinutes - currentMinutes;

          if (minutesUntilStart === 5) {
            const todayKey = now.toDateString();
            const reminderKey = `reminder_${course.id}_${todayKey}`;
            
            if (!notifiedSessions.has(reminderKey)) {
              notifiedSessions.add(reminderKey);
              
              addNotification({
                type: 'session_start', // or 'session_reminder' if supported
                title: `⏰ Class Starting Soon`,
                message: `${course.code} starts in 5 minutes.`,
                courseCode: course.code,
                courseName: course.name,
                actionable: false,
              });
              
              try {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: `⏰ ${course.code} Starting Soon`,
                    body: `${course.name} starts in 5 minutes.`,
                    sound: true,
                  },
                  trigger: null,
                });
              } catch (e) {
                console.error("Local notification error", e);
              }
            }
          } else if (minutesUntilStart === 0) {
            // Check if we already sent a 'class started' notification today
            const todayKey = now.toDateString();
            const startedKey = `started_${course.id}_${todayKey}`;
            
            if (!notifiedSessions.has(startedKey)) {
              notifiedSessions.add(startedKey);
              
              addNotification({
                type: 'session_start',
                title: `🟢 Class Started`,
                message: `${course.code} - ${course.name} is scheduled to start now.`,
                courseCode: course.code,
                courseName: course.name,
                actionable: false,
              });
              
              try {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: `🟢 ${course.code} Started`,
                    body: `${course.name} is scheduled to start now.`,
                    sound: true,
                  },
                  trigger: null,
                });
              } catch (e) {
                console.error("Local notification error", e);
              }
            }
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    }, 60000); // Check every minute

    // Run once immediately
    // ... we rely on the interval to hit exactly at minute 0

    return () => clearInterval(checkInterval);
  }, [courses, isAuthenticated, addNotification]);

  return (
    <AppContext.Provider value={{ 
      courses, 
      history, 
      historyLoading,
      coursesLoading,
      fetchCourses,
      fetchHistory,
      joinCourse,
      previewCourse,
      markAttendance,
      checkAttendance,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
