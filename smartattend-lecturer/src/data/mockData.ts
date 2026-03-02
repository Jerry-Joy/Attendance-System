import type { Lecturer, Course, EnrolledStudent, AttendingStudent, SessionSummary, CourseReport, WeeklyData, PastSession } from '../types'

export const mockLecturer: Lecturer = {
  id: '1',
  name: 'Prof. Adeyemi',
  title: 'Professor',
  department: 'Computer Science Dept.',
  avatarInitials: 'PA',
  email: 'adeyemi@university.edu',
}

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
]

export const mockEnrolledStudents: Record<string, EnrolledStudent[]> = {
  '1': [
    { id: '1', name: 'James Doe', indexNumber: 'CSC/2022/001', level: 'Level 400', joinedDate: 'Jan 15, 2026', avatarInitials: 'JD', attendanceRate: 95 },
    { id: '2', name: 'Sarah Alli', indexNumber: 'CSC/2022/015', level: 'Level 400', joinedDate: 'Jan 15, 2026', avatarInitials: 'SA', attendanceRate: 88 },
    { id: '3', name: 'David Chen', indexNumber: 'CSC/2022/023', level: 'Level 400', joinedDate: 'Jan 16, 2026', avatarInitials: 'DC', attendanceRate: 92 },
    { id: '4', name: 'Chioma Obi', indexNumber: 'CSC/2022/008', level: 'Level 400', joinedDate: 'Jan 16, 2026', avatarInitials: 'CO', attendanceRate: 78 },
    { id: '5', name: 'Emeka Nwosu', indexNumber: 'CSC/2022/042', level: 'Level 400', joinedDate: 'Jan 17, 2026', avatarInitials: 'EN', attendanceRate: 85 },
    { id: '6', name: 'Fatima Yusuf', indexNumber: 'CSC/2022/019', level: 'Level 400', joinedDate: 'Jan 17, 2026', avatarInitials: 'FY', attendanceRate: 91 },
    { id: '7', name: 'Tunde Bakare', indexNumber: 'CSC/2022/031', level: 'Level 400', joinedDate: 'Jan 18, 2026', avatarInitials: 'TB', attendanceRate: 72 },
    { id: '8', name: 'Grace Eze', indexNumber: 'CSC/2022/011', level: 'Level 400', joinedDate: 'Jan 18, 2026', avatarInitials: 'GE', attendanceRate: 97 },
  ],
  '2': [
    { id: '1', name: 'James Doe', indexNumber: 'CSC/2022/001', level: 'Level 400', joinedDate: 'Jan 15, 2026', avatarInitials: 'JD', attendanceRate: 90 },
    { id: '3', name: 'David Chen', indexNumber: 'CSC/2022/023', level: 'Level 400', joinedDate: 'Jan 16, 2026', avatarInitials: 'DC', attendanceRate: 85 },
    { id: '5', name: 'Emeka Nwosu', indexNumber: 'CSC/2022/042', level: 'Level 400', joinedDate: 'Jan 17, 2026', avatarInitials: 'EN', attendanceRate: 80 },
  ],
  '3': [
    { id: '1', name: 'James Doe', indexNumber: 'CSC/2022/001', level: 'Level 400', joinedDate: 'Jan 15, 2026', avatarInitials: 'JD', attendanceRate: 93 },
    { id: '2', name: 'Sarah Alli', indexNumber: 'CSC/2022/015', level: 'Level 400', joinedDate: 'Jan 15, 2026', avatarInitials: 'SA', attendanceRate: 88 },
    { id: '4', name: 'Chioma Obi', indexNumber: 'CSC/2022/008', level: 'Level 400', joinedDate: 'Jan 16, 2026', avatarInitials: 'CO', attendanceRate: 82 },
    { id: '6', name: 'Fatima Yusuf', indexNumber: 'CSC/2022/019', level: 'Level 400', joinedDate: 'Jan 17, 2026', avatarInitials: 'FY', attendanceRate: 95 },
  ],
}

