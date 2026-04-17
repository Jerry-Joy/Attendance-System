import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

type AppConfigExtra = {
  apiBaseUrl?: string;
  apiOrigin?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppConfigExtra;

function extractHost(value?: string | null): string | null {
  if (!value) return null;
  const host = value.split('/')[0]?.split(':')[0]?.trim();
  if (!host) return null;
  // Only auto-substitute when we have an IPv4 LAN host.
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) return host;
  return null;
}

function getExpoHost(): string | null {
  const fromExpoConfig = extractHost(
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri,
  );
  if (fromExpoConfig) return fromExpoConfig;

  const fromManifest2 = extractHost(
    (Constants as unknown as {
      manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
    }).manifest2?.extra?.expoGo?.debuggerHost,
  );
  if (fromManifest2) return fromManifest2;

  const fromManifest = extractHost(
    (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest
      ?.debuggerHost,
  );
  if (fromManifest) return fromManifest;

  try {
    const url = Linking.createURL('/');
    const fromLinking = extractHost(Linking.parse(url).hostname ?? null);
    if (fromLinking) return fromLinking;
  } catch {
    // Ignore parse/runtime errors and continue with fallback.
  }

  return null;
}

function resolveLocalhost(url: string, host: string | null): string {
  if (!host) return url;
  return url.replace('://localhost', `://${host}`);
}

const expoHost = getExpoHost();
const defaultApiOrigin = expoHost ? `http://${expoHost}:3001` : 'http://localhost:3001';
const configuredApiOrigin = (extra.apiOrigin || '').trim() || defaultApiOrigin;
const configuredApiBase =
  (extra.apiBaseUrl || '').trim() || `${configuredApiOrigin.replace(/\/api\/?$/, '')}/api`;

const API_BASE = resolveLocalhost(configuredApiBase, expoHost);
export const API_ORIGIN = resolveLocalhost(configuredApiOrigin, expoHost);
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
  method: string;      // QR_GPS
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
  method: 'QR+GPS';
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
    method: 'QR+GPS',
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

  previewCourse: (joinCode: string) =>
    request<{ course: BackendCourse; alreadyEnrolled: boolean }>('/courses/preview', {
      method: 'POST',
      body: JSON.stringify({ joinCode }),
    }),

  joinCourse: (joinCode: string) =>
    request<BackendCourse>('/courses/join', {
      method: 'POST',
      body: JSON.stringify({ joinCode }),
    }),

  // Attendance
  markAttendance: (data: { token: string; courseId: string; latitude?: number; longitude?: number; accuracy: number }) =>
    request<BackendAttendanceResult>('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: () => request<BackendHistoryRecord[]>('/attendance/history'),

  // Sessions (student)
  getActiveSessions: () =>
    request<{
      sessionId: string;
      courseId: string;
      courseCode: string;
      courseName: string;
      venue: string | null;
      startedAt: string;
      duration: number;
      alreadyMarked: boolean;
    }[]>('/sessions/active'),

  checkAttendance: (courseId: string) =>
    request<{ alreadyMarked: boolean; sessionId?: string }>(
      `/sessions/check-attendance?courseId=${encodeURIComponent(courseId)}`,
    ),
};
