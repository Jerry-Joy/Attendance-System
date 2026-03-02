import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Users,
  Calendar,
  MapPin,
  Play,
  BookOpen,
  Clock,
  LayoutList,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { mockCourses, mockLecturer, courseReports } from '../data/mockData'

export default function Courses() {
  const navigate = useNavigate()
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const totalStudents = mockCourses.reduce((acc, c) => acc + c.studentCount, 0)
  const totalSessions = courseReports.reduce((a, c) => a + c.sessions, 0)

  /* colour for the left border accent per course index */
  const accentColors = ['border-brand-500', 'border-emerald-500', 'border-amber-500']

  /* attendance progress per course from reports data */
  const getProgress = (code: string) => {
    const r = courseReports.find((cr) => cr.code === code)
    return r ? r.rate : 0
  }
  const getProgressColor = (rate: number) =>
    rate >= 85 ? 'bg-emerald-500' : rate >= 70 ? 'bg-brand-500' : 'bg-amber-500'

  /* extract short join code (last part after dash) */
  const shortJoinCode = (code: string) => code.split('-')[1] || code

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto animate-slide-up">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-slate-500 text-sm mb-0.5">Welcome back,</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {mockLecturer.name}
          </h1>
        </div>
        <button
          onClick={() => navigate('/courses/create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-600/25 hover:-translate-y-[1px] active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          {
            icon: BookOpen,
            value: mockCourses.length,
            label: 'ACTIVE COURSES',
            bg: 'bg-brand-50',
            text: 'text-brand-500',
          },
          {
            icon: Users,
            value: totalStudents,
            label: 'TOTAL STUDENTS',
            bg: 'bg-emerald-50',
            text: 'text-emerald-500',
          },
          {
            icon: Clock,
            value: totalSessions,
            label: 'TOTAL SESSIONS',
            bg: 'bg-amber-50',
            text: 'text-amber-500',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 px-5 py-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}
            >
              <stat.icon className={`w-6 h-6 ${stat.text}`} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800">{stat.value}</p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800">Your Courses</h2>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg">
            {mockCourses.length} Courses
          </span>
        </div>
        <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-all ${view === 'list'
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
              }`}
            title="List view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-all ${view === 'grid'
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
              }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Course List View ─────────────────────────────────── */}
      {view === 'list' ? (
        <div className="space-y-3">
          {mockCourses.map((course, idx) => {
            const progress = getProgress(course.code)
            const progressColor = getProgressColor(progress)
            const accent = accentColors[idx % accentColors.length]

            return (
              <div
                key={course.id}
                className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${accent} hover:shadow-md hover:border-slate-300 transition-all duration-200 relative`}
              >
                <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left: Course info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-800">
                      {course.code}: {course.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                      {course.venueName && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.venueName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.lastSession}</span>
                      </div>
                    </div>
                  </div>

                  {/* Level badge */}
                  <div className="shrink-0">
                    <span className="px-2.5 py-1 text-[11px] font-bold text-brand-600 bg-brand-50 rounded-lg uppercase tracking-wide">
                      {course.level}
                    </span>
                  </div>

                  {/* Attendance progress */}
                  <div className="shrink-0 w-44">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Attendance Progress
                      </span>
                      <span className="text-xs font-bold text-slate-700">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressColor} rounded-full transition-all duration-700`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Student count */}
                  <div className="shrink-0 text-center w-16">
                    <p className="text-xl font-extrabold text-slate-800">
                      {course.studentCount}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Students
                    </p>
                  </div>

                  {/* Join code */}
                  <div className="shrink-0 text-center w-16">
                    <p className="text-sm font-bold font-mono text-slate-800 tracking-wide">
                      {shortJoinCode(course.joinCode)}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Join Code
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/courses/${course.id}/start-session`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition-all hover:-translate-y-[1px] active:translate-y-0"
                    >
                      <Play className="w-3 h-3" />
                      Start Session
                    </button>

                    {/* More menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === course.id ? null : course.id)
                        }
                        className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openMenu === course.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 z-50 py-1.5 animate-slide-up">
                            <button
                              onClick={() => {
                                setOpenMenu(null)
                                navigate(`/courses/${course.id}/students`)
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <UserPlus className="w-4 h-4 text-slate-400" />
                              Manage Students
                            </button>
                            <button
                              onClick={() => setOpenMenu(null)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-slate-400" />
                              Edit Course
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              onClick={() => setOpenMenu(null)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Course
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Grid View ──────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mockCourses.map((course, idx) => {
            const progress = getProgress(course.code)
            const progressColor = getProgressColor(progress)
            const accent = accentColors[idx % accentColors.length]

            return (
              <div
                key={course.id}
                className={`bg-white rounded-2xl border border-slate-200 border-t-4 ${accent.replace('border-l-', 'border-t-')} hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">{course.code}</h3>
                      <p className="text-sm text-slate-500">{course.name}</p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold bg-brand-50 text-brand-600 rounded-lg">
                      {course.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    {course.venueName && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.venueName}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Attendance
                      </span>
                      <span className="text-xs font-bold text-slate-700">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressColor} rounded-full transition-all duration-700`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between mb-4 text-center">
                    <div>
                      <p className="text-lg font-extrabold text-slate-800">{course.studentCount}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Students</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold font-mono text-slate-800">{shortJoinCode(course.joinCode)}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Join Code</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{course.lastSession}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Last Session</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/courses/${course.id}/start-session`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      <Play className="w-3 h-3" />
                      Start Session
                    </button>
                    <button
                      onClick={() => navigate(`/courses/${course.id}/students`)}
                      className="px-3 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 rounded-xl transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
