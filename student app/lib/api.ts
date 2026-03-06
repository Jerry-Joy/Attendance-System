import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://localhost:3001/api';
const TOKEN_KEY = 'smartattend_token';

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  return cachedToken;
}

export async function setToken(t: string | null) {
  cachedToken = t;
  try {
    if (t) await SecureStore.setItemAsync(TOKEN_KEY, t);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch { /* ignore */ }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = await getToken();
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

export interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  studentId: string | null;
  staffId: string | null;
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

export interface BackendHistoryRecord {
  id: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  date: string;       // ISO string of session startedAt
  markedAt: string;    // ISO string
  method: string;      // QR_GPS | QR_ONLY
  distance: number | null;
}

export interface BackendAttendanceResult {
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

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  indexNumber: string;
  avatarInitials: string;
}

export function mapUser(u: BackendUser): StudentProfile {
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    indexNumber: u.studentId || '',
    avatarInitials: initials(u.fullName),
  };
}

export interface MappedCourse {
  id: string;
  code: string;
  name: string;
  studentCount: number;
  joinCode: string;
  venueName?: string;
}

export function mapCourse(c: BackendCourse): MappedCourse {
  return {
    id: c.id,
    code: c.courseCode,
    name: c.courseName,
    studentCount: c._count.enrollments,
    joinCode: c.joinCode,
    venueName: c.venue || undefined,
  };
}

export interface MappedHistoryRecord {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  status: 'present';
  method: 'QR+GPS' | 'QR Only';
  lecturer: string;
}

export function mapHistoryRecord(r: BackendHistoryRecord): MappedHistoryRecord {
  const d = new Date(r.markedAt);
  return {
    id: r.id,
    courseCode: r.courseCode,
    courseName: r.courseName,
    date: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    status: 'present',
    method: r.method === 'QR_GPS' ? 'QR+GPS' : 'QR Only',
    lecturer: r.lecturer,
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

  signup: (data: { email: string; fullName: string; password: string; role: string; studentId?: string }) =>
    request<{ accessToken: string; user: BackendUser }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<BackendUser>('/auth/me'),

  // Courses (student-scoped: returns enrolled courses)
  getCourses: () => request<BackendCourse[]>('/courses'),

  getCourse: (id: string) => request<BackendCourse>(`/courses/${id}`),

  joinCourse: (joinCode: string) =>
    request<BackendCourse>('/courses/join', {
      method: 'POST',
      body: JSON.stringify({ joinCode }),
    }),

  // Attendance
  markAttendance: (data: { token: string; courseId: string; latitude?: number; longitude?: number }) =>
    request<BackendAttendanceResult>('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: () => request<BackendHistoryRecord[]>('/attendance/history'),
};
