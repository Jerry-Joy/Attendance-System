import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CheckCircle,
  Users,
  UserX,
  UserCheck,
  Clock,
  MapPin,
  QrCode,
  Shield,
  Download,
  LayoutDashboard,
  TrendingUp,
  FileText,
  Loader2,
  History,
} from 'lucide-react'
import type { SessionSummary as SummaryType, PastSession, AttendingStudent } from '../types'

const emptySummary: SummaryType = {
  courseCode: '', courseName: '', date: '', startTime: '', endTime: '',
  duration: '', totalStudents: 0, presentCount: 0, absentCount: 0,
  qrGpsVerified: 0, geofenceRadius: 50, venueName: '',
}

export default function SessionSummary() {
  const navigate = useNavigate()
  const location = useLocation()
  const passedState = location.state as {
    session?: SummaryType | PastSession
    attendees?: AttendingStudent[]
  } | null

  /* Build a normalized summary from either a PastSession or a full SessionSummary */
  const summary: SummaryType = (() => {
    if (!passedState?.session) return emptySummary
    const s = passedState.session
    if ('qrGpsVerified' in s && typeof (s as SummaryType).geofenceRadius === 'number') return s as SummaryType
    /* PastSession → convert to SummaryType */
    const ps = s as PastSession
    return {
      courseCode: ps.courseCode,
      courseName: ps.courseName,
      date: ps.date,
      startTime: ps.startTime,
      endTime: ps.endTime,
      duration: ps.duration,
      totalStudents: ps.totalStudents,
      presentCount: ps.presentCount,
      absentCount: ps.absentCount,
      qrGpsVerified: ps.qrGpsVerified ?? ps.presentCount,
      geofenceRadius: ps.geofenceRadius ?? 50,
      venueName: ps.venue,
    }
  })()

  /* Resolve attending students: route state → PastSession.attendees → fallback mock */
  const attendees: AttendingStudent[] = (() => {
    if (passedState?.attendees && passedState.attendees.length > 0) return passedState.attendees
    const s = passedState?.session
    if (s && 'attendees' in s && (s as PastSession).attendees) return (s as PastSession).attendees!
    return []
  })()

  const [downloading, setDownloading] = useState(false)

  const attendanceRate =
    summary.totalStudents > 0
      ? Math.round((summary.presentCount / summary.totalStudents) * 100)
      : 0
  const absentCount = Math.max(summary.totalStudents - summary.presentCount, 0)
  const gpsVerifiedCount = summary.qrGpsVerified
  const gpsPercent =
    summary.presentCount > 0
      ? Math.min(Math.round((gpsVerifiedCount / summary.presentCount) * 100), 100)
      : 0

  const rateColor =
    attendanceRate >= 75
      ? 'text-emerald-600 dark:text-emerald-400'
      : attendanceRate >= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-500 dark:text-red-400'
  const rateBg =
    attendanceRate >= 75
      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30'
      : attendanceRate >= 50
        ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30'
        : 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30'
  const rateStroke =
    attendanceRate >= 75
      ? 'stroke-emerald-500'
      : attendanceRate >= 50
        ? 'stroke-amber-500'
        : 'stroke-red-500'

  // SVG ring params
  const ringRadius = 58
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (attendanceRate / 100) * ringCircumference

  const handleDownload = () => {
    setDownloading(true)

    // Build CSV content
    const csvRows = [
      ['#', 'Student Name', 'Student ID', 'Time Marked', 'GPS Verified'],
      ...attendees.map((s, i) => [
        i + 1,
        s.name,
        s.indexNumber,
        s.time,
        s.gpsVerified ? 'Yes' : 'No',
      ]),
      [],
      ['Session Summary'],
      ['Course', `${summary.courseCode} - ${summary.courseName}`],
      ['Date', summary.date],
      ['Duration', summary.duration],
      ['Total Students', summary.totalStudents],
      ['Present', summary.presentCount],
      ['Absent', absentCount],
      ['Attendance Rate', `${attendanceRate}%`],
      ['GPS Verified', gpsVerifiedCount],
    ]

    const csvContent = csvRows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${summary.courseCode.replace(/\s/g, '_')}_attendance_${summary.date.replace(/[\s,]/g, '_')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setTimeout(() => setDownloading(false), 1500)
  }

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Session Summary</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {summary.courseCode} &middot; {summary.courseName} &middot; {summary.date}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-full">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Session Completed</span>
        </div>
      </div>

      {/* Top Hero — Attendance Ring + Quick Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 mb-6">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0">
            <svg width="160" height="160" className="-rotate-90">
              <circle
                cx="80"
                cy="80"
                r={ringRadius}
                fill="none"
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r={ringRadius}
                fill="none"
                className={rateStroke}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${rateColor}`}>{attendanceRate}%</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">ATTENDANCE</span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Total Students */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 text-center border border-slate-100 dark:border-slate-600">
              <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-500" />
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{summary.totalStudents}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Total Students</p>
            </div>

            {/* Present */}
            <div className="bg-emerald-50/60 dark:bg-emerald-500/10 rounded-2xl p-5 text-center border border-emerald-100 dark:border-emerald-500/20">
              <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{summary.presentCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Present</p>
            </div>

            {/* Absent */}
            <div className="bg-red-50/60 dark:bg-red-500/10 rounded-2xl p-5 text-center border border-red-100 dark:border-red-500/20">
              <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-3xl font-bold text-red-500 dark:text-red-400">{absentCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Absent</p>
            </div>

            {/* Attendance % */}
            <div className={`rounded-2xl p-5 text-center border ${rateBg}`}>
              <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center">
                <TrendingUp className={`w-5 h-5 ${rateColor}`} />
              </div>
              <p className={`text-3xl font-bold ${rateColor}`}>{attendanceRate}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Details + Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Session Details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Session Details
          </h3>
          <div className="space-y-3">
            {[
              { icon: Clock, label: 'Start Time', value: summary.startTime },
              { icon: Clock, label: 'End Time', value: summary.endTime },
              { icon: Clock, label: 'Duration', value: summary.duration },
              { icon: MapPin, label: 'Venue', value: summary.venueName },
              { icon: MapPin, label: 'Geofence', value: `${summary.geofenceRadius}m radius` },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            Verification Breakdown
          </h3>

          <div className="space-y-5">
            {/* QR + GPS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">QR + GPS Verified</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{gpsVerifiedCount}</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${gpsPercent}%` }}
                />
              </div>
            </div>

          </div>

          <div className="mt-5 p-3.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              All present students verified with QR + GPS
            </span>
          </div>
        </div>
      </div>

      {/* Recent Check-ins Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Student Attendance Log
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {attendees.length} check-ins recorded
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 w-10">#</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Student</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Student ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Verification</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-50 dark:border-slate-700 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-3 px-4 text-xs text-slate-400 dark:text-slate-500 font-medium">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-xs flex-shrink-0">
                        {student.avatarInitials}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{student.indexNumber}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{student.time}</td>
                  <td className="py-3 px-4">
                    {student.gpsVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-semibold">
                        <MapPin className="w-3 h-3" />
                        QR + GPS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-semibold">
                        <Clock className="w-3 h-3" />
                        Verifying...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 border-2 border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Report
            </>
          )}
        </button>
        <button
          onClick={() => navigate('/session-history')}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm transition-all"
        >
          <History className="w-4 h-4" />
          Session History
        </button>
        <button
          onClick={() => navigate('/courses')}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-500/25"
        >
          <LayoutDashboard className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
