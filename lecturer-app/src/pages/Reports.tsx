import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from "../context/DataContext";
import type { EnrolledStudent } from "../types";

type PeriodFilter = 'week' | 'month' | 'all';

export default function Reports() {
  const navigate = useNavigate();
  const { pastSessions, courses, enrolledStudents } = useData();

  const [courseFilter, setCourseFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  // Course options for filter
  const courseOptions = useMemo(() => {
    const codes = [...new Set(pastSessions.map(s => s.courseCode))];
    return codes.map(code => {
      const session = pastSessions.find(s => s.courseCode === code);
      return { code, name: session?.courseName || '' };
    });
  }, [pastSessions]);

  // Filter sessions by course and period
  const filtered = useMemo(() => {
    return pastSessions.filter(session => {
      const matchesCourse = courseFilter === 'all' || session.courseCode === courseFilter;
      // Period filtering (mock: use index-based approximation)
      let matchesPeriod = true;
      if (periodFilter === 'week') {
        // First 3 sessions
        const idx = pastSessions.indexOf(session);
        matchesPeriod = idx < 3;
      } else if (periodFilter === 'month') {
        // First 9 sessions
        const idx = pastSessions.indexOf(session);
        matchesPeriod = idx < 9;
      }
      return matchesCourse && matchesPeriod;
    });
  }, [courseFilter, periodFilter, pastSessions]);

  // KPIs from filtered data
  const avgAttendance = filtered.length > 0
    ? Math.round(filtered.reduce((a, s) => a + (s.presentCount / s.totalStudents) * 100, 0) / filtered.length)
    : 0;
  const totalSessions = filtered.length;
  const avgGps = filtered.length > 0
    ? Math.round(filtered.reduce((a, s) => a + ((s.qrGpsVerified ?? s.presentCount) / s.presentCount) * 100, 0) / filtered.length)
    : 0;

  // Chart data from filtered sessions (reversed for chronological order)
  const chartData = useMemo(() => {
    return [...filtered].reverse().map(s => ({
      name: s.date.replace(/,?\s*2026/, '').trim(),
      rate: Math.round((s.presentCount / s.totalStudents) * 100),
      gps: s.qrGpsVerified ?? s.presentCount,
      present: s.presentCount,
      total: s.totalStudents,
    }));
  }, [filtered]);

  // Per-course performance
  const coursePerformance = useMemo(() => {
    const grouped: Record<string, { name: string; rates: number[]; gpsCounts: number[]; totalPresent: number[]; sessions: number }> = {};
    filtered.forEach(s => {
      if (!grouped[s.courseCode]) grouped[s.courseCode] = { name: s.courseName, rates: [], gpsCounts: [], totalPresent: [], sessions: 0 };
      const g = grouped[s.courseCode];
      g.rates.push(s.totalStudents > 0 ? Math.round((s.presentCount / s.totalStudents) * 100) : 0);
      g.gpsCounts.push(s.qrGpsVerified ?? s.presentCount);
      g.totalPresent.push(s.presentCount);
      g.sessions++;
    });
    return Object.entries(grouped).map(([code, g]) => {
      const avgRate = Math.round(g.rates.reduce((a, b) => a + b, 0) / g.rates.length);
      const gpsRate = Math.round((g.gpsCounts.reduce((a, b) => a + b, 0) / g.totalPresent.reduce((a, b) => a + b, 0)) * 100);
      const sparkData = g.rates.slice().reverse();
      // Trend: compare last 2 rates
      const trend = sparkData.length >= 2 ? sparkData[sparkData.length - 1] - sparkData[sparkData.length - 2] : 0;
      const courseObj = courses.find(c => c.code === code);
      return { code, name: g.name, avgRate, gpsRate, sessions: g.sessions, sparkData, trend, courseId: courseObj?.id };
    });
  }, [filtered, courses]);

  // Flagged students — attendance below 75%
  const flaggedStudents = useMemo(() => {
    const results: { name: string; indexNumber: string; course: string; rate: number; avatarInitials: string }[] = [];
    Object.entries(enrolledStudents).forEach(([courseId, students]: [string, EnrolledStudent[]]) => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      if (courseFilter !== 'all' && course.code !== courseFilter) return;
      students.forEach(s => {
        if (s.attendanceRate < 75) {
          results.push({
            name: s.name,
            indexNumber: s.indexNumber,
            course: course.code,
            rate: s.attendanceRate,
            avatarInitials: s.avatarInitials,
          });
        }
      });
    });
    return results.sort((a, b) => a.rate - b.rate);
  }, [enrolledStudents, courses, courseFilter]);

  // Export CSV
  const handleExportAll = () => {
    const header = ['Course', 'Date', 'Start', 'End', 'Duration', 'Present', 'Total', 'Rate%', 'GPS Verified', 'Venue'];
    const rows = filtered.map(s => [
      s.courseCode, s.date, s.startTime, s.endTime, s.duration,
      s.presentCount, s.totalStudents, Math.round((s.presentCount / s.totalStudents) * 100),
      s.qrGpsVerified ?? '', s.venue,
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_report_${courseFilter}_${periodFilter}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-400">insights</span>
            Reports & Analytics
          </h1>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono tracking-widest uppercase mt-1">Performance Metrics & Integrity Audit</p>
        </div>
        <button onClick={handleExportAll} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.2)] cursor-pointer border border-blue-500/50 self-start sm:self-auto">
          <span className="material-symbols-outlined text-[14px]">download</span>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Course filter */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-600 dark:text-slate-400">filter_alt</span>
            <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors cursor-pointer">
              <option value="all">All Courses</option>
              {courseOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.code} — {opt.name}</option>
              ))}
            </select>
          </div>

          {/* Period toggle */}
          <div className="flex gap-0.5 p-0.5 bg-slate-50 dark:bg-[#0B0D11] rounded border border-slate-200 dark:border-slate-800">
            {([['week', 'This Week'], ['month', 'This Month'], ['all', 'All Time']] as [PeriodFilter, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setPeriodFilter(key)} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${periodFilter === key ? 'bg-blue-500/20 text-blue-400' : 'text-slate-600 hover:text-slate-700 dark:text-slate-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Active filter tags */}
          {(courseFilter !== 'all' || periodFilter !== 'all') && (
            <div className="flex items-center gap-2 ml-0 sm:ml-auto">
              {courseFilter !== 'all' && (
                <button onClick={() => setCourseFilter('all')} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold uppercase border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer">
                  {courseFilter} <span className="ml-0.5">×</span>
                </button>
              )}
              {periodFilter !== 'all' && (
                <button onClick={() => setPeriodFilter('all')} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold hover:bg-slate-700 transition-colors cursor-pointer">
                  {periodFilter === 'week' ? 'This Week' : 'This Month'} <span className="ml-0.5">×</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Avg. Attendance', value: `${avgAttendance}%`, icon: 'trending_up', accent: 'emerald', sub: `across ${totalSessions} sessions` },
          { label: 'Total Sessions', value: totalSessions, icon: 'calendar_today', accent: 'blue', sub: periodFilter === 'all' ? 'all time' : periodFilter === 'week' ? 'this week' : 'this month' },
          { label: 'GPS Verified', value: `${avgGps}%`, icon: 'location_on', accent: 'amber', sub: avgGps >= 95 ? 'excellent integrity' : avgGps >= 85 ? 'good integrity' : 'needs review' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between hover:border-slate-300 dark:border-slate-700 transition-colors group relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 w-16 h-16 bg-${stat.accent}-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{stat.value}</p>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5 uppercase">{stat.sub}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl bg-${stat.accent}-500/10 flex items-center justify-center relative z-10 border border-${stat.accent}-500/20`}>
              <span className={`material-symbols-outlined text-[20px] text-${stat.accent}-400`}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4">Attendance Trends</h3>
          {chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono uppercase">No data for selected filters</p>
            </div>
          ) : (
            <div className="flex-1 h-64 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRateReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '4px', border: '1px solid #1e293b', padding: '8px' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 600, fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase' as const }}
                    formatter={(value: number, name: string) => {
                      if (name === 'rate') return [`${value}%`, 'Attendance'];
                      return [value, name];
                    }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRateReport)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Verification Integrity */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-6">Verification Integrity</h3>
          <div className="space-y-5 flex-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[12px] text-emerald-400">qr_code_2</span>
                  QR + GPS
                </span>
                <span className="text-xs font-bold text-emerald-400">{avgGps}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700 shadow-[0_0_6px_rgba(16,185,129,0.3)]" style={{ width: `${avgGps}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[12px] text-blue-400">verified</span>
                  All Verified
                </span>
                <span className="text-xs font-bold text-blue-400">100%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[12px] text-amber-400">gps_fixed</span>
                  Geofence Pass
                </span>
                <span className="text-xs font-bold text-amber-400">{Math.min(avgGps + 2, 100)}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(avgGps + 2, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-5">
            <div className={`p-3 rounded border flex gap-3 ${avgGps >= 90 ? 'bg-emerald-500/10 border-emerald-500/20' : avgGps >= 80 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${avgGps >= 90 ? 'text-emerald-400' : avgGps >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                {avgGps >= 90 ? 'check_circle' : avgGps >= 80 ? 'warning' : 'error'}
              </span>
              <p className={`text-[10px] leading-relaxed font-mono uppercase ${avgGps >= 90 ? 'text-emerald-300' : avgGps >= 80 ? 'text-amber-300' : 'text-red-300'}`}>
                Verification rate is {avgGps >= 90 ? 'excellent' : avgGps >= 80 ? 'acceptable' : 'below threshold'}. {avgGps >= 90 ? 'All sessions maintain high integrity.' : 'Review flagged sessions for anomalies.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Course Performance</h3>
          <span className="text-[10px] text-slate-600 font-mono">{coursePerformance.length} courses</span>
        </div>

        {coursePerformance.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[24px] text-slate-600 mb-2 block">school</span>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono uppercase">No course data for selected filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {coursePerformance.map(report => {
              const sparkColor = report.avgRate >= 85 ? '#10b981' : report.avgRate >= 75 ? '#f59e0b' : '#ef4444';
              const isAtRisk = report.avgRate < 75;
              return (
                <button
                  key={report.code}
                  onClick={() => report.courseId && navigate(`/courses/${report.courseId}`)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-100 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 transition-all group cursor-pointer text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <span className="material-symbols-outlined text-[18px] text-blue-400">school</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">{report.code}</h4>
                      {isAtRisk ? (
                        <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-bold uppercase rounded border border-red-500/20 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[9px]">warning</span>
                          At Risk
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase rounded border border-emerald-500/20">Healthy</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5 truncate">{report.name}</p>
                  </div>

                  {/* Mini sparkline */}
                  <div className="hidden sm:block">
                    {report.sparkData.length >= 2 && (() => {
                      const data = report.sparkData;
                      const max = Math.max(...data), min = Math.min(...data);
                      const h = 32, w = 80, r = max - min || 1;
                      const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / r) * (h - 4) - 2}`).join(' ');
                      return (
                        <svg width={w} height={h} className="shrink-0">
                          <polyline points={pts} fill="none" stroke={sparkColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      );
                    })()}
                  </div>

                  {/* Trend */}
                  <div className="hidden sm:flex items-center shrink-0">
                    {report.trend > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">trending_up</span>
                        +{report.trend}%
                      </span>
                    ) : report.trend < 0 ? (
                      <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">trending_down</span>
                        {report.trend}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">trending_flat</span>
                        0%
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Rate</p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{report.avgRate}%</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">{report.sessions} sessions</p>
                  </div>

                  <span className="material-symbols-outlined text-[18px] text-slate-600 group-hover:text-slate-600 dark:text-slate-400 transition-colors shrink-0">chevron_right</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Flagged Students */}
      {flaggedStudents.length > 0 && (
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-red-400">flag</span>
              <h3 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Flagged Students</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
              {flaggedStudents.length} below 75%
            </span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {flaggedStudents.map((student, i) => {
              const severity = student.rate < 60 ? 'red' : 'amber';
              return (
                <div key={`${student.indexNumber}-${student.course}-${i}`} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-100 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 transition-colors">
                  <div className={`w-9 h-9 rounded-full bg-${severity}-500/10 border border-${severity}-500/20 flex items-center justify-center text-${severity}-400 font-bold text-[10px] shrink-0`}>
                    {student.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">{student.indexNumber}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded shrink-0">
                    {student.course}
                  </span>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold tabular-nums text-${severity}-400`}>{student.rate}%</p>
                    <p className={`text-[9px] font-bold uppercase text-${severity}-400/70`}>
                      {severity === 'red' ? 'Critical' : 'Warning'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
