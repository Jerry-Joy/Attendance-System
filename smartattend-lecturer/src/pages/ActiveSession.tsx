import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  Monitor,
  Square,
  Users,
  MapPin,
  Clock,
  RefreshCw,
  Shield,
  Wifi,
  BookOpen,
  Target,
  Timer,
  AlertTriangle,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react'
import { mockEnrolledStudents } from '../data/mockData'
import { useData } from '../context/DataContext'
import type { AttendingStudent } from '../types'

/* ── Helpers ──────────────────────────────────────────────────── */

/** Generate a structured QR payload the student app can parse */
function generateQrPayload(opts: {
  courseId: string
  courseCode: string
  latitude?: number
  longitude?: number
  radius: number
}) {
  const token = `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  return JSON.stringify({
    token,
    courseId: opts.courseId,
    courseCode: opts.courseCode,
    lat: opts.latitude ?? null,
    lng: opts.longitude ?? null,
    radius: opts.radius,
    exp: Date.now() + 30_000, // expires in 30s
  })
}

function formatElapsed(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const secs = (totalSeconds % 60).toString().padStart(2, '0')
  return hrs > 0 ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`
}

function formatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) return '00:00'
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')
  const secs = (totalSeconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

/** QR token lifetime in seconds */
const QR_LIFETIME = 30

export default function ActiveSession() {
  const navigate = useNavigate()
  const location = useLocation()
  const { courses, activeSession, startActiveSession, addAttendee, endActiveSession, addPastSession, enrolledStudents } = useData()
  const state = location.state as {
    courseId: string
    radius: number
    duration: string
    latitude?: number
    longitude?: number
  } | null

  /* If no state and no active session, redirect to dashboard */
  const course = courses.find((c) => c.id === (activeSession?.courseId ?? state?.courseId)) || null
  const radius = activeSession?.radius ?? state?.radius ?? 50

  /* Bootstrap the shared active session on first mount */
  useEffect(() => {
    if (!activeSession && state && course) {
      startActiveSession({
        courseId: course.id,
        courseCode: course!.code,
        courseName: course!.name,
        radius: state.radius,
        duration: state.duration,
        latitude: state.latitude,
        longitude: state.longitude,
        startedAt: Date.now(),
        attendees: [],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Redirect if there's truly nothing to show */
  useEffect(() => {
    if (!activeSession && !state) {
      navigate('/courses', { replace: true })
    }
  }, [activeSession, state, navigate])

  /* Parse session duration to seconds (e.g. "30 min" → 1800) */
  const sessionDurationSec = useMemo(() => {
    const raw = activeSession?.duration ?? state?.duration ?? '30 min'
    const num = parseInt(raw, 10)
    if (raw.includes('hour') || raw.includes('h')) return num * 3600
    return num * 60
  }, [activeSession?.duration, state?.duration])

  /* Build the pool of students to simulate from — use enrolled for THIS course */
  const simulationPool = useMemo<AttendingStudent[]>(() => {
    const courseId = activeSession?.courseId ?? state?.courseId ?? ''
    const enrolled = enrolledStudents[courseId] || mockEnrolledStudents[courseId] || mockEnrolledStudents['1'] || []
    return enrolled.map((s) => ({
      id: s.id,
      name: s.name,
      indexNumber: s.indexNumber,
      time: '',
      gpsVerified: Math.random() > 0.15, // ~85% GPS verified
      avatarInitials: s.avatarInitials,
    }))
  }, [activeSession?.courseId, state?.courseId, enrolledStudents])

  // ── Core timers ────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0)
  const [qrSecondsLeft, setQrSecondsLeft] = useState(QR_LIFETIME)
  const [qrPayload, setQrPayload] = useState(() =>
    generateQrPayload({
      courseId: state?.courseId ?? '',
      courseCode: course?.code ?? '',
      latitude: state?.latitude,
      longitude: state?.longitude,
      radius: radius,
    })
  )
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [qrFullscreen, setQrFullscreen] = useState(false)

  const studentCount = activeSession?.attendees.length ?? 0
  const totalStudents = course?.studentCount ?? 0
  const sessionTimeLeft = Math.max(0, sessionDurationSec - elapsed)
  const sessionExpired = sessionTimeLeft <= 0
  const qrExpired = qrSecondsLeft <= 0

  /* ── 1-second tick: updates elapsed, session countdown, QR countdown ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)

      setQrSecondsLeft((prev) => {
        const next = prev - 1
        if (next <= 0) {
          // Regenerate structured QR payload
          setQrPayload(generateQrPayload({
            courseId: activeSession?.courseId ?? state?.courseId ?? '',
            courseCode: course?.code ?? '',
            latitude: activeSession?.latitude ?? state?.latitude,
            longitude: activeSession?.longitude ?? state?.longitude,
            radius,
          }))
          return QR_LIFETIME
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [activeSession, state, course, radius])

  /* ── Simulate students joining progressively (using enrolled pool) ── */
  const [nextSimIdx, setNextSimIdx] = useState(0)
  useEffect(() => {
    if (nextSimIdx >= simulationPool.length) return
    const timer = setTimeout(() => {
      const student = simulationPool[nextSimIdx]
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      addAttendee({ ...student, time: timeStr })
      setNextSimIdx((prev) => prev + 1)
    }, 2500 + Math.random() * 1500)
    return () => clearTimeout(timer)
  }, [nextSimIdx, simulationPool, addAttendee])

  /* ── Auto-end when session expires ── */
  useEffect(() => {
    if (sessionExpired) {
      // Keep the page visible so lecturer can review; don't auto-navigate
    }
  }, [sessionExpired])

  const handleEndSession = useCallback(() => {
    const now = new Date()
    const startTime = new Date(now.getTime() - elapsed * 1000)
    const fmt = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const durationMin = Math.round(elapsed / 60)

    const attendees = activeSession?.attendees ?? []
    const gpsCount = attendees.filter((s) => s.gpsVerified).length
    const qrOnlyCount = attendees.length - gpsCount

    const sessionData = {
      courseCode: course?.code ?? '',
      courseName: course?.name ?? '',
      date: now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      startTime: fmt(startTime),
      endTime: fmt(now),
      duration: `${durationMin} min`,
      totalStudents: totalStudents,
      presentCount: attendees.length,
      absentCount: totalStudents - attendees.length,
      qrGpsVerified: gpsCount,
      qrOnlyVerified: qrOnlyCount,
      geofenceRadius: radius,
      venueName: course?.venueName || 'Unknown',
    }

    // Save to DataContext as a past session
    addPastSession({
      id: `session-${Date.now()}`,
      courseCode: sessionData.courseCode,
      courseName: sessionData.courseName,
      date: sessionData.date,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      duration: sessionData.duration,
      totalStudents: sessionData.totalStudents,
      presentCount: sessionData.presentCount,
      absentCount: sessionData.absentCount,
      venue: sessionData.venueName,
      qrGpsVerified: gpsCount,
      qrOnlyVerified: qrOnlyCount,
      geofenceRadius: radius,
      attendees: [...attendees],
    })

    // Clear the active session
    endActiveSession()

    navigate('/session-summary', {
      state: {
        session: sessionData,
        attendees: [...attendees],
      },
    })
  }, [navigate, elapsed, activeSession, course, radius, totalStudents, addPastSession, endActiveSession])

  /* ── Countdown ring for QR timer ── */
  const circleRadius = 54
  const circumference = 2 * Math.PI * circleRadius
  const qrProgress = qrSecondsLeft / QR_LIFETIME
  const strokeDashoffset = circumference * (1 - qrProgress)

  /* Countdown colour logic */
  const countdownColor =
    sessionExpired
      ? 'text-red-500'
      : sessionTimeLeft <= 60
        ? 'text-red-500'
        : sessionTimeLeft <= 300
          ? 'text-amber-500'
          : 'text-brand-600'

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto animate-slide-up">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            {sessionExpired ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-600 uppercase">Session Ended</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-600 uppercase">Live Session</span>
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-800 mt-2">{course?.name}</h1>
          <p className="text-sm text-slate-500">{course?.code}</p>
        </div>

        {/* Elapsed + remaining */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-lg font-bold text-slate-800 font-mono">{formatElapsed(elapsed)}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${sessionExpired ? 'bg-red-50' : 'bg-brand-50'
            }`}>
            <Timer className={`w-4 h-4 ${countdownColor}`} />
            <span className={`text-lg font-bold font-mono ${countdownColor}`}>
              {sessionExpired ? 'Expired' : formatCountdown(sessionTimeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Session Metadata Bar ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Course</span>
          </div>
          <p className="text-sm font-bold text-slate-800 truncate">{course?.code}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Radius</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{radius}m</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Duration</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{state?.duration || '30 min'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Venue</span>
          </div>
          <p className="text-sm font-bold text-slate-800 truncate">{course?.venueName || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── QR Code Section (large & centered) ──────────────── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {sessionExpired ? 'Session Has Ended' : 'Scan QR Code to Mark Attendance'}
              </h3>
              {!sessionExpired && (
                <button
                  onClick={() => setQrFullscreen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                  title="Fullscreen QR"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Fullscreen
                </button>
              )}
            </div>

            {/* QR Code — large, centered, with expiry overlay */}
            <div className="relative mb-6">
              <div className={`p-8 bg-white rounded-2xl border-2 transition-all duration-500 ${qrExpired || sessionExpired
                ? 'border-slate-300 opacity-30 grayscale'
                : qrSecondsLeft <= 5
                  ? 'border-red-200 shadow-lg shadow-red-100'
                  : 'border-slate-100 shadow-inner'
                }`}>
                <QRCodeSVG
                  value={qrPayload}
                  size={260}
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor="#059669"
                  includeMargin={false}
                />
              </div>

              {/* Expired overlay */}
              {sessionExpired && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl">
                  <div className="text-center">
                    <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-red-600">QR Disabled</p>
                    <p className="text-xs text-slate-500">Session time has expired</p>
                  </div>
                </div>
              )}
            </div>

            {/* Circular countdown timer */}
            {!sessionExpired && (
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-28 h-28 mb-3">
                  {/* Background circle */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={circleRadius}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="6"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={circleRadius}
                      fill="none"
                      stroke={qrSecondsLeft <= 5 ? '#ef4444' : '#059669'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold font-mono ${qrSecondsLeft <= 5 ? 'text-red-500' : 'text-brand-600'
                      }`}>
                      {qrSecondsLeft}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">seconds</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${qrSecondsLeft <= 5 ? 'animate-spin' : ''}`} />
                  <span className="text-xs text-slate-500">
                    QR auto-refreshes every {QR_LIFETIME}s
                  </span>
                </div>
              </div>
            )}

            {/* QR Token ID */}
            <div className="px-4 py-2 bg-slate-50 rounded-lg">
              <span className="text-[11px] text-slate-400 font-mono">{JSON.parse(qrPayload).token}</span>
            </div>
          </div>
        </div>

        {/* ── Stats Panel ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Student Count */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-500">Students Present</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-brand-600">{studentCount}</span>
              <span className="text-lg text-slate-400">/ {totalStudents}</span>
            </div>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                style={{ width: `${totalStudents > 0 ? (studentCount / totalStudents) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {totalStudents > 0 ? Math.round((studentCount / totalStudents) * 100) : 0}% attendance so far
            </p>
          </div>

          {/* GPS Geofence */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-500">GPS Geofence</h3>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                {!sessionExpired && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-pulse-ring" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  {sessionExpired ? 'Inactive' : 'Active'}
                </p>
                <p className="text-xs text-emerald-600">{radius}m radius · {course?.venueName}</p>
              </div>
            </div>
            {state?.latitude != null && state?.longitude != null && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">Lat</p>
                  <p className="text-xs font-mono font-bold text-slate-700">{state.latitude.toFixed(6)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">Lng</p>
                  <p className="text-xs font-mono font-bold text-slate-700">{state.longitude.toFixed(6)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Verification Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-500">Verification</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">QR + GPS Verified</span>
                <span className="font-bold text-emerald-600">
                  {(activeSession?.attendees ?? []).filter(s => s.gpsVerified).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">QR Only</span>
                <span className="font-bold text-amber-600">{(activeSession?.attendees ?? []).filter(s => !s.gpsVerified).length}</span>
              </div>
            </div>
          </div>

          {/* Session countdown card */}
          <div className={`rounded-2xl border p-5 ${sessionExpired
            ? 'bg-red-50 border-red-200'
            : sessionTimeLeft <= 300
              ? 'bg-amber-50 border-amber-200'
              : 'bg-brand-50 border-brand-200'
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <Timer className={`w-4 h-4 ${countdownColor}`} />
              <h3 className={`text-sm font-semibold ${countdownColor}`}>Session Time Remaining</h3>
            </div>
            <p className={`text-3xl font-bold font-mono ${countdownColor}`}>
              {sessionExpired ? '00:00' : formatCountdown(sessionTimeLeft)}
            </p>
            {sessionExpired && (
              <p className="text-xs text-red-500 mt-1">QR code has been disabled</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Action Buttons ────────────────────────────────────── */}
      <div className="flex gap-3 mt-6">
        {!sessionExpired && (
          <button
            onClick={() => navigate('/live-monitor')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-700 rounded-xl font-semibold text-sm transition-all"
          >
            <Monitor className="w-4 h-4" />
            Live Monitor
          </button>
        )}
        <button
          onClick={() => setShowEndConfirm(true)}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${sessionExpired
            ? 'flex-1 bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25'
            : 'flex-1 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
            }`}
        >
          <Square className="w-4 h-4" />
          {sessionExpired ? 'View Summary' : 'End Session'}
        </button>
      </div>

      {/* ── Fullscreen QR Modal ───────────────────────────────── */}
      {qrFullscreen && !sessionExpired && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setQrFullscreen(false)}
            className="absolute top-5 right-5 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors z-10"
            title="Exit fullscreen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Minimize hint */}
          <button
            onClick={() => setQrFullscreen(false)}
            className="absolute top-5 left-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors z-10"
          >
            <Minimize2 className="w-4 h-4" />
            Exit Fullscreen
          </button>

          {/* Course info */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-600 uppercase">Live</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">{course?.code} — {course?.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{course?.venueName}</p>
          </div>

          {/* Large QR */}
          <div className="p-10 bg-white rounded-3xl border-2 border-slate-100 shadow-2xl shadow-slate-200/50 mb-6">
            <QRCodeSVG
              value={qrPayload}
              size={Math.min(400, window.innerWidth - 120)}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#059669"
              includeMargin={false}
            />
          </div>

          {/* Countdown + token */}
          <div className="flex items-center gap-6">
            {/* Mini circular timer */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={circleRadius} fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle
                  cx="60" cy="60" r={circleRadius} fill="none"
                  stroke={qrSecondsLeft <= 5 ? '#ef4444' : '#059669'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold font-mono ${qrSecondsLeft <= 5 ? 'text-red-500' : 'text-brand-600'}`}>
                  {qrSecondsLeft}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Token</p>
              <p className="text-sm font-mono text-slate-500 bg-slate-50 px-4 py-1.5 rounded-lg">{JSON.parse(qrPayload).token}</p>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Session ends in</p>
              <p className={`text-lg font-bold font-mono ${countdownColor}`}>
                {formatCountdown(sessionTimeLeft)}
              </p>
            </div>
          </div>

          {/* Student count */}
          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-xl">
            <Users className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-brand-700">{studentCount} students present</span>
          </div>
        </div>
      )}

      {/* ── End Confirm Modal ─────────────────────────────────── */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {sessionExpired ? 'Session Complete' : 'End Session?'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {sessionExpired
                ? `Session for ${course?.code} has ended. ${studentCount} students marked present.`
                : `This will end the attendance session for ${course?.code}. ${studentCount} students have been marked present.`}
            </p>
            <div className="flex gap-3">
              {!sessionExpired && (
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleEndSession}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${sessionExpired
                  ? 'bg-brand-500 hover:bg-brand-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
              >
                {sessionExpired ? 'View Summary' : 'End Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
