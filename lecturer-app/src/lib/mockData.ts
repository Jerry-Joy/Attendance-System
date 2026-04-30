import type { Lecturer, Course, EnrolledStudent, AttendingStudent, PastSession, WeeklyData, CourseReport } from '../types';

export const mockLecturer: Lecturer = {
  id: '1',
  name: 'Dr. Julian Vance',
  title: 'Senior Lecturer',
  department: 'Computer Science Dept.',
  avatarInitials: 'JV',
  email: 'j.vance@university.edu',
};

export const mockCourses: Course[] = [
  {
    id: 'cs101',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    level: 'Level 100',
    studentCount: 120,
    lastSession: 'Mon, 20 Oct',
    groups: ['Group A', 'Group B', 'All'],
    joinCode: 'CS101-X7K9',
    venueLocation: { latitude: 5.6037, longitude: -0.1870 },
    venueName: 'Building A, Room 101',
    schedule: 'Mon, Wed 10:00 AM',
    attendanceRate: 92,
  },
  {
    id: 'cs302',
    code: 'CS302',
    name: 'Data Structures and Algorithms',
    level: 'Level 300',
    studentCount: 85,
    lastSession: 'Tue, 21 Oct',
    groups: ['Group A', 'All'],
    joinCode: 'CS302-MP2Q',
    venueLocation: { latitude: 5.6040, longitude: -0.1875 },
    venueName: 'Building B, Room 205',
    schedule: 'Tue, Thu 2:00 PM',
    attendanceRate: 88,
  },
  {
    id: 'cs440',
    code: 'CS440',
    name: 'Artificial Intelligence',
    level: 'Level 400',
    studentCount: 60,
    lastSession: 'Fri, 17 Oct',
    groups: ['All'],
    joinCode: 'CS440-BN7W',
    venueLocation: { latitude: 5.6045, longitude: -0.1865 },
    venueName: 'Building A, Room 310',
    schedule: 'Fri 9:00 AM',
    attendanceRate: 95,
  },
];

export const mockEnrolledStudents: Record<string, EnrolledStudent[]> = {
  'cs101': [
    { id: '1', name: 'Alice Smith', indexNumber: 'CS/2024/001', level: 'Level 100', joinedDate: 'Sep 5, 2026', avatarInitials: 'AS', attendanceRate: 95 },
    { id: '2', name: 'Bob Jones', indexNumber: 'CS/2024/015', level: 'Level 100', joinedDate: 'Sep 5, 2026', avatarInitials: 'BJ', attendanceRate: 88 },
    { id: '3', name: 'Charlie Brown', indexNumber: 'CS/2024/023', level: 'Level 100', joinedDate: 'Sep 6, 2026', avatarInitials: 'CB', attendanceRate: 92 },
    { id: '4', name: 'Diana Ross', indexNumber: 'CS/2024/008', level: 'Level 100', joinedDate: 'Sep 6, 2026', avatarInitials: 'DR', attendanceRate: 78 },
    { id: '5', name: 'Ethan Cole', indexNumber: 'CS/2024/042', level: 'Level 100', joinedDate: 'Sep 7, 2026', avatarInitials: 'EC', attendanceRate: 85 },
    { id: '6', name: 'Fiona Grant', indexNumber: 'CS/2024/019', level: 'Level 100', joinedDate: 'Sep 7, 2026', avatarInitials: 'FG', attendanceRate: 91 },
    { id: '7', name: 'George Kim', indexNumber: 'CS/2024/031', level: 'Level 100', joinedDate: 'Sep 8, 2026', avatarInitials: 'GK', attendanceRate: 72 },
    { id: '8', name: 'Hannah Lee', indexNumber: 'CS/2024/011', level: 'Level 100', joinedDate: 'Sep 8, 2026', avatarInitials: 'HL', attendanceRate: 97 },
  ],
  'cs302': [
    { id: '1', name: 'Alice Smith', indexNumber: 'CS/2024/001', level: 'Level 300', joinedDate: 'Sep 5, 2026', avatarInitials: 'AS', attendanceRate: 90 },
    { id: '3', name: 'Charlie Brown', indexNumber: 'CS/2024/023', level: 'Level 300', joinedDate: 'Sep 6, 2026', avatarInitials: 'CB', attendanceRate: 85 },
    { id: '5', name: 'Ethan Cole', indexNumber: 'CS/2024/042', level: 'Level 300', joinedDate: 'Sep 7, 2026', avatarInitials: 'EC', attendanceRate: 80 },
  ],
  'cs440': [
    { id: '1', name: 'Alice Smith', indexNumber: 'CS/2024/001', level: 'Level 400', joinedDate: 'Sep 5, 2026', avatarInitials: 'AS', attendanceRate: 93 },
    { id: '2', name: 'Bob Jones', indexNumber: 'CS/2024/015', level: 'Level 400', joinedDate: 'Sep 5, 2026', avatarInitials: 'BJ', attendanceRate: 88 },
    { id: '4', name: 'Diana Ross', indexNumber: 'CS/2024/008', level: 'Level 400', joinedDate: 'Sep 6, 2026', avatarInitials: 'DR', attendanceRate: 82 },
    { id: '6', name: 'Fiona Grant', indexNumber: 'CS/2024/019', level: 'Level 400', joinedDate: 'Sep 7, 2026', avatarInitials: 'FG', attendanceRate: 95 },
  ],
};

