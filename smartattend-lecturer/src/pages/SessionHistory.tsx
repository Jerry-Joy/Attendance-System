import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Users,
  UserCheck,
  Calendar,
  Clock,
  Filter,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react'
import { useData } from '../context/DataContext'

const ROWS_PER_PAGE = 8

export default function SessionHistory() {
  const navigate = useNavigate()
  const { pastSessions, courses } = useData()

  const [searchQuery, setSearchQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Unique course codes for filter dropdown
  const courseOptions = useMemo(() => {
    const codes = [...new Set(pastSessions.map((s) => s.courseCode))]
    return codes.map((code) => {
      const session = pastSessions.find((s) => s.courseCode === code)
      return { code, name: session?.courseName || '' }
    })
  }, [pastSessions])

  // Filter + search
  const filtered = useMemo(() => {
    return pastSessions.filter((session) => {
      const matchesCourse = courseFilter === 'all' || session.courseCode === courseFilter
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        !query ||
        session.courseCode.toLowerCase().includes(query) ||
        session.courseName.toLowerCase().includes(query) ||
        session.date.toLowerCase().includes(query) ||
        session.venue.toLowerCase().includes(query)
      return matchesCourse && matchesSearch
    })
  }, [searchQuery, courseFilter, pastSessions])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedSessions = filtered.slice(
    (safeCurrentPage - 1) * ROWS_PER_PAGE,
    safeCurrentPage * ROWS_PER_PAGE
  )

  // Reset to page 1 on filter/search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }
  const handleCourseFilterChange = (value: string) => {
    setCourseFilter(value)
    setCurrentPage(1)
  }

  // Stats
  const totalSessions = filtered.length
  const avgAttendance =
    filtered.length > 0
      ? Math.round(
        filtered.reduce((acc, s) => acc + (s.presentCount / s.totalStudents) * 100, 0) /
        filtered.length
      )
      : 0
  const totalPresent = filtered.reduce((acc, s) => acc + s.presentCount, 0)

  const handleDownload = (session: (typeof pastSessions)[0]) => {
    setDownloadingId(session.id)

    const csvRows = [
      ['Session Report'],
      ['Course', `${session.courseCode} - ${session.courseName}`],
      ['Date', session.date],
      ['Time', `${session.startTime} - ${session.endTime}`],
      ['Duration', session.duration],
      ['Venue', session.venue],
      ['Total Students', session.totalStudents],
      ['Present', session.presentCount],
      ['Absent', session.absentCount],
      [
        'Attendance Rate',
        `${Math.round((session.presentCount / session.totalStudents) * 100)}%`,
      ],
    ]

    const csvContent = csvRows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${session.courseCode.replace(/\s/g, '_')}_${session.date.replace(/[\s,]/g, '_')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setTimeout(() => setDownloadingId(null), 1200)
  }

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-brand-500" />
            Session History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage all past attendance sessions
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 hover-lift animate-fade-in-up stagger-1">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-white animate-number-pop stagger-3">{totalSessions}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Sessions</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 hover-lift animate-fade-in-up stagger-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-white animate-number-pop stagger-4">{totalPresent}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Check-ins</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 hover-lift animate-fade-in-up stagger-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-white animate-number-pop stagger-5">{avgAttendance}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg. Attendance</p>
          </div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-6 animate-fade-in-up stagger-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by course, date, venue..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* Course filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={courseFilter}
              onChange={(e) => handleCourseFilterChange(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20 transition-all cursor-pointer"
            >
              <option value="all">All Courses</option>
              {courseOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.code} — {opt.name}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>

        {/* Active filter chips */}
        {(searchQuery || courseFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs text-slate-400">Filters:</span>
            {courseFilter !== 'all' && (
              <button
                onClick={() => handleCourseFilterChange('all')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full text-xs font-medium hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
              >
                {courseFilter}
                <span className="ml-0.5">×</span>
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                "{searchQuery}"
                <span className="ml-0.5">×</span>
              </button>
            )}
            <button
              onClick={() => {
                handleSearchChange('')
                handleCourseFilterChange('all')
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 animate-fade-in-scale stagger-5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No sessions found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="text-right py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {paginatedSessions.map((session, index) => {
                  const rate = Math.round(
                    (session.presentCount / session.totalStudents) * 100
                  )
                  const rateColor =
                    rate >= 80
                      ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                      : rate >= 60
                        ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10'
                        : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'

                  return (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all duration-200 row-animate group"
                      style={{ animationDelay: `${index * 0.06}s` }}
                    >
                      {/* Course */}
                      <td className="py-4 px-5">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {session.courseCode}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {session.courseName}
                          </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5">
                        <p className="text-slate-700 dark:text-slate-200">{session.date}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {session.startTime} – {session.endTime}
                        </p>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-5">
                        <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {session.duration}
                        </div>
                      </td>

                      {/* Present */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {session.presentCount}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">/{session.totalStudents}</span>
                      </td>

                      {/* Rate */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-transform duration-200 group-hover:scale-110 ${rateColor}`}
                        >
                          {rate}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate('/session-summary', { state: { session } })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
                          >
                            <Eye className="w-3.5 h-3.5 group-hover:animate-pulse" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleDownload(session)}
                            disabled={downloadingId === session.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
                          >
                            {downloadingId === session.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {(safeCurrentPage - 1) * ROWS_PER_PAGE + 1}
              </span>
              –
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {Math.min(safeCurrentPage * ROWS_PER_PAGE, filtered.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length}</span>{' '}
              sessions
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-110 active:scale-90 ${page === safeCurrentPage
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Back to Dashboard */}
      <button
        onClick={() => navigate('/courses')}
        className="w-full sm:w-auto px-8 py-3 bg-brand-500 hover:bg-brand-600 hover:scale-[1.02] active:scale-95 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-500/25 animate-fade-in-up stagger-6"
      >
        Back to Dashboard
      </button>
    </div>
  )
}
