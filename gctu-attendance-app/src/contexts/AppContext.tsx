import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, mapCourse, mapHistoryRecord, MappedCourse, MappedHistoryRecord, ApiError } from '../lib/api';
import { useAuth } from './AuthContext';

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