export const mockAttendingStudents: AttendingStudent[] = [
  { id: '1', name: 'Alice Smith', indexNumber: 'CS/2024/001', time: '10:32 AM', gpsVerified: true, avatarInitials: 'AS' },
  { id: '2', name: 'Bob Jones', indexNumber: 'CS/2024/015', time: '10:33 AM', gpsVerified: true, avatarInitials: 'BJ' },
  { id: '3', name: 'Charlie Brown', indexNumber: 'CS/2024/023', time: '10:33 AM', gpsVerified: true, avatarInitials: 'CB' },
  { id: '4', name: 'Diana Ross', indexNumber: 'CS/2024/008', time: '10:34 AM', gpsVerified: true, avatarInitials: 'DR' },
  { id: '5', name: 'Ethan Cole', indexNumber: 'CS/2024/042', time: '10:34 AM', gpsVerified: false, avatarInitials: 'EC' },
  { id: '6', name: 'Fiona Grant', indexNumber: 'CS/2024/019', time: '10:35 AM', gpsVerified: true, avatarInitials: 'FG' },
  { id: '7', name: 'George Kim', indexNumber: 'CS/2024/031', time: '10:35 AM', gpsVerified: true, avatarInitials: 'GK' },
  { id: '8', name: 'Hannah Lee', indexNumber: 'CS/2024/011', time: '10:36 AM', gpsVerified: true, avatarInitials: 'HL' },
  { id: '9', name: 'Isaac Park', indexNumber: 'CS/2024/027', time: '10:36 AM', gpsVerified: true, avatarInitials: 'IP' },
  { id: '10', name: 'Julia Chen', indexNumber: 'CS/2024/004', time: '10:37 AM', gpsVerified: true, avatarInitials: 'JC' },
  { id: '11', name: 'Kevin Osei', indexNumber: 'CS/2024/038', time: '10:37 AM', gpsVerified: true, avatarInitials: 'KO' },
  { id: '12', name: 'Linda Mensah', indexNumber: 'CS/2024/022', time: '10:38 AM', gpsVerified: true, avatarInitials: 'LM' },
];

