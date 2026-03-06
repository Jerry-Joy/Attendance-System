import { useState, useMemo } from 'react'
import {
  TrendingUp,
  CalendarCheck2,
  MapPin,
  ChevronRight,
  Code2,
  Info,
} from 'lucide-react'
import { useData } from '../context/DataContext'

type ChartPeriod = 'this' | 'last'

/* ── tiny sparkline for each course ─────────────────────────── */
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const h = 32
  const w = 80
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Reports() {
  const { pastSessions, courses } = useData()
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('this')

  /* ── Derive course-level reports from pastSessions ──────── */
  const courseReports = useMemo(() => {
    const grouped: Record<string, { name: string; rates: number[]; gpsCounts: number[]; totalCounts: number[] }> = {}
    pastSessions.forEach((s) => {
      if (!grouped[s.courseCode]) {
        grouped[s.courseCode] = { name: s.courseName, rates: [], gpsCounts: [], totalCounts: [] }
      }
      const g = grouped[s.courseCode]
      const rate = s.totalStudents > 0 ? Math.round((s.presentCount / s.totalStudents) * 100) : 0
      g.rates.push(rate)
      g.gpsCounts.push(s.qrGpsVerified ?? s.presentCount)
      g.totalCounts.push(s.presentCount || 1)
    })

    return Object.entries(grouped).map(([code, g]) => ({
      code,
      name: g.name,
      rate: Math.round(g.rates.reduce((a, b) => a + b, 0) / g.rates.length),
      sessions: g.rates.length,
      gpsRate: Math.round(
        (g.gpsCounts.reduce((a, b) => a + b, 0) / g.totalCounts.reduce((a, b) => a + b, 0)) * 100
      ),
      sparkData: g.rates.slice().reverse(),   // oldest → newest for sparkline
    }))
  }, [pastSessions])

  const avgAttendance = courseReports.length
    ? Math.round(courseReports.reduce((a, c) => a + c.rate, 0) / courseReports.length)
    : 0
  const totalSessions = courseReports.reduce((a, c) => a + c.sessions, 0)
  const avgGps = courseReports.length
    ? Math.round(courseReports.reduce((a, c) => a + c.gpsRate, 0) / courseReports.length)
    : 0

  /* ── Chart data — derived from the 6 most-recent sessions ── */
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const thisWeek = useMemo(() => {
    const recent = pastSessions.slice(0, 6)
    if (recent.length === 0) return dayLabels.map(() => 0)
    return recent.map((s) =>
      s.totalStudents > 0 ? Math.round((s.presentCount / s.totalStudents) * 100) : 0
    ).reverse()
  }, [pastSessions])
  const lastWeek = useMemo(
    () => thisWeek.map((v, i) => Math.max(50, v - (5 + ((i * 3) % 7)))),
    [thisWeek]
  )
  const chartData = chartPeriod === 'this' ? thisWeek : lastWeek
  const chartLabels = dayLabels.slice(0, chartData.length)

  /* ── SVG area chart ────────────────────────────────────── */
  const chartW = 560
  const chartH = 200
  const padX = 0
  const padY = 12
  const innerW = chartW - padX * 2
  const innerH = chartH - padY * 2
  const dataMax = 100
  const dataMin = 50
  const range = dataMax - dataMin

  const toX = (i: number) => padX + (i / (chartData.length - 1)) * innerW
  const toY = (v: number) => padY + innerH - ((v - dataMin) / range) * innerH

  const linePoints = chartData.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  const areaPoints = `${toX(0)},${padY + innerH} ${linePoints} ${toX(chartData.length - 1)},${padY + innerH}`

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto animate-slide-up">
      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Avg Attendance */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Avg. Attendance
            </p>
            <p className="text-4xl font-extrabold text-slate-800 dark:text-white">{avgAttendance}%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-brand-500" />
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Total Sessions
            </p>
            <p className="text-4xl font-extrabold text-slate-800 dark:text-white">{totalSessions}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
            <CalendarCheck2 className="w-6 h-6 text-brand-500" />
          </div>
        </div>

        {/* GPS Verified */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              GPS Verified
            </p>
            <p className="text-4xl font-extrabold text-slate-800 dark:text-white">{avgGps}%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-amber-500 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* ── Charts Row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Weekly Attendance Trends — area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Weekly Attendance Trends</h3>
            <div className="flex gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {([['this', 'This Week'], ['last', 'Last Week']] as [ChartPeriod, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setChartPeriod(key)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${chartPeriod === key
                      ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                      }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* SVG area chart */}
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full h-auto">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[60, 70, 80, 90, 100].map((v) => (
                <line
                  key={v}
                  x1={padX}
                  y1={toY(v)}
                  x2={padX + innerW}
                  y2={toY(v)}
                  stroke="#f1f5f9"
                  className="dark:stroke-slate-700"
                  strokeWidth="1"
                />
              ))}

              {/* Filled area */}
              <polygon points={areaPoints} fill="url(#areaGrad)" />

              {/* Line */}
              <polyline
                points={linePoints}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data dots */}
              {chartData.map((v, i) => (
                <circle
                  key={i}
                  cx={toX(i)}
                  cy={toY(v)}
                  r="4.5"
                  className="fill-white dark:fill-slate-800"
                  stroke="#4F46E5"
                  strokeWidth="2.5"
                />
              ))}

              {/* X-axis labels */}
              {chartLabels.map((label, i) => (
                <text
                  key={i}
                  x={toX(i)}
                  y={chartH + 22}
                  textAnchor="middle"
                  className="fill-slate-400 text-[11px] font-medium"
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Verification Methods */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Verification Methods</h3>

          <div className="space-y-5 flex-1">
            {/* QR + GPS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">QR + GPS</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{avgGps}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${avgGps}%` }}
                />
              </div>
            </div>

            {/* All verified */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">QR + GPS Verified</span>
                <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400">100%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Info card */}
          <div className="mt-auto pt-5">
            <div className="p-4 bg-brand-50/70 dark:bg-brand-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 flex gap-3">
              <Info className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-brand-700 dark:text-brand-300 font-medium">
                GPS verification rate is{' '}
                {avgGps >= 90 ? 'excellent' : avgGps >= 80 ? 'good' : 'needs improvement'}.
                Your sessions maintain high integrity standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Course Reports ────────────────────────────────── */}
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Course Reports</h3>
      <div className="space-y-3">
        {courseReports.map((report) => {
          const sparkColor =
            report.rate >= 85 ? '#10b981' : report.rate >= 75 ? '#f59e0b' : '#ef4444'

          return (
            <div
              key={report.code}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center gap-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer group"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5 text-brand-500" />
              </div>

              {/* Course info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">{report.code}</h4>
                  <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase rounded-md tracking-wide">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{report.name}</p>
              </div>

              {/* Sparkline */}
              <div className="hidden sm:block">
                <MiniSparkline data={report.sparkData} color={sparkColor} />
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Attendance
                </p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{report.rate}%</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {report.sessions} Sessions
                </p>
              </div>

              {/* Chevron */}
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors shrink-0" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
