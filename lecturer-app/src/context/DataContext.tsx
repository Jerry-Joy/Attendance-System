import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Course, PastSession, EnrolledStudent, AttendingStudent, ActiveSessionType, LecturerPreferences } from '../types';
import { api, mapCourse, mapStudent, mapSession, getToken, type BackendSession } from '../lib/api';
import { useAuth } from './AuthContext';

const PREFS_KEY = 'corescan_prefs';

function loadPrefs(): LecturerPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { qrAutoRefresh: true, gpsRequired: true, notifications: true, blockchainWrite: true };
}

interface DataState {
  isDataLoading: boolean;

  courses: Course[];
  refreshCourses: () => Promise<void>;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  pastSessions: PastSession[];
  refreshSessions: () => Promise<void>;
  addPastSession: (session: PastSession) => void;

  enrolledStudents: Record<string, EnrolledStudent[]>;
  fetchStudents: (courseId: string) => Promise<void>;
  addStudent: (courseId: string, student: EnrolledStudent) => void;
  removeStudent: (courseId: string, studentId: string) => void;

  activeSession: ActiveSessionType | null;
  startActiveSession: (session: ActiveSessionType) => void;
  addAttendee: (student: AttendingStudent) => void;
  endActiveSession: () => void;

  preferences: LecturerPreferences;
  updatePreferences: (updates: Partial<LecturerPreferences>) => void;
}

const DataContext = createContext<DataState | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Record<string, EnrolledStudent[]>>({});
  const [activeSession, setActiveSession] = useState<ActiveSessionType | null>(null);
  const [preferences, setPreferences] = useState<LecturerPreferences>(loadPrefs);

  /* ── Fetch courses from API ─────────────────────────────── */
  const refreshCourses = useCallback(async () => {
    if (!getToken()) return;
    try {
      const raw = await api.getCourses();
      setCourses(raw.map(mapCourse));
    } catch { /* ignore */ }
  }, []);

  /* ── Fetch all sessions across courses ─────────────────── */
  const refreshSessions = useCallback(async () => {
    if (!getToken()) return;
    try {
      const rawCourses = await api.getCourses();
      const allSessions: BackendSession[] = [];
      for (const c of rawCourses) {
        try {
          const sessions = await api.getCourseSessions(c.id);
          allSessions.push(...sessions);
        } catch { /* ignore per-course errors */ }
      }
      allSessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      const mapped = allSessions
        .filter((s) => s.status === 'ENDED')
        .map((s) => {
          const course = rawCourses.find((c) => c.id === s.courseId);
          const ps = mapSession(s);
          ps.totalStudents = course?._count.enrollments ?? 0;
          ps.absentCount = ps.totalStudents - ps.presentCount;
          return ps;
        });
      setPastSessions(mapped);
    } catch { /* ignore */ }
  }, []);

  /* ── Fetch students for a course ────────────────────────── */
  const fetchStudents = useCallback(async (courseId: string) => {
    try {
      const raw = await api.getCourseStudents(courseId);
      setEnrolledStudents((prev) => ({ ...prev, [courseId]: raw.map(mapStudent) }));
    } catch { /* ignore */ }
  }, []);

  /**
   * On mount, scan all lecturer courses for a still-running ACTIVE session
   * and restore it into React state so the Live badge / Rejoin button survive a page refresh.
   */
  const recoverActiveSession = useCallback(async () => {
    if (!getToken()) return;
    try {
      const rawCourses = await api.getCourses();
      for (const c of rawCourses) {
        const session = await api.getActiveSessionForCourse(c.id);
        if (session) {
          setActiveSession({
            courseId: c.id,
            courseCode: c.courseCode,
            courseName: c.courseName,
            radius: session.geofenceRadius,
            duration: `${session.duration}`,
            latitude: session.latitude ?? undefined,
            longitude: session.longitude ?? undefined,
            lecturerAccuracy: session.lecturerAccuracy ?? undefined,
            startedAt: new Date(session.startedAt).getTime(),
            attendees: [],
            sessionId: session.id,
            qrToken: session.qrToken,
          });
          break;
        }
      }
    } catch { /* ignore */ }
  }, []);

  /* Load data whenever auth transitions to authenticated */
  useEffect(() => {
    if (isLoading || !isAuthenticated || !getToken()) return;

    let cancelled = false;

    const loadDashboardData = async () => {
      setIsDataLoading(true);
      await Promise.allSettled([
        refreshCourses(),
        refreshSessions(),
        recoverActiveSession(),
      ]);
      if (!cancelled) setIsDataLoading(false);
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, refreshCourses, refreshSessions, recoverActiveSession]);

  /* Clear per-user in-memory data on logout */
  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    setIsDataLoading(false);
    setCourses([]);
    setPastSessions([]);
    setEnrolledStudents({});
    setActiveSession(null);
  }, [isAuthenticated, isLoading]);

  /* ── Courses ────────────────────────────────────────────── */
  const addCourse = (course: Course) => {
    setCourses((prev) => [course, ...prev]);
    setEnrolledStudents((prev) => ({ ...prev, [course.id]: [] }));
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  /* ── Past sessions ──────────────────────────────────────── */
  const addPastSession = (session: PastSession) => {
    setPastSessions((prev) => [session, ...prev]);
  };

  /* ── Enrolled students ──────────────────────────────────── */
  const addStudent = (courseId: string, student: EnrolledStudent) => {
    setEnrolledStudents((prev) => ({
      ...prev,
      [courseId]: [...(prev[courseId] || []), student],
    }));
  };

  const removeStudent = (courseId: string, studentId: string) => {
    setEnrolledStudents((prev) => ({
      ...prev,
      [courseId]: (prev[courseId] || []).filter((s) => s.id !== studentId),
    }));
  };

  /* ── Active session ─────────────────────────────────────── */
  const startActiveSession = useCallback((session: ActiveSessionType) => {
    setActiveSession(session);
  }, []);

  const addAttendee = useCallback((student: AttendingStudent) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      if (prev.attendees.find((a) => a.id === student.id)) return prev;
      return { ...prev, attendees: [...prev.attendees, student] };
    });
  }, []);

  const endActiveSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  /* ── Preferences ────────────────────────────────────────── */
  const updatePreferences = (updates: Partial<LecturerPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <DataContext.Provider
      value={{
        isDataLoading,
        courses, refreshCourses, addCourse, updateCourse, deleteCourse,
        pastSessions, refreshSessions, addPastSession,
        enrolledStudents, fetchStudents, addStudent, removeStudent,
        activeSession, startActiveSession, addAttendee, endActiveSession,
        preferences, updatePreferences,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
