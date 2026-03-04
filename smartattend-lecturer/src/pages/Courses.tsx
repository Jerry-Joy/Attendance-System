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
  X,
  AlertTriangle,
  Radio,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import type { Course } from '../types'

export default function Courses() {
  const navigate = useNavigate()
  const { courses: mockCourses, deleteCourse, updateCourse, pastSessions, activeSession } = useData()
  const { lecturer } = useAuth()
  const [view, setView] = useState<'list' | 'grid'>(() => {
    try {
      const saved = localStorage.getItem('smartattend_course_view')
      if (saved === 'grid' || saved === 'list') return saved
    } catch { /* ignore */ }
    return 'list'
  })
  const handleSetView = (v: 'list' | 'grid') => {
    setView(v)
    try { localStorage.setItem('smartattend_course_view', v) } catch { /* ignore */ }
  }
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [editTarget, setEditTarget] = useState<Course | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editName, setEditName] = useState('')
  const [editVenue, setEditVenue] = useState('')

  const openEditModal = (course: Course) => {
    setEditCode(course.code)
    setEditName(course.name)
    setEditVenue(course.venueName || '')
    setEditTarget(course)
    setOpenMenu(null)
  }

  const handleSaveEdit = () => {
    if (!editTarget || editCode.trim().length < 3 || editName.trim().length < 3) return
    updateCourse(editTarget.id, {
      code: editCode.trim().toUpperCase(),
      name: editName.trim(),
      venueName: editVenue.trim() || undefined,
    })
    setEditTarget(null)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteCourse(deleteTarget.id)
    setDeleteTarget(null)
  }

  const totalStudents = mockCourses.reduce((acc, c) => acc + c.studentCount, 0)
  const totalSessions = pastSessions.length

  /* border accent colour based on attendance progress */
  const getAccentColor = (rate: number) =>
    rate >= 85 ? 'border-l-emerald-500' : rate >= 70 ? 'border-l-sky-500' : 'border-l-amber-500'
  const getAccentColorTop = (rate: number) =>
    rate >= 85 ? 'border-t-emerald-500' : rate >= 70 ? 'border-t-sky-500' : 'border-t-amber-500'

  /* attendance progress per course from past sessions */
  const getProgress = (code: string) => {
    const sessions = pastSessions.filter((s) => s.courseCode === code)
    if (sessions.length === 0) return 0
    const avg = sessions.reduce((a, s) =>
      a + (s.totalStudents > 0 ? (s.presentCount / s.totalStudents) * 100 : 0), 0) / sessions.length
    return Math.round(avg)
  }
  const getProgressColor = (rate: number) =>
    rate >= 85 ? 'bg-emerald-500' : rate >= 70 ? 'bg-sky-500' : 'bg-amber-500'

  /* extract short join code (last part after dash) */
  const shortJoinCode = (code: string) => code.split('-')[1] || code

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto animate-slide-up">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-0.5">Welcome back,</p>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {lecturer?.name ?? 'Lecturer'}
          </h1>
        </div>
        <button
          onClick={() => navigate('/courses/create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-500/20 active:scale-95"
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
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            text: 'text-blue-600 dark:text-blue-400',
          },
          {
            icon: Users,
            value: totalStudents,
            label: 'TOTAL STUDENTS',
            bg: 'bg-purple-50 dark:bg-purple-500/10',
            text: 'text-purple-600 dark:text-purple-400',
          },
          {
            icon: Clock,
            value: totalSessions,
            label: 'TOTAL SESSIONS',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            text: 'text-emerald-600 dark:text-emerald-400',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}
            >
              <stat.icon className={`w-6 h-6 ${stat.text}`} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{stat.value}</p>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Your Courses</h2>
          <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-600">
            {mockCourses.length}
          </span>
        </div>
        <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <button
            onClick={() => handleSetView('list')}
            className={`p-1.5 rounded-md transition-all ${view === 'list'
              ? 'bg-white dark:bg-slate-600 text-brand-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            title="List view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSetView('grid')}
            className={`p-1.5 rounded-md transition-all ${view === 'grid'
              ? 'bg-white dark:bg-slate-600 text-brand-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
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
            const accent = getAccentColor(progress)
            const isLive = activeSession?.courseId === course.id

            return (
              <div
                key={course.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border ${isLive ? 'border-emerald-300 dark:border-emerald-500/50 ring-2 ring-emerald-100 dark:ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'} border-l-4 ${isLive ? 'border-l-emerald-500' : accent} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group ${openMenu === course.id ? 'z-50' : 'z-0'}`}
              >
                {/* Live indicator */}
                {isLive && (
                  <div className="absolute -top-2.5 left-6 flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md shadow-emerald-500/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inset-0 rounded-full bg-white opacity-75" />
                      <span className="relative rounded-full h-2 w-2 bg-white" />
                    </span>
                    Live Session
                  </div>
                )}
                <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left: Course info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {course.code}: {course.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {course.venueName && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{course.venueName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{course.lastSession}</span>
                      </div>
                    </div>
                  </div>

                  {/* Level badge */}
                  <div className="shrink-0">
                    <span className="px-2.5 py-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-lg uppercase tracking-wide">
                      {course.level}
                    </span>
                  </div>

                  {/* Attendance progress */}
                  <div className="shrink-0 w-44">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Attendance Progress
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressColor} rounded-full transition-all duration-700`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Student count */}
                  <div className="shrink-0 text-center w-16">
                    <p className="text-xl font-extrabold text-slate-800 dark:text-white">
                      {course.studentCount}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Students
                    </p>
                  </div>

                  {/* Join code */}
                  <div className="shrink-0 text-center w-16">
                    <p className="text-sm font-bold font-mono text-slate-800 dark:text-white tracking-wide">
                      {shortJoinCode(course.joinCode)}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Join Code
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isLive ? (
                      <button
                        onClick={() => navigate('/active-session')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all hover:-translate-y-[1px] active:translate-y-0 shadow-md shadow-emerald-500/20"
                      >
                        <Radio className="w-3 h-3" />
                        Rejoin Session
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/courses/${course.id}/start-session`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-500 dark:hover:text-brand-400 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all shadow-sm"
                      >
                        <Play className="w-3 h-3" />
                        Start Session
                      </button>
                    )}

                    {/* More menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === course.id ? null : course.id)
                        }
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openMenu === course.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/30 z-50 py-1.5 animate-slide-up">
                            <button
                              onClick={() => {
                                setOpenMenu(null)
                                navigate(`/courses/${course.id}/students`)
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <UserPlus className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              Manage Students
                            </button>
                            <button
                              onClick={() => openEditModal(course)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              Edit Course
                            </button>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                            <button
                              onClick={() => { setDeleteTarget(course); setOpenMenu(null) }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
            const accent = getAccentColorTop(progress)
            const isLive = activeSession?.courseId === course.id

            return (
              <div
                key={course.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border ${isLive ? 'border-emerald-300 dark:border-emerald-500/50 ring-2 ring-emerald-100 dark:ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'} border-t-4 ${isLive ? 'border-t-emerald-500' : accent} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-visible relative group ${openMenu === course.id ? 'z-50' : 'z-0'}`}
              >
                {/* Live indicator */}
                {isLive && (
                  <div className="absolute -top-2.5 left-5 flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md shadow-emerald-500/30 z-10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inset-0 rounded-full bg-white opacity-75" />
                      <span className="relative rounded-full h-2 w-2 bg-white" />
                    </span>
                    Live
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{course.code}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{course.name}</p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg">
                      {course.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {course.venueName && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{course.venueName}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Attendance
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressColor} rounded-full transition-all duration-700`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between mb-4 text-center">
                    <div>
                      <p className="text-lg font-extrabold text-slate-800 dark:text-white">{course.studentCount}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Students</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold font-mono text-slate-800 dark:text-white">{shortJoinCode(course.joinCode)}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Join Code</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{course.lastSession}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Last Session</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isLive ? (
                      <button
                        onClick={() => navigate('/active-session')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-500/20"
                      >
                        <Radio className="w-3 h-3" />
                        Rejoin Session
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/courses/${course.id}/start-session`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-500 dark:hover:text-brand-400 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all shadow-sm"
                      >
                        <Play className="w-3 h-3" />
                        Start Session
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/courses/${course.id}/students`)}
                      className="px-3 py-2.5 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-all"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenu(openMenu === course.id ? null : course.id)
                        }}
                        className="px-3 py-2.5 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-all"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openMenu === course.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/30 z-50 py-1.5 animate-slide-up">
                            <button
                              onClick={() => {
                                setOpenMenu(null)
                                navigate(`/courses/${course.id}/students`)
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <UserPlus className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              Manage Students
                            </button>
                            <button
                              onClick={() => openEditModal(course)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              Edit Course
                            </button>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                            <button
                              onClick={() => { setDeleteTarget(course); setOpenMenu(null) }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
      )}

      {/* ── Empty State ─────────────────────────────────── */}
      {mockCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No courses yet</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Create your first course to get started</p>
          <button
            onClick={() => navigate('/courses/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slide-up">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delete Course</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-200">{deleteTarget.code} — {deleteTarget.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Course Modal ────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Edit Course</h3>
              <button
                onClick={() => setEditTarget(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Course Code</label>
                <input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-500/30 focus:border-brand-400 outline-none transition-all"
                  placeholder="e.g. CSC301"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Course Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-500/30 focus:border-brand-400 outline-none transition-all"
                  placeholder="e.g. Software Engineering"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Venue</label>
                <input
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-500/30 focus:border-brand-400 outline-none transition-all"
                  placeholder="e.g. Hall A, Block 3"
                />
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() => setEditTarget(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editCode.trim().length < 3 || editName.trim().length < 3}
                className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
