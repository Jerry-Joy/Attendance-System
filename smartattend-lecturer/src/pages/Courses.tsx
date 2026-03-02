import { useNavigate } from 'react-router-dom'
import { Plus, Users, Calendar, MapPin, Play, BookOpen, Clock } from 'lucide-react'
import { mockCourses, mockLecturer } from '../data/mockData'

export default function Courses() {
  const navigate = useNavigate()

  const totalStudents = mockCourses.reduce((acc, c) => acc + c.studentCount, 0)

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto animate-slide-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-slate-500 text-sm mb-0.5">Good morning,</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{mockLecturer.name}</h1>
        </div>
        <button
          onClick={() => navigate('/courses/create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-600/25 hover:-translate-y-[1px] active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: BookOpen, value: mockCourses.length, label: 'Active Courses', color: 'brand', bg: 'bg-brand-50', text: 'text-brand-500' },
          { icon: Users, value: totalStudents, label: 'Total Students', color: 'green', bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { icon: Clock, value: 30, label: 'Total Sessions', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.text}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course list */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-800">Your Courses</h2>
        <span className="text-sm text-slate-400">{mockCourses.length} courses</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {mockCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/[0.06] transition-all duration-300 overflow-hidden group"
          >
            {/* Top color bar */}
            <div className="h-1 bg-gradient-to-r from-brand-500 to-brand-400 opacity-80 group-hover:opacity-100 transition-opacity" />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">{course.code}</h3>
                  <p className="text-sm text-slate-500">{course.name}</p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-semibold bg-brand-50 text-brand-600 rounded-lg">
                  {course.level}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>{course.studentCount} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{course.lastSession}</span>
                </div>
              </div>

              {/* Venue */}
              {course.venueName && (
                <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{course.venueName}</span>
                </div>
              )}

              {/* Join code */}
              <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Join Code</span>
                <span className="font-mono text-sm font-semibold text-brand-600 tracking-wider">{course.joinCode}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/courses/${course.id}/start-session`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-all hover:-translate-y-[1px] active:translate-y-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Session
                </button>
                <button
                  onClick={() => navigate(`/courses/${course.id}/students`)}
                  className="px-4 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition-all"
                  title="Manage Students"
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
