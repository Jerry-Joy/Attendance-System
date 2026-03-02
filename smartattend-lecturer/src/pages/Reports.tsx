import { useState } from 'react'
import {
  Calendar,
  BarChart3,
  Shield,
  TrendingUp,
  BookOpen,
  Users,
} from 'lucide-react'
import { courseReports, weeklyData } from '../data/mockData'

type Period = 'week' | 'month' | 'semester'

export default function Reports() {
  const [period, setPeriod] = useState<Period>('week')

  const avgAttendance = Math.round(courseReports.reduce((a, c) => a + c.rate, 0) / courseReports.length)
  const totalSessions = courseReports.reduce((a, c) => a + c.sessions, 0)
  const avgGps = Math.round(courseReports.reduce((a, c) => a + c.gpsRate, 0) / courseReports.length)
  const maxRate = Math.max(...weeklyData.map((d) => d.rate))

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500">Analytics & attendance insights</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(['week', 'month', 'semester'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${period === p
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{avgAttendance}%</p>
              <p className="text-sm text-slate-500">Avg. Attendance</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalSessions}</p>
              <p className="text-sm text-slate-500">Total Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{avgGps}%</p>
              <p className="text-sm text-slate-500">GPS Verified</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-700">Weekly Attendance</h3>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-end justify-between gap-4" style={{ height: '180px' }}>
            {weeklyData.map((item) => {
              const barHeight = (item.rate / maxRate) * 150
              const color =
                item.rate >= 85
                  ? 'bg-emerald-500'
                  : item.rate >= 75
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-slate-600">{item.rate}%</span>
                  <div className="w-full flex justify-center">
                    <div
                      className={`w-full max-w-[48px] rounded-t-lg ${color} transition-all duration-700`}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-1">{item.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Verification Methods */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-6">Verification Methods</h3>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">QR + GPS</span>
                <span className="text-sm font-bold text-emerald-600">{avgGps}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${avgGps}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">QR Only</span>
                <span className="text-sm font-bold text-amber-600">{100 - avgGps}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${100 - avgGps}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-brand-50 rounded-xl border border-brand-100">
            <p className="text-xs text-brand-600 font-medium">
              GPS verification rate is {avgGps >= 90 ? 'excellent' : avgGps >= 80 ? 'good' : 'needs improvement'}
            </p>
          </div>
        </div>
      </div>

      {/* Course Reports */}
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Course Reports</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {courseReports.map((report) => {
          const rateColor =
            report.rate >= 85
              ? 'text-emerald-600'
              : report.rate >= 75
                ? 'text-amber-600'
                : 'text-red-600'
          const barColor =
            report.rate >= 85
              ? 'bg-emerald-500'
              : report.rate >= 75
                ? 'bg-amber-500'
                : 'bg-red-500'

          return (
            <div key={report.code} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{report.code}</h4>
                  <p className="text-xs text-slate-500">{report.name}</p>
                </div>
                <span className={`text-xl font-bold ${rateColor}`}>{report.rate}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${report.rate}%` }}
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{report.sessions} sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{report.gpsRate}% GPS</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