export const mockPastSessions: PastSession[] = [
  { id: '1', courseCode: 'CS101', courseName: 'Introduction to Computer Science', date: 'Mon, 20 Oct 2026', startTime: '10:00 AM', endTime: '10:25 AM', duration: '25 min', totalStudents: 120, presentCount: 110, absentCount: 10, venue: 'Building A, Room 101', qrGpsVerified: 108, geofenceRadius: 50 },
  { id: '2', courseCode: 'CS302', courseName: 'Data Structures and Algorithms', date: 'Tue, 21 Oct 2026', startTime: '2:00 PM', endTime: '2:35 PM', duration: '35 min', totalStudents: 85, presentCount: 80, absentCount: 5, venue: 'Building B, Room 205', qrGpsVerified: 78, geofenceRadius: 50 },
  { id: '3', courseCode: 'CS440', courseName: 'Artificial Intelligence', date: 'Fri, 17 Oct 2026', startTime: '9:00 AM', endTime: '9:28 AM', duration: '28 min', totalStudents: 60, presentCount: 58, absentCount: 2, venue: 'Building A, Room 310', qrGpsVerified: 58, geofenceRadius: 50 },
  { id: '4', courseCode: 'CS101', courseName: 'Introduction to Computer Science', date: 'Wed, 15 Oct 2026', startTime: '10:00 AM', endTime: '10:30 AM', duration: '30 min', totalStudents: 120, presentCount: 115, absentCount: 5, venue: 'Building A, Room 101', qrGpsVerified: 113, geofenceRadius: 50 },
  { id: '5', courseCode: 'CS302', courseName: 'Data Structures and Algorithms', date: 'Thu, 16 Oct 2026', startTime: '2:00 PM', endTime: '2:45 PM', duration: '45 min', totalStudents: 85, presentCount: 72, absentCount: 13, venue: 'Building B, Room 205', qrGpsVerified: 70, geofenceRadius: 50 },
  { id: '6', courseCode: 'CS440', courseName: 'Artificial Intelligence', date: 'Fri, 10 Oct 2026', startTime: '9:00 AM', endTime: '9:30 AM', duration: '30 min', totalStudents: 60, presentCount: 57, absentCount: 3, venue: 'Building A, Room 310', qrGpsVerified: 57, geofenceRadius: 50 },
  { id: '7', courseCode: 'CS101', courseName: 'Introduction to Computer Science', date: 'Mon, 13 Oct 2026', startTime: '10:00 AM', endTime: '10:35 AM', duration: '35 min', totalStudents: 120, presentCount: 105, absentCount: 15, venue: 'Building A, Room 101', qrGpsVerified: 103, geofenceRadius: 50 },
  { id: '8', courseCode: 'CS302', courseName: 'Data Structures and Algorithms', date: 'Tue, 14 Oct 2026', startTime: '2:00 PM', endTime: '2:40 PM', duration: '40 min', totalStudents: 85, presentCount: 78, absentCount: 7, venue: 'Building B, Room 205', qrGpsVerified: 76, geofenceRadius: 50 },
  { id: '9', courseCode: 'CS440', courseName: 'Artificial Intelligence', date: 'Fri, 3 Oct 2026', startTime: '9:00 AM', endTime: '9:25 AM', duration: '25 min', totalStudents: 60, presentCount: 59, absentCount: 1, venue: 'Building A, Room 310', qrGpsVerified: 59, geofenceRadius: 50 },
  { id: '10', courseCode: 'CS101', courseName: 'Introduction to Computer Science', date: 'Wed, 8 Oct 2026', startTime: '10:00 AM', endTime: '10:20 AM', duration: '20 min', totalStudents: 120, presentCount: 112, absentCount: 8, venue: 'Building A, Room 101', qrGpsVerified: 110, geofenceRadius: 50 },
  { id: '11', courseCode: 'CS302', courseName: 'Data Structures and Algorithms', date: 'Thu, 9 Oct 2026', startTime: '2:00 PM', endTime: '2:30 PM', duration: '30 min', totalStudents: 85, presentCount: 82, absentCount: 3, venue: 'Building B, Room 205', qrGpsVerified: 80, geofenceRadius: 50 },
  { id: '12', courseCode: 'CS440', courseName: 'Artificial Intelligence', date: 'Fri, 26 Sep 2026', startTime: '9:00 AM', endTime: '9:35 AM', duration: '35 min', totalStudents: 60, presentCount: 55, absentCount: 5, venue: 'Building A, Room 310', qrGpsVerified: 54, geofenceRadius: 50 },
  { id: '13', courseCode: 'CS101', courseName: 'Introduction to Computer Science', date: 'Mon, 6 Oct 2026', startTime: '10:00 AM', endTime: '10:40 AM', duration: '40 min', totalStudents: 120, presentCount: 108, absentCount: 12, venue: 'Building A, Room 101', qrGpsVerified: 106, geofenceRadius: 50 },
  { id: '14', courseCode: 'CS302', courseName: 'Data Structures and Algorithms', date: 'Tue, 7 Oct 2026', startTime: '2:00 PM', endTime: '2:25 PM', duration: '25 min', totalStudents: 85, presentCount: 75, absentCount: 10, venue: 'Building B, Room 205', qrGpsVerified: 73, geofenceRadius: 50 },
  { id: '15', courseCode: 'CS440', courseName: 'Artificial Intelligence', date: 'Fri, 19 Sep 2026', startTime: '9:00 AM', endTime: '9:20 AM', duration: '20 min', totalStudents: 60, presentCount: 58, absentCount: 2, venue: 'Building A, Room 310', qrGpsVerified: 58, geofenceRadius: 50 },
];

export const weeklyData: WeeklyData[] = [
  { day: 'Mon', rate: 85 },
  { day: 'Tue', rate: 88 },
  { day: 'Wed', rate: 92 },
  { day: 'Thu', rate: 90 },
  { day: 'Fri', rate: 95 },
  { day: 'Sat', rate: 91 },
];

export const courseReports: CourseReport[] = [
  { code: 'CS101', name: 'Introduction to Computer Science', rate: 92, sessions: 12, gpsRate: 96 },
  { code: 'CS302', name: 'Data Structures and Algorithms', rate: 88, sessions: 10, gpsRate: 94 },
  { code: 'CS440', name: 'Artificial Intelligence', rate: 95, sessions: 8, gpsRate: 98 },
];

export const courseAttendanceStats = [
  { name: 'Mon 13', rate: 85 },
  { name: 'Wed 15', rate: 88 },
  { name: 'Mon 20', rate: 92 },
  { name: 'Wed 22', rate: 90 },
  { name: 'Mon 27', rate: 95 },
  { name: 'Wed 29', rate: 91 },
  { name: 'Mon 03', rate: 96 },
];

export const mockLedgerRecords = [
  { txnHash: '0x8f2d...4a1c', timestamp: '2026-10-27T10:05:22Z', courseId: 'cs101', studentId: 'u_7890', studentName: 'Alice Smith', status: 'VERIFIED', blockNumber: 14930211 },
  { txnHash: '0x3a1b...9c8d', timestamp: '2026-10-27T10:06:15Z', courseId: 'cs101', studentId: 'u_1234', studentName: 'Bob Jones', status: 'VERIFIED', blockNumber: 14930212 },
  { txnHash: '0x5e4f...2b3a', timestamp: '2026-10-27T10:07:44Z', courseId: 'cs101', studentId: 'u_5678', studentName: 'Charlie Brown', status: 'VERIFIED', blockNumber: 14930213 },
];

export const pieChartData = [
  { name: 'Present', value: 85, color: '#10b981' },
  { name: 'Absent', value: 10, color: '#ef4444' },
  { name: 'Late', value: 5, color: '#f59e0b' },
];
