import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import { mockSessionSummary, mockAttendingStudents } from '../data/mockData'

export default function SessionSummary() {
  const navigate = useNavigate()
  const summary = mockSessionSummary
  const [downloading, setDownloading] = useState(false)

  const attendanceRate = Math.round((summary.presentCount / summary.totalStudents) * 100)
  const absentCount = summary.totalStudents - summary.presentCount
  const gpsVerifiedCount = mockAttendingStudents.filter((s) => s.gpsVerified).length
  const qrOnlyCount = summary.presentCount - gpsVerifiedCount
  const gpsPercent = summary.presentCount > 0 ? Math.round((gpsVerifiedCount / summary.presentCount) * 100) : 0

  const rateColor =
    attendanceRate >= 75
      ? 'text-emerald-600'
      : attendanceRate >= 50
        ? 'text-amber-600'
        : 'text-red-500'
  const rateBg =
    attendanceRate >= 75
      ? 'bg-emerald-50 border-emerald-200'
      : attendanceRate >= 50
        ? 'bg-amber-50 border-amber-200'
        : 'bg-red-50 border-red-200'
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
      ...mockAttendingStudents.map((s, i) => [
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
      ['QR Only', qrOnlyCount],
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
          <h1 className="text-2xl font-bold text-slate-800">Session Summary</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {summary.courseCode} &middot; {summary.courseName} &middot; {summary.date}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">Session Completed</span>
        </div>
      </div>

      {/* Top Hero — Attendance Ring + Quick Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 mb-6">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0">
            <svg width="160" height="160" className="-rotate-90">
              <circle
                cx="80"
                cy="80"
                r={ringRadius}
                fill="none"
                stroke="#f1f5f9"
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
              <span className="text-[11px] text-slate-400 font-medium">ATTENDANCE</span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Total Students */}
            <div className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
              <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-brand-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-500" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{summary.totalStudents}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Total Students</p>
            </div>

            {/* Present */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 text-center border border-emerald-100">
              <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-emerald-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">{summary.presentCount}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Present</p>
            </div>

            {/* Absent */}
            <div className="bg-red-50/60 rounded-2xl p-5 text-center border border-red-100">
              <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-red-100 flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-500">{absentCount}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Absent</p>
            </div>

            {/* Attendance % */}
            <div className={`rounded-2xl p-5 text-center border ${rateBg}`}>
              <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-white/70 flex items-center justify-center">
                <TrendingUp className={`w-5 h-5 ${rateColor}`} />
              </div>
              <p className={`text-3xl font-bold ${rateColor}`}>{attendanceRate}%</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Details + Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Session Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
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
                className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                <span className="text-sm font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            Verification Breakdown
          </h3>

          <div className="space-y-5">
            {/* QR + GPS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-600">QR + GPS Verified</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">{gpsVerifiedCount}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${gpsPercent}%` }}
                />
              </div>
            </div>

            {/* QR Only */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-slate-600">QR Only</span>
                </div>
                <span className="text-sm font-bold text-amber-600">{qrOnlyCount}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${100 - gpsPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium text-emerald-700">
              {gpsPercent}% of present students fully verified with GPS
            </span>
          </div>
        </div>
      </div>

      {/* Recent Check-ins Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Student Attendance Log
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {mockAttendingStudents.length} check-ins recorded
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 w-10">#</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Student</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Student ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Verification</th>
              </tr>
            </thead>
            <tbody>
              {mockAttendingStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-4 text-xs text-slate-400 font-medium">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-semibold text-xs flex-shrink-0">
                        {student.avatarInitials}
                      </div>
                      <span className="font-medium text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-xs">{student.indexNumber}</td>
                  <td className="py-3 px-4 text-slate-500">{student.time}</td>
                  <td className="py-3 px-4">
                    {student.gpsVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-semibold">
                        <MapPin className="w-3 h-3" />
                        QR + GPS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[11px] font-semibold">
                        <QrCode className="w-3 h-3" />
                        QR Only
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
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-brand-500 text-brand-600 hover:bg-brand-50 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
