import type { Lecturer, Course, EnrolledStudent, PastSession, AttendingStudent } from '../types';

const envApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const envWsBase = import.meta.env.VITE_WS_BASE_URL?.trim();

const API_BASE =
  envApiBase && envApiBase.length > 0 ? envApiBase : 'http://localhost:3001/api';

export const WS_BASE =
  envWsBase && envWsBase.length > 0
    ? envWsBase
    : API_BASE.replace(/\/api\/?$/, '');

const TOKEN_KEY = 'smartattend_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Backend response types ─────────────────────────────────

interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  studentId?: string | null;
  staffId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCourse {
  id: string;
  courseCode: string;
  courseName: string;
  joinCode: string;
  venue: string | null;
  dayOfWeek: string | null;
  startTime: string | null;
  endTime: string | null;
  lecturerId: string;
  createdAt: string;
  updatedAt: string;
  _count: { enrollments: number };
}

interface BackendStudent {
  id: string;
  fullName: string;
  email: string;
  studentId: string | null;
  enrolledAt: string;
}

export interface BackendSession {
  id: string;
  qrToken: string;
  latitude: number | null;
  longitude: number | null;
  lecturerAccuracy: number | null;
  lecturerLocationCapturedAt: string | null;
  geofenceRadius: number;
  duration: number;
  status: string;
  startedAt: string;
  endedAt: string | null;
  courseId: string;
  lecturerId: string;
  course: { courseCode: string; courseName: string; venue: string | null };
  _count: { attendances: number };
}

interface BackendSessionSummary {
  sessionId: string;
  courseCode: string;
  courseName: string;
  venue: string | null;
  startedAt: string;
  endedAt: string | null;
  duration: number;
  status: string;
  geofenceRadius: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  qrGpsVerified: number;
}

interface BackendAttendanceRecord {
  id: string;
  method: string;
  distance: number | null;
  markedAt: string;
  student: { id: string; fullName: string; studentId: string | null };
  sessionId: string;
}

// ─── Mapper helpers ─────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function mapUser(u: BackendUser): Lecturer {
  return {
    id: u.staffId || u.id,
    name: u.fullName,
    title: 'Lecturer',
    department: '',
    avatarInitials: initials(u.fullName),
    email: u.email,
  };
}

export function mapCourse(c: BackendCourse): Course {
  return {
    id: c.id,
    code: c.courseCode,
    name: c.courseName,
    level: '',
    studentCount: c._count.enrollments,
    lastSession: '',
    groups: [],
    joinCode: c.joinCode,
    venueName: c.venue || undefined,
  };
}

export function mapStudent(s: BackendStudent): EnrolledStudent {
  return {
    id: s.id,
    name: s.fullName,
    indexNumber: s.studentId || '',
    level: '',
    joinedDate: new Date(s.enrolledAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    avatarInitials: initials(s.fullName),
    attendanceRate: 0,
  };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function mapSession(s: BackendSession): PastSession {
  return {
    id: s.id,
    courseCode: s.course.courseCode,
    courseName: s.course.courseName,
    date: fmtDate(s.startedAt),
    startTime: fmtTime(s.startedAt),
    endTime: s.endedAt ? fmtTime(s.endedAt) : '',
    duration: `${s.duration} min`,
    totalStudents: 0,
    presentCount: s._count.attendances,
    absentCount: 0,
    venue: s.course.venue || '',
    geofenceRadius: s.geofenceRadius,
  };
}

export function mapAttendance(a: BackendAttendanceRecord): AttendingStudent {
  return {
    id: a.student.id,
    name: a.student.fullName,
    indexNumber: a.student.studentId || '',
    time: fmtTime(a.markedAt),
    gpsVerified: a.method === 'QR_GPS',
    avatarInitials: initials(a.student.fullName),
  };
}

// ─── API methods ────────────────────────────────────────────

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: BackendUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: {
    email: string;
    fullName: string;
    password: string;
    role: string;
    staffId?: string;
  }) =>
    request<{ accessToken: string; user: BackendUser }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<BackendUser>('/auth/me'),

  // Courses
  getCourses: () => request<BackendCourse[]>('/courses'),

  createCourse: (data: {
    courseCode: string;
    courseName: string;
    venue?: string;
  }) =>
    request<BackendCourse>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCourse: (
    id: string,
    data: { courseCode?: string; courseName?: string; venue?: string },
  ) =>
    request<BackendCourse>(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCourse: (id: string) =>
    request<{ deleted: boolean }>(`/courses/${id}`, { method: 'DELETE' }),

  getCourseStudents: (courseId: string) =>
    request<BackendStudent[]>(`/courses/${courseId}/students`),

  removeStudent: (courseId: string, studentId: string) =>
    request<{ removed: boolean }>(
      `/courses/${courseId}/students/${studentId}`,
      { method: 'DELETE' },
    ),

  // Sessions
  createSession: (data: {
    courseId: string;
    duration: number;
    latitude?: number;
    longitude?: number;
    lecturerAccuracy?: number;
    lecturerLocationCapturedAt?: string;
    geofenceRadius?: number;
  }) =>
    request<BackendSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSession: (id: string) => request<BackendSession>(`/sessions/${id}`),

  endSession: (id: string) =>
    request<BackendSession>(`/sessions/${id}/end`, { method: 'PATCH' }),

  refreshQr: (id: string) =>
    request<{ id: string; qrToken: string }>(`/sessions/${id}/refresh-qr`, {
      method: 'PATCH',
    }),

  getCourseSessions: (courseId: string) =>
    request<BackendSession[]>(`/courses/${courseId}/sessions`),

  getSessionSummary: (id: string) =>
    request<BackendSessionSummary>(`/sessions/${id}/summary`),

  getSessionAttendance: (sessionId: string) =>
    request<BackendAttendanceRecord[]>(`/sessions/${sessionId}/attendance`),

  getActiveSessionForCourse: async (
    courseId: string,
  ): Promise<BackendSession | null> => {
    try {
      const sessions = await request<BackendSession[]>(
        `/courses/${courseId}/sessions`,
      );
      const now = Date.now();
      return (
        sessions.find((s) => {
          if (s.status !== 'ACTIVE') return false;
          const endMs = new Date(s.startedAt).getTime() + s.duration * 60_000;
          return now <= endMs;
        }) ?? null
      );
    } catch {
      return null;
    }
  },
};
