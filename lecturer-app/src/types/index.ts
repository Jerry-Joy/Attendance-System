export interface Lecturer {
  id: string;
  name: string;
  title: string;
  department: string;
  avatarInitials: string;
  email: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  level: string;
  studentCount: number;
  lastSession: string;
  groups: string[];
  joinCode: string;
  venueLocation?: { latitude: number; longitude: number };
  venueName?: string;
  schedule?: string;
  attendanceRate?: number;
}

export interface EnrolledStudent {
  id: string;
  name: string;
  indexNumber: string;
  level: string;
  joinedDate: string;
  avatarInitials: string;
  attendanceRate: number;
}

export interface AttendingStudent {
  id: string;
  name: string;
  indexNumber: string;
  time: string;
  gpsVerified: boolean;
  avatarInitials: string;
}

export interface SessionSummaryType {
  courseCode: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  qrGpsVerified: number;
  geofenceRadius: number;
  venueName: string;
}

export interface CourseReport {
  code: string;
  name: string;
  rate: number;
  sessions: number;
  gpsRate: number;
}

export interface WeeklyData {
  day: string;
  rate: number;
}

export interface PastSession {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  venue: string;
  qrGpsVerified?: number;
  geofenceRadius?: number;
  attendees?: AttendingStudent[];
}

export interface ActiveSessionType {
  courseId: string;
  courseCode: string;
  courseName: string;
  radius: number;
  duration: string;
  latitude?: number;
  longitude?: number;
  lecturerAccuracy?: number;
  startedAt: number;
  attendees: AttendingStudent[];
  sessionId?: string;
  qrToken?: string;
}

export interface LecturerPreferences {
  qrAutoRefresh: boolean;
  gpsRequired: boolean;
  notifications: boolean;
  blockchainWrite: boolean;
}