export const mockAttendingStudents: AttendingStudent[] = [
  { id: '1', name: 'James Doe', indexNumber: 'CSC/2022/001', time: '10:32 AM', gpsVerified: true, avatarInitials: 'JD' },
  { id: '2', name: 'Sarah Alli', indexNumber: 'CSC/2022/015', time: '10:33 AM', gpsVerified: true, avatarInitials: 'SA' },
  { id: '3', name: 'David Chen', indexNumber: 'CSC/2022/023', time: '10:33 AM', gpsVerified: true, avatarInitials: 'DC' },
  { id: '4', name: 'Chioma Obi', indexNumber: 'CSC/2022/008', time: '10:34 AM', gpsVerified: true, avatarInitials: 'CO' },
  { id: '5', name: 'Emeka Nwosu', indexNumber: 'CSC/2022/042', time: '10:34 AM', gpsVerified: false, avatarInitials: 'EN' },
  { id: '6', name: 'Fatima Yusuf', indexNumber: 'CSC/2022/019', time: '10:35 AM', gpsVerified: true, avatarInitials: 'FY' },
  { id: '7', name: 'Tunde Bakare', indexNumber: 'CSC/2022/031', time: '10:35 AM', gpsVerified: true, avatarInitials: 'TB' },
  { id: '8', name: 'Grace Eze', indexNumber: 'CSC/2022/011', time: '10:36 AM', gpsVerified: true, avatarInitials: 'GE' },
  { id: '9', name: 'Kemi Adeola', indexNumber: 'CSC/2022/027', time: '10:36 AM', gpsVerified: true, avatarInitials: 'KA' },
  { id: '10', name: 'Bola Taiwo', indexNumber: 'CSC/2022/004', time: '10:37 AM', gpsVerified: true, avatarInitials: 'BT' },
  { id: '11', name: 'Uche Igwe', indexNumber: 'CSC/2022/038', time: '10:37 AM', gpsVerified: true, avatarInitials: 'UI' },
  { id: '12', name: 'Ngozi Okoro', indexNumber: 'CSC/2022/022', time: '10:38 AM', gpsVerified: true, avatarInitials: 'NO' },
]

export const mockSessionSummary: SessionSummary = {
  courseCode: 'CSC 401',
  courseName: 'Software Engineering',
  date: 'Wed, 19 Feb 2026',
  startTime: '10:30 AM',
  endTime: '10:42 AM',
  duration: '12 minutes',
  totalStudents: 45,
  presentCount: 38,
  absentCount: 7,
  qrGpsVerified: 35,
  qrOnlyVerified: 3,
  geofenceRadius: 50,
  venueName: 'Room 301, CS Building',
}

export const weeklyData: WeeklyData[] = [
  { day: 'Mon', rate: 72 },
  { day: 'Tue', rate: 68 },
  { day: 'Wed', rate: 74 },
  { day: 'Thu', rate: 78 },
  { day: 'Fri', rate: 82 },
  { day: 'Sat', rate: 88 },
]

export const courseReports: CourseReport[] = [
  { code: 'CSC 401', name: 'Software Engineering', rate: 84, sessions: 12, gpsRate: 92 },
  { code: 'CSC 405', name: 'Computer Networks', rate: 78, sessions: 10, gpsRate: 88 },
  { code: 'CSC 411', name: 'Artificial Intelligence', rate: 91, sessions: 8, gpsRate: 95 },
]

