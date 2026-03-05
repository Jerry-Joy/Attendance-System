import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Course, PastSession, EnrolledStudent, AttendingStudent, ActiveSession, LecturerPreferences } from '../types'
import {
  mockCourses as initialCourses,
  mockPastSessions as initialSessions,
  mockEnrolledStudents as initialEnrolled,
} from '../data/mockData'

const PREFS_KEY = 'smartattend_prefs'

function loadPrefs(): LecturerPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { qrAutoRefresh: true, gpsRequired: true, notifications: true }
}

interface DataState {
  /* Courses */
  courses: Course[]
  addCourse: (course: Course) => void
  updateCourse: (id: string, updates: Partial<Course>) => void
  deleteCourse: (id: string) => void

  /* Past sessions */
  pastSessions: PastSession[]
  addPastSession: (session: PastSession) => void

  /* Enrolled students per course */
  enrolledStudents: Record<string, EnrolledStudent[]>
  addStudent: (courseId: string, student: EnrolledStudent) => void
  removeStudent: (courseId: string, studentId: string) => void

  /* Active session (shared between ActiveSession & LiveMonitor) */
  activeSession: ActiveSession | null
  startActiveSession: (session: ActiveSession) => void
  addAttendee: (student: AttendingStudent) => void
  endActiveSession: () => void

  /* Lecturer preferences (persisted to localStorage) */
  preferences: LecturerPreferences
  updatePreferences: (updates: Partial<LecturerPreferences>) => void
}

const DataContext = createContext<DataState | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [pastSessions, setPastSessions] = useState<PastSession[]>(initialSessions)
  const [enrolledStudents, setEnrolledStudents] = useState<Record<string, EnrolledStudent[]>>(initialEnrolled)
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [preferences, setPreferences] = useState<LecturerPreferences>(loadPrefs)

  /* ── Courses ────────────────────────────────────────────── */
  const addCourse = (course: Course) => {
    setCourses((prev) => [course, ...prev])
    // Initialize empty enrolled list
    setEnrolledStudents((prev) => ({ ...prev, [course.id]: [] }))
  }

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  /* ── Past sessions ──────────────────────────────────────── */
  const addPastSession = (session: PastSession) => {
    setPastSessions((prev) => [session, ...prev])
  }

  /* ── Enrolled students ──────────────────────────────────── */
  const addStudent = (courseId: string, student: EnrolledStudent) => {
    setEnrolledStudents((prev) => ({
      ...prev,
      [courseId]: [...(prev[courseId] || []), student],
    }))
  }

  const removeStudent = (courseId: string, studentId: string) => {
    setEnrolledStudents((prev) => ({
      ...prev,
      [courseId]: (prev[courseId] || []).filter((s) => s.id !== studentId),
    }))
  }

  /* ── Active session ─────────────────────────────────────── */
  const startActiveSession = useCallback((session: ActiveSession) => {
    setActiveSession(session)
  }, [])

  const addAttendee = useCallback((student: AttendingStudent) => {
    setActiveSession((prev) => {
      if (!prev) return prev
      // Avoid duplicates
      if (prev.attendees.find((a) => a.id === student.id)) return prev
      return { ...prev, attendees: [...prev.attendees, student] }
    })
  }, [])

  const endActiveSession = useCallback(() => {
    setActiveSession(null)
  }, [])

  /* ── Preferences ────────────────────────────────────────── */
  const updatePreferences = (updates: Partial<LecturerPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <DataContext.Provider
      value={{
        courses, addCourse, updateCourse, deleteCourse,
        pastSessions, addPastSession,
        enrolledStudents, addStudent, removeStudent,
        activeSession, startActiveSession, addAttendee, endActiveSession,
        preferences, updatePreferences,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
