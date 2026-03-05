import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, Share2, Ban, Check, X, Users } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function ManageStudents() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { courses, enrolledStudents, removeStudent } = useData()
  const course = courses.find((c) => c.id === id) || courses[0]
  const studentList = enrolledStudents[course?.id] || []
  const [codeEnabled, setCodeEnabled] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(course?.joinCode ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRemove = (studentId: string) => {
    if (course) removeStudent(course.id, studentId)
  }

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{course?.code}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{course?.name}</p>
        </div>
      </div>

      {/* Join Code Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Course Join Code</h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${codeEnabled ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${codeEnabled ? 'bg-brand-500' : 'bg-slate-400'}`} />
            {codeEnabled ? 'Active' : 'Disabled'}
          </span>
        </div>

        <div className="py-5 bg-slate-50 dark:bg-slate-700 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 text-center mb-4">
          <span className={`text-3xl font-bold tracking-[0.2em] font-mono ${codeEnabled ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
            }`}>
            {course?.joinCode}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-xl text-sm font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-xl text-sm font-medium transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={() => setCodeEnabled(!codeEnabled)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${codeEnabled
              ? 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400'
              : 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}
          >
            {codeEnabled ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {codeEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Enrolled Students ({studentList.length})
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {studentList.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No students enrolled yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Share the course code to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Index Number</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Joined</th>
                  <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Attendance</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((student) => (
                  <tr key={student.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-xs shrink-0">
                          {student.avatarInitials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">{student.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">{student.indexNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">{student.indexNumber}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{student.joinedDate}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block text-sm font-semibold ${student.attendanceRate >= 85 ? 'text-emerald-600'
                        : student.attendanceRate >= 70 ? 'text-amber-600'
                          : 'text-red-600'
                        }`}>
                        {student.attendanceRate}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleRemove(student.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Remove student"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
