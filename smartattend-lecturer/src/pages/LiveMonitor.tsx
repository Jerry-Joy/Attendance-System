import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  QrCode,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  Search,
  RefreshCw,
  UserPlus,
  Clock,
  Hash,
} from 'lucide-react'
import { useData } from '../context/DataContext'

type FilterType = 'all' | 'gps' | 'qr-only'

export default function LiveMonitor() {
  const navigate = useNavigate()
  const { activeSession, courses } = useData()

  const course = courses.find((c) => c.id === activeSession?.courseId) ?? null

  /* Redirect if no active session */
  useEffect(() => {
    if (!activeSession) {
      navigate('/courses', { replace: true })
    }
  }, [activeSession, navigate])

  // ── Students come from the shared active session ───
  const students = [...(activeSession?.attendees ?? [])].reverse() // newest first
  const [prevCount, setPrevCount] = useState(students.length)
  const [newRowId, setNewRowId] = useState<string | null>(null)
  const tableEndRef = useRef<HTMLDivElement>(null)

  // Detect new arrivals
  useEffect(() => {
    if (students.length > prevCount) {
      const newest = students[0]
      if (newest) {
        setNewRowId(newest.id)
        setTimeout(() => setNewRowId(null), 1500)
        tableEndRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    setPrevCount(students.length)
  }, [students.length, prevCount, students])

  // ── Filters ─────────────────────────────────────────────────
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Derived stats ───────────────────────────────────────────
  const totalCount = students.length
  const gpsVerified = students.filter((s) => s.gpsVerified).length
  const qrOnly = totalCount - gpsVerified
  const enrolled = course?.studentCount ?? 0

  const filteredStudents = students.filter((student) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'gps'
          ? student.gpsVerified
          : !student.gpsVerified

    const matchesSearch =
      searchQuery === '' ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.indexNumber.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto animate-slide-up">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">Real-Time Attendance</h1>
              {activeSession && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 border border-red-200 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-600 uppercase">Live</span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500">{course?.code} — {course?.name}</p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Real-time updates</span>
          </div>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Count</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-brand-600">{totalCount}</span>
            <span className="text-sm text-slate-400">/ {enrolled}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">GPS Verified</span>
          </div>
          <span className="text-3xl font-bold text-emerald-600">{gpsVerified}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">QR Only</span>
          </div>
          <span className="text-3xl font-bold text-amber-600">{qrOnly}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Live Count</span>
          </div>
          <span className="text-sm font-bold text-slate-700 font-mono">
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

      {/* ── Filter + Search ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2">
          {(
            [
              { key: 'all', label: 'All', count: totalCount },
              { key: 'gps', label: 'GPS Verified', count: gpsVerified },
              { key: 'qr-only', label: 'QR Only', count: qrOnly },
            ] as { key: FilterType; label: string; count: number }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filter === f.key
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${filter === f.key ? 'text-white/70' : 'text-slate-400'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or student ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* ── Attendance Table ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Scrollable container — caps at ~480px then scrolls */}
        <div ref={tableEndRef} className="overflow-y-auto overflow-x-auto max-h-[480px]">
          {totalCount === 0 ? (
            /* ── Empty State ─────────────────────────────────── */
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <UserPlus className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">No students yet</h3>
              <p className="text-sm text-slate-400 max-w-xs text-center">
                Waiting for students to scan the QR code. Attendance will appear here in real time.
              </p>
              {activeSession && (
                <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Waiting for check-ins...
                </div>
              )}
            </div>
          ) : filteredStudents.length === 0 ? (
            /* ── No results for filter ───────────────────────── */
            <div className="py-16 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No students match the current filter</p>
              <button
                onClick={() => { setFilter('all'); setSearchQuery('') }}
                className="mt-2 text-xs text-brand-500 font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 w-10">
                    <Hash className="w-3.5 h-3.5" />
                  </th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Student
                  </th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Student ID
                  </th>
                  <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Time Marked
                  </th>
                  <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Verification
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  const isNew = student.id === newRowId
                  return (
                    <tr
                      key={student.id}
                      className={`border-b border-slate-50 transition-all duration-500 ${isNew
                        ? 'bg-brand-50/60'
                        : 'hover:bg-slate-50/50'
                        }`}
                    >
                      {/* Row number */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-slate-400">
                          {filteredStudents.length - index}
                        </span>
                      </td>

                      {/* Student Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 transition-colors duration-500 ${isNew
                            ? 'bg-brand-500 text-white'
                            : 'bg-brand-50 text-brand-600'
                            }`}>
                            {student.avatarInitials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{student.name}</p>
                            {isNew && (
                              <span className="inline-block text-[10px] font-bold text-brand-500 uppercase">Just joined</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-600 font-mono">{student.indexNumber}</span>
                      </td>

                      {/* Time Marked */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-sm font-medium text-slate-700">{student.time}</span>
                      </td>

                      {/* GPS Status */}
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          {student.gpsVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <MapPin className="w-3 h-3" />
                              GPS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              QR Only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Table footer with total ─────────────────────────── */}
        {totalCount > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-700">{filteredStudents.length}</span> of{' '}
              <span className="font-bold text-slate-700">{totalCount}</span> checked-in students
            </span>
            <span className="text-xs text-slate-400">
              {enrolled - totalCount} remaining
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
