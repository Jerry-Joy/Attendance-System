export type User = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  avatarInitials: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  studentCount: number;
  attendanceRate?: number;
};

export type LiveSession = {
  sessionId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  venue: string;
  startedAt: string;
  duration: number;
  alreadyMarked: boolean;
};

export type HistoryRecord = {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  status: 'present' | 'absent';
  method: 'QR+GPS' | null;
  lecturer: string;
};

export type ScannerPayload = {
  token: string;
  courseId: string;
  courseCode: string;
  lat: number | null;
  lng: number | null;
  lecturerAccuracy: number | null;
  radius: number;
};
