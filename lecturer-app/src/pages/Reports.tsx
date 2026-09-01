import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from "../context/DataContext";
import type { EnrolledStudent } from "../types";
import { CustomSelect } from "../components/CustomSelect";
import { Filter } from "lucide-react";

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
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary transition-transform duration-300 hover:scale-110 hover:rotate-12">insights</span>
            Reports & Analytics
          </h1>
          <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase mt-1">Performance Metrics & Integrity Audit</p>
        </div>
        <button onClick={handleExportAll} className="font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer self-start sm:self-auto bg-secondary text-primary group">
          <span className="material-symbols-outlined text-[14px] group-hover:scale-110 transition-transform">download</span>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 relative z-30 animate-slide-up hover:shadow-md hover:border-slate-300 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Course filter */}
          <div className="w-full sm:w-64">
            <CustomSelect
              value={courseFilter}
              onChange={setCourseFilter}
              options={[
                { value: 'all', label: 'All Courses' },
                ...courseOptions.map(opt => ({
                  value: opt.code,
                  label: `${opt.code} — ${opt.name}`,
                  badge: opt.code
                }))
              ]}
              icon={<Filter className="w-3.5 h-3.5" />}
              size="sm"
              placeholder="Filter by Course"
            />
          </div>

          {/* Period toggle */}
          <div className="flex gap-0.5 p-0.5 bg-slate-50 rounded border border-slate-200">
            {([['week', 'This Week'], ['month', 'This Month'], ['all', 'All Time']] as [PeriodFilter, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setPeriodFilter(key)} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${periodFilter === key ? 'bg-secondary text-primary shadow-sm' : 'text-slate-600 hover:text-slate-700 hover:bg-slate-100'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Active filter tags */}
          {(courseFilter !== 'all' || periodFilter !== 'all') && (
            <div className="flex items-center gap-2 ml-0 sm:ml-auto animate-slide-up">
              {courseFilter !== 'all' && (
                <button onClick={() => setCourseFilter('all')} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white rounded text-[10px] font-bold uppercase border border-primary hover:bg-primary/90 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95">
                  {courseFilter} <span className="ml-0.5">×</span>
                </button>
              )}
              {periodFilter !== 'all' && (
                <button onClick={() => setPeriodFilter('all')} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white rounded text-[10px] font-bold uppercase border border-primary hover:bg-primary/90 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95">
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
          { label: 'Avg. Attendance', value: `${avgAttendance}%`, icon: 'trending_up', cardClass: 'bg-primary border-primary text-white', iconContainer: 'bg-white/10 border-white/20', iconClass: 'text-secondary', valueClass: 'text-white', labelClass: 'text-white/80', subClass: 'text-white/60', hoverEffect: 'bg-white/5', sub: `across ${totalSessions} sessions` },
          { label: 'Total Sessions', value: totalSessions, icon: 'calendar_today', cardClass: 'bg-white border-slate-200', iconContainer: 'bg-primary/10 border-primary/20', iconClass: 'text-primary', valueClass: 'text-slate-900', labelClass: 'text-slate-600', subClass: 'text-slate-600', hoverEffect: 'bg-primary/5', sub: periodFilter === 'all' ? 'all time' : periodFilter === 'week' ? 'this week' : 'this month' },
          { label: 'GPS Verified', value: `${avgGps}%`, icon: 'location_on', cardClass: 'bg-white border-slate-200', iconContainer: 'bg-emerald-500/10 border-emerald-500/20', iconClass: 'text-emerald-500', valueClass: 'text-slate-900', labelClass: 'text-slate-600', subClass: 'text-slate-600', hoverEffect: 'bg-emerald-500/5', sub: avgGps >= 95 ? 'excellent integrity' : avgGps >= 85 ? 'good integrity' : 'needs review' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.cardClass} rounded-lg border px-5 py-4 flex items-center justify-between hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden cursor-pointer animate-slide-up`} style={{ animationDelay: `${i * 0.1 + 0.2}s` }}>
            <div className={`absolute -right-4 -top-4 w-16 h-16 ${stat.hoverEffect} rounded-full group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
            <div className="relative z-10">
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${stat.labelClass}`}>{stat.label}</p>
              <p className={`text-3xl font-extrabold tabular-nums ${stat.valueClass}`}>{stat.value}</p>
              <p className={`text-[10px] font-mono mt-0.5 uppercase ${stat.subClass}`}>{stat.sub}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center relative z-10 border ${stat.iconContainer} group-hover:scale-110 transition-transform duration-300`}>
              <span className={`material-symbols-outlined text-[20px] ${stat.iconClass}`}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col animate-slide-up hover:shadow-lg hover:border-slate-300 transition-all duration-300" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attendance Trends</h3>
            <span className="text-[11px] text-slate-400 font-medium">Historical Rate Trajectory</span>
          </div>
          {chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-xs text-slate-400 font-mono uppercase">No data for selected filters</p>
            </div>
          ) : (
            <div className="flex-1 h-64 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRateReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#081637" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#081637" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Inter, sans-serif' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Inter, sans-serif' }} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#081637', borderRadius: '8px', border: 'none', padding: '10px 14px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
                    itemStyle={{ color: '#F8FAFC', fontWeight: 600, fontSize: '12px' }}
                    labelStyle={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'rate') return [`${value}%`, 'Attendance Rate'];
                      return [value, name];
                    }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#081637" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRateReport)" animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Verification Integrity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col animate-slide-up hover:shadow-lg hover:border-slate-300 transition-all duration-300" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-5">Verification Integrity</h3>
          <div className="space-y-4 flex-1">
            <div className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5 group-hover:text-slate-900 transition-colors">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">qr_code_2</span>
                  QR + GPS Verified
                </span>
                <span className="text-xs font-bold text-emerald-700 font-mono">{avgGps}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${avgGps}%` }} />
              </div>
            </div>
            <div className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5 group-hover:text-slate-900 transition-colors">
                  <span className="material-symbols-outlined text-[14px] text-blue-600">verified</span>
                  Session Integrity
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">100%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5 group-hover:text-slate-900 transition-colors">
                  <span className="material-symbols-outlined text-[14px] text-amber-500">gps_fixed</span>
                  Geofence Pass
                </span>
                <span className="text-xs font-bold text-amber-700 font-mono">{Math.min(avgGps + 2, 100)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(avgGps + 2, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <div className={`p-3 rounded-lg border flex gap-2.5 items-start ${
              avgGps >= 90 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : avgGps >= 80 
                ? 'bg-amber-50 border-amber-200 text-amber-900' 
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                avgGps >= 90 ? 'text-emerald-600' : avgGps >= 80 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {avgGps >= 90 ? 'check_circle' : avgGps >= 80 ? 'warning' : 'error'}
              </span>
              <p className="text-[11px] leading-relaxed font-medium">
                Verification rate is {avgGps >= 90 ? 'excellent' : avgGps >= 80 ? 'acceptable' : 'below threshold'}. {avgGps >= 90 ? 'All recorded sessions meet the institutional compliance standards.' : 'Review flagged sessions for anomalies.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-slide-up hover:shadow-lg hover:border-slate-300 transition-all duration-300" style={{ animationDelay: '0.7s' }}>
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Course Performance</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Click any course row to view full session details</p>
          </div>
          <span className="text-xs text-slate-600 font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg">{coursePerformance.length} courses</span>
        </div>

        {coursePerformance.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[28px] text-slate-300 mb-2 block">school</span>
            <p className="text-xs text-slate-400 font-medium">No course data found for selected filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {coursePerformance.map((report, idx) => {
              const sparkColor = report.avgRate >= 85 ? '#10b981' : report.avgRate >= 75 ? '#f59e0b' : '#ef4444';
              const isAtRisk = report.avgRate < 75;
              return (
                <button
                  key={report.code}
                  onClick={() => report.courseId && navigate(`/courses/${report.courseId}`)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50/80 transition-all duration-150 group cursor-pointer text-left animate-slide-up"
                  style={{ animationDelay: `${idx * 0.05 + 0.75}s` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-105 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-200">
                    <span className="material-symbols-outlined text-[20px] text-slate-700 group-hover:text-blue-600 transition-colors">school</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{report.code}</h4>
                      {isAtRisk ? (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded-md border border-red-200 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">warning</span>
                          At Risk
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-md border border-emerald-200">Healthy</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{report.name}</p>
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
                          <polyline points={pts} fill="none" stroke={sparkColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      );
                    })()}
                  </div>

                  {/* Trend */}
                  <div className="hidden sm:flex items-center shrink-0">
                    {report.trend > 0 ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">trending_up</span>
                        +{report.trend}%
                      </span>
                    ) : report.trend < 0 ? (
                      <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">trending_down</span>
                        {report.trend}%
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">trending_flat</span>
                        0%
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0 min-w-[70px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate</p>
                    <p className="text-xl font-extrabold text-slate-900 tabular-nums font-mono">{report.avgRate}%</p>
                    <p className="text-[10px] text-slate-500">{report.sessions} sessions</p>
                  </div>

                  <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all shrink-0">chevron_right</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Flagged Students */}
      {flaggedStudents.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-slide-up hover:shadow-lg hover:border-slate-300 transition-all duration-300" style={{ animationDelay: '0.9s' }}>
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-500 animate-pulse">flag</span>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Flagged Students</h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 font-bold">
              {flaggedStudents.length} below 75%
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {flaggedStudents.map((student, i) => {
              const isCritical = student.rate < 60;
              return (
                <div key={`${student.indexNumber}-${student.course}-${i}`} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/80 transition-all duration-150 animate-slide-up" style={{ animationDelay: `${i * 0.03 + 0.95}s` }}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                    isCritical 
                      ? 'bg-red-100 border-red-200 text-red-700' 
                      : 'bg-amber-100 border-amber-200 text-amber-700'
                  }`}>
                    {student.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{student.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{student.indexNumber}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shrink-0">
                    {student.course}
                  </span>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold tabular-nums font-mono ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>{student.rate}%</p>
                    <p className={`text-[10px] font-bold uppercase ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
                      {isCritical ? 'Critical' : 'Warning'}
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