export const mockPastSessions: PastSession[] = [
  { id: '1', courseCode: 'CSC 401', courseName: 'Software Engineering', date: 'Wed, 19 Feb 2026', startTime: '10:30 AM', endTime: '10:42 AM', duration: '12 min', totalStudents: 45, presentCount: 38, absentCount: 7, venue: 'Room 301, CS Building' },
  { id: '2', courseCode: 'CSC 405', courseName: 'Computer Networks', date: 'Mon, 17 Feb 2026', startTime: '2:00 PM', endTime: '2:35 PM', duration: '35 min', totalStudents: 38, presentCount: 30, absentCount: 8, venue: 'Hall 2, Engineering Block' },
  { id: '3', courseCode: 'CSC 411', courseName: 'Artificial Intelligence', date: 'Fri, 14 Feb 2026', startTime: '9:00 AM', endTime: '9:28 AM', duration: '28 min', totalStudents: 52, presentCount: 48, absentCount: 4, venue: 'Lecture Theatre A' },
  { id: '4', courseCode: 'CSC 401', courseName: 'Software Engineering', date: 'Wed, 12 Feb 2026', startTime: '10:30 AM', endTime: '10:55 AM', duration: '25 min', totalStudents: 45, presentCount: 41, absentCount: 4, venue: 'Room 301, CS Building' },
  { id: '5', courseCode: 'CSC 405', courseName: 'Computer Networks', date: 'Mon, 10 Feb 2026', startTime: '2:00 PM', endTime: '2:45 PM', duration: '45 min', totalStudents: 38, presentCount: 28, absentCount: 10, venue: 'Hall 2, Engineering Block' },
  { id: '6', courseCode: 'CSC 411', courseName: 'Artificial Intelligence', date: 'Fri, 7 Feb 2026', startTime: '9:00 AM', endTime: '9:30 AM', duration: '30 min', totalStudents: 52, presentCount: 47, absentCount: 5, venue: 'Lecture Theatre A' },
  { id: '7', courseCode: 'CSC 401', courseName: 'Software Engineering', date: 'Wed, 5 Feb 2026', startTime: '10:30 AM', endTime: '11:00 AM', duration: '30 min', totalStudents: 45, presentCount: 36, absentCount: 9, venue: 'Room 301, CS Building' },
  { id: '8', courseCode: 'CSC 405', courseName: 'Computer Networks', date: 'Mon, 3 Feb 2026', startTime: '2:00 PM', endTime: '2:40 PM', duration: '40 min', totalStudents: 38, presentCount: 32, absentCount: 6, venue: 'Hall 2, Engineering Block' },
  { id: '9', courseCode: 'CSC 411', courseName: 'Artificial Intelligence', date: 'Fri, 31 Jan 2026', startTime: '9:00 AM', endTime: '9:25 AM', duration: '25 min', totalStudents: 52, presentCount: 50, absentCount: 2, venue: 'Lecture Theatre A' },
  { id: '10', courseCode: 'CSC 401', courseName: 'Software Engineering', date: 'Wed, 29 Jan 2026', startTime: '10:30 AM', endTime: '10:50 AM', duration: '20 min', totalStudents: 45, presentCount: 39, absentCount: 6, venue: 'Room 301, CS Building' },
  { id: '11', courseCode: 'CSC 405', courseName: 'Computer Networks', date: 'Mon, 27 Jan 2026', startTime: '2:00 PM', endTime: '2:30 PM', duration: '30 min', totalStudents: 38, presentCount: 34, absentCount: 4, venue: 'Hall 2, Engineering Block' },
  { id: '12', courseCode: 'CSC 411', courseName: 'Artificial Intelligence', date: 'Fri, 24 Jan 2026', startTime: '9:00 AM', endTime: '9:35 AM', duration: '35 min', totalStudents: 52, presentCount: 45, absentCount: 7, venue: 'Lecture Theatre A' },
  { id: '13', courseCode: 'CSC 401', courseName: 'Software Engineering', date: 'Wed, 22 Jan 2026', startTime: '10:30 AM', endTime: '11:05 AM', duration: '35 min', totalStudents: 45, presentCount: 40, absentCount: 5, venue: 'Room 301, CS Building' },
  { id: '14', courseCode: 'CSC 405', courseName: 'Computer Networks', date: 'Mon, 20 Jan 2026', startTime: '2:00 PM', endTime: '2:25 PM', duration: '25 min', totalStudents: 38, presentCount: 29, absentCount: 9, venue: 'Hall 2, Engineering Block' },
  { id: '15', courseCode: 'CSC 411', courseName: 'Artificial Intelligence', date: 'Fri, 17 Jan 2026', startTime: '9:00 AM', endTime: '9:20 AM', duration: '20 min', totalStudents: 52, presentCount: 49, absentCount: 3, venue: 'Lecture Theatre A' },
]
