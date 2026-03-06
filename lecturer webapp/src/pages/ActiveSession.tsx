import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { io, type Socket } from 'socket.io-client'
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
import { useData } from '../context/DataContext'
import { api, getToken, mapAttendance } from '../lib/api'

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
  const { courses, activeSession, startActiveSession, addAttendee, endActiveSession, addPastSession } = useData()
  const socketRef = useRef<Socket | null>(null)
  const state = location.state as {
    sessionId: string
    courseId: string
    radius: number
    duration: string
    latitude?: number
    longitude?: number
    qrToken: string
  } | null

  /* If no state and no active session, redirect to dashboard */
  const course = courses.find((c) => c.id === (activeSession?.courseId ?? state?.courseId)) || null
  const radius = activeSession?.radius ?? state?.radius ?? 50
  const sessionId = state?.sessionId ?? ''

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

  // ── Core timers ────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0)
  const [qrSecondsLeft, setQrSecondsLeft] = useState(QR_LIFETIME)
  const [currentQrToken, setCurrentQrToken] = useState(state?.qrToken ?? '')
  const qrPayload = useMemo(() => JSON.stringify({
    token: currentQrToken,
    courseId: state?.courseId ?? '',
    courseCode: course?.code ?? '',
    lat: state?.latitude ?? null,
    lng: state?.longitude ?? null,
    radius: radius,
    exp: Date.now() + QR_LIFETIME * 1000,
  }), [currentQrToken, state, course, radius])
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
          // Refresh QR token from server
          if (sessionId) {
            api.refreshQr(sessionId)
              .then(({ qrToken }) => {
                setCurrentQrToken(qrToken)
              })
              .catch(() => { /* ignore */ })
          }
          return QR_LIFETIME
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionId])

  /* ── WebSocket: listen for real-time attendance events ── */
  useEffect(() => {
    if (!sessionId) return
    const token = getToken()
    if (!token) return

    const socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('session:join', { sessionId })
    })

    socket.on('attendance:new', (data) => {
      const attendee = mapAttendance(data)
      addAttendee(attendee)
    })

    socket.on('session:qr-refreshed', (data: { token: string }) => {
      setCurrentQrToken(data.token)
      setQrSecondsLeft(QR_LIFETIME)
    })

    return () => {
      socket.emit('session:leave', { sessionId })
      socket.disconnect()
      socketRef.current = null
    }
  }, [sessionId, addAttendee])

  /* ── Auto-end when session expires ── */
  useEffect(() => {
    if (sessionExpired) {
      // Keep the page visible so lecturer can review; don't auto-navigate
    }
  }, [sessionExpired])

  const handleEndSession = useCallback(async () => {
    // End session on server
    if (sessionId) {
      try { await api.endSession(sessionId) } catch { /* ignore */ }
    }

    // Disconnect WebSocket
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const now = new Date()
    const startTime = new Date(now.getTime() - elapsed * 1000)
    const fmt = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const durationMin = Math.round(elapsed / 60)

    const attendees = activeSession?.attendees ?? []
    const gpsCount = attendees.filter((s) => s.gpsVerified).length

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
  }, [navigate, elapsed, activeSession, course, radius, totalStudents, addPastSession, endActiveSession, sessionId])

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
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Session Ended</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-600 uppercase">Live Session</span>
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white mt-2">{course?.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{course?.code}</p>
        </div>

        {/* Elapsed + remaining */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-lg font-bold text-slate-800 dark:text-white font-mono">{formatElapsed(elapsed)}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${sessionExpired ? 'bg-red-50 dark:bg-red-500/10' : 'bg-brand-50 dark:bg-brand-500/10'
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Course</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{course?.code}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Radius</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">{radius}m</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Duration</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">{state?.duration || '30 min'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Venue</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{course?.venueName || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── QR Code Section (large & centered) ──────────────── */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-6">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {sessionExpired ? 'Session Has Ended' : 'Scan QR Code to Mark Attendance'}
              </h3>
              {!sessionExpired && (
                <button
                  onClick={() => setQrFullscreen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
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
                ? 'border-slate-300 dark:border-slate-600 opacity-30 grayscale'
                : qrSecondsLeft <= 5
                  ? 'border-red-200 dark:border-red-500/30 shadow-lg shadow-red-100 dark:shadow-red-500/10'
                  : 'border-slate-100 dark:border-slate-600 shadow-inner'
                }`}>
                <QRCodeSVG
                  value={qrPayload}
                  size={260}
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor="#4F46E5"
                  includeMargin={false}
                />
              </div>

              {/* Expired overlay */}
              {sessionExpired && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 rounded-2xl">
                  <div className="text-center">
                    <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-red-600">QR Disabled</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Session time has expired</p>
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
                      stroke={qrSecondsLeft <= 5 ? '#ef4444' : '#4F46E5'}
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
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">seconds</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${qrSecondsLeft <= 5 ? 'animate-spin' : ''}`} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    QR auto-refreshes every {QR_LIFETIME}s
                  </span>
                </div>
              </div>
            )}

            {/* QR Token ID */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{currentQrToken}</span>
            </div>
          </div>
        </div>

        {/* ── Stats Panel ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Student Count */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Students Present</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-brand-600 dark:text-brand-400">{studentCount}</span>
              <span className="text-lg text-slate-400 dark:text-slate-500">/ {totalStudents}</span>
            </div>
            <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                style={{ width: `${totalStudents > 0 ? (studentCount / totalStudents) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {totalStudents > 0 ? Math.round((studentCount / totalStudents) * 100) : 0}% attendance so far
            </p>
          </div>

          {/* GPS Geofence */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">GPS Geofence</h3>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                {!sessionExpired && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-pulse-ring" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {sessionExpired ? 'Inactive' : 'Active'}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400/80">{radius}m radius · {course?.venueName}</p>
              </div>
            </div>
            {state?.latitude != null && state?.longitude != null && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lat</p>
                  <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{state.latitude.toFixed(6)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lng</p>
                  <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{state.longitude.toFixed(6)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Verification Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Verification</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">QR + GPS Verified</span>
                <span className="font-bold text-emerald-600">
                  {(activeSession?.attendees ?? []).filter(s => s.gpsVerified).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Pending</span>
                <span className="font-bold text-slate-500">{(activeSession?.attendees ?? []).filter(s => !s.gpsVerified).length}</span>
              </div>
            </div>
          </div>

          {/* Session countdown card */}
          <div className={`rounded-2xl border p-5 ${sessionExpired
            ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
            : sessionTimeLeft <= 300
              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
              : 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20'
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
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm transition-all"
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
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[60] flex flex-col items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setQrFullscreen(false)}
            className="absolute top-5 right-5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors z-10"
            title="Exit fullscreen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Minimize hint */}
          <button
            onClick={() => setQrFullscreen(false)}
            className="absolute top-5 left-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors z-10"
          >
            <Minimize2 className="w-4 h-4" />
            Exit Fullscreen
          </button>

          {/* Course info */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-600 uppercase">Live</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{course?.code} — {course?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{course?.venueName}</p>
          </div>

          {/* Large QR */}
          <div className="p-10 bg-white rounded-3xl border-2 border-slate-100 dark:border-slate-300 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 mb-6">
            <QRCodeSVG
              value={qrPayload}
              size={Math.min(400, window.innerWidth - 120)}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#4F46E5"
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
                  stroke={qrSecondsLeft <= 5 ? '#ef4444' : '#4F46E5'}
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
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Token</p>
              <p className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-lg">{currentQrToken}</p>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Session ends in</p>
              <p className={`text-lg font-bold font-mono ${countdownColor}`}>
                {formatCountdown(sessionTimeLeft)}
              </p>
            </div>
          </div>

          {/* Student count */}
          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
            <Users className="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">{studentCount} students present</span>
          </div>
        </div>
      )}

      {/* ── End Confirm Modal ─────────────────────────────────── */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {sessionExpired ? 'Session Complete' : 'End Session?'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {sessionExpired
                ? `Session for ${course?.code} has ended. ${studentCount} students marked present.`
                : `This will end the attendance session for ${course?.code}. ${studentCount} students have been marked present.`}
            </p>
            <div className="flex gap-3">
              {!sessionExpired && (
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
