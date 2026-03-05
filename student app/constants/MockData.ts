/**
 * Mock data for development and demonstration.
 * Smart Attendance System — Student App
 * Dynamic QR + GPS Geofencing
 * Replace with real API calls for production.
 */

export interface Student {
  id: string;
  name: string;
  indexNumber: string;
  department: string;
  level: string;
  avatarInitials: string;
  device: string;
  locationEnabled: boolean;
  attendanceRate: number;
  totalSessions: number;
  missedSessions: number;
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
}

export interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  status: 'present' | 'absent';
  method?: 'QR+GPS' | 'QR Only';
  lecturer: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  courseCode: string;
  status: 'completed' | 'active' | 'upcoming';
}

// ─── Mock Student ───
export const mockStudent: Student = {
  id: '1',
  name: 'James Doe',
  indexNumber: 'CSC/2022/001',
  department: 'Computer Science',
  level: 'Level 400',
  avatarInitials: 'JD',
  device: 'iPhone 14 Pro',
  locationEnabled: true,
  attendanceRate: 95,
  totalSessions: 42,
  missedSessions: 2,
};

// ─── Mock Courses ───
export const mockCourses: Course[] = [
  {
    id: '1',
    code: 'CSC 401',
    name: 'Software Engineering',
    level: 'Level 400',
    studentCount: 45,
    lastSession: 'Wed, 19 Feb',
    groups: ['Group A', 'Group B', 'All'],
    joinCode: 'CSC401-XK9F',
    venueLocation: { latitude: 7.5176, longitude: 4.5270 },
    venueName: 'Room 301, CS Building',
  },
  {
    id: '2',
    code: 'CSC 405',
    name: 'Computer Networks',
    level: 'Level 400',
    studentCount: 38,
    lastSession: 'Mon, 17 Feb',
    groups: ['Group A', 'All'],
    joinCode: 'CSC405-MP2Q',
    venueLocation: { latitude: 7.5180, longitude: 4.5275 },
    venueName: 'Hall 2, Engineering Block',
  },
  {
    id: '3',
    code: 'CSC 411',
    name: 'Artificial Intelligence',
    level: 'Level 400',
    studentCount: 52,
    lastSession: 'Fri, 14 Feb',
    groups: ['All'],
    joinCode: 'CSC411-BN7W',
    venueLocation: { latitude: 7.5185, longitude: 4.5265 },
    venueName: 'Lecture Theatre A',
  },
];

// ─── Mock Schedule ───
export const mockSchedule: ScheduleItem[] = [
  { id: '1', time: '08:00', courseCode: 'CSC 401', status: 'completed' },
  { id: '2', time: '10:00', courseCode: 'CSC 405', status: 'active' },
  { id: '3', time: '14:00', courseCode: 'CSC 411', status: 'upcoming' },
];

// ─── Mock Attendance History ───
export const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    courseCode: 'CSC 401',
    courseName: 'Software Engineering',
    date: 'Wed, 19 Feb 2026',
    time: '10:32 AM',
    status: 'present',
    method: 'QR+GPS',
    lecturer: 'Prof. Adeyemi',
  },
  {
    id: '2',
    courseCode: 'CSC 405',
    courseName: 'Computer Networks',
    date: 'Mon, 17 Feb 2026',
    time: '08:15 AM',
    status: 'absent',
    lecturer: 'Dr. Okafor',
  },
  {
    id: '3',
    courseCode: 'CSC 411',
    courseName: 'Artificial Intelligence',
    date: 'Fri, 14 Feb 2026',
    time: '14:00 PM',
    status: 'present',
    method: 'QR+GPS',
    lecturer: 'Prof. Nnamdi',
  },
  {
    id: '4',
    courseCode: 'CSC 401',
    courseName: 'Software Engineering',
    date: 'Wed, 12 Feb 2026',
    time: '10:30 AM',
    status: 'present',
    method: 'QR+GPS',
    lecturer: 'Prof. Adeyemi',
  },
  {
    id: '5',
    courseCode: 'CSC 405',
    courseName: 'Computer Networks',
    date: 'Mon, 10 Feb 2026',
    time: '08:10 AM',
    status: 'present',
    method: 'QR Only',
    lecturer: 'Dr. Okafor',
  },
  {
    id: '6',
    courseCode: 'CSC 411',
    courseName: 'Artificial Intelligence',
    date: 'Fri, 7 Feb 2026',
    time: '14:05 PM',
    status: 'present',
    method: 'QR+GPS',
    lecturer: 'Prof. Nnamdi',
  },
];

// ─── Student's Enrolled Courses ───
export const mockStudentCourses: Course[] = [
  mockCourses[0],
  mockCourses[1],
  mockCourses[2],
];

// ─── Available courses to join ───
export const mockAvailableCourses: Course[] = [
  {
    id: '4',
    code: 'CSC 415',
    name: 'Computer Graphics',
    level: 'Level 400',
    studentCount: 30,
    lastSession: 'Never',
    groups: ['All'],
    joinCode: 'CSC415-RT3H',
  },
];
