import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from "../context/DataContext";
import type { EnrolledStudent } from "../types";
import { CustomSelect } from "../components/CustomSelect";
import { Filter } from "lucide-react";
import { exportExcelCsv, formatStudentIdForExcel } from "../lib/csvExport";

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
      let matchesPeriod = true;
      if (periodFilter === 'week') {
        const idx = pastSessions.indexOf(session);
        matchesPeriod = idx < 3;
      } else if (periodFilter === 'month') {
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
  const totalCheckins = filtered.reduce((a, s) => a + s.presentCount, 0);

  // Chart data from filtered sessions (reversed for chronological order)
  const chartData = useMemo(() => {
    return [...filtered].reverse().map(s => ({
      name: s.date.replace(/,?\s*2026/, '').trim(),
      rate: Math.round((s.presentCount / s.totalStudents) * 100),
      present: s.presentCount,
      total: s.totalStudents,
      absent: Math.max(s.totalStudents - s.presentCount, 0),
    }));
  }, [filtered]);

  // All relevant students for academic standing calculation
  const allEnrolledList = useMemo(() => {
    const list: { name: string; indexNumber: string; courseCode: string; rate: number; avatarInitials: string }[] = [];
    Object.entries(enrolledStudents).forEach(([courseId, students]: [string, EnrolledStudent[]]) => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      if (courseFilter !== 'all' && course.code !== courseFilter) return;
      students.forEach(s => {
        list.push({
          name: s.name,
          indexNumber: s.indexNumber,
          courseCode: course.code,
          rate: s.attendanceRate,
          avatarInitials: s.avatarInitials,
        });
      });
    });
    return list;
  }, [enrolledStudents, courses, courseFilter]);

  // Academic Standing Breakdown (GCTU 75% Rule)
  const standingStats = useMemo(() => {
    const total = allEnrolledList.length;
    if (total === 0) return { good: 0, warning: 0, critical: 0, goodPct: 0, warningPct: 0, criticalPct: 0, total: 0 };
    const good = allEnrolledList.filter(s => s.rate >= 75).length;
    const warning = allEnrolledList.filter(s => s.rate >= 60 && s.rate < 75).length;
    const critical = allEnrolledList.filter(s => s.rate < 60).length;
    return {
      good,
      warning,
      critical,
      goodPct: Math.round((good / total) * 100),
      warningPct: Math.round((warning / total) * 100),
      criticalPct: Math.round((critical / total) * 100),
      total,
    };
  }, [allEnrolledList]);

  // Flagged students — attendance below 75%
  const flaggedStudents = useMemo(() => {
    return allEnrolledList
      .filter(s => s.rate < 75)
      .sort((a, b) => a.rate - b.rate);
  }, [allEnrolledList]);

  // Per-course performance
  const coursePerformance = useMemo(() => {
    const grouped: Record<string, { name: string; rates: number[]; totalPresent: number[]; sessions: number }> = {};
    filtered.forEach(s => {
      if (!grouped[s.courseCode]) grouped[s.courseCode] = { name: s.courseName, rates: [], totalPresent: [], sessions: 0 };
      const g = grouped[s.courseCode];
      g.rates.push(s.totalStudents > 0 ? Math.round((s.presentCount / s.totalStudents) * 100) : 0);
      g.totalPresent.push(s.presentCount);
      g.sessions++;
    });
    return Object.entries(grouped).map(([code, g]) => {
      const avgRate = Math.round(g.rates.reduce((a, b) => a + b, 0) / g.rates.length);
      const sparkData = g.rates.slice().reverse();
      const trend = sparkData.length >= 2 ? sparkData[sparkData.length - 1] - sparkData[sparkData.length - 2] : 0;
      const courseObj = courses.find(c => c.code === code);
      return { code, name: g.name, avgRate, sessions: g.sessions, sparkData, trend, courseId: courseObj?.id };
    });
  }, [filtered, courses]);

  // Export Complete CSV
  const handleExportAll = () => {
    exportExcelCsv({
      title: 'Institutional Attendance & Analytics Report',
      metaSummary: {
        'Filtered Course': courseFilter === 'all' ? 'All Registered Courses' : courseFilter,
        'Period Scope': periodFilter === 'all' ? 'All Time History' : periodFilter === 'week' ? 'This Active Week' : 'This Active Month',
        'Average Turnout': `${avgAttendance}%`,
        'Total Sessions Conducted': totalSessions,
        'Total Verified Check-Ins': totalCheckins,
        'At-Risk Students': `${flaggedStudents.length} Students`,
      },
      headers: ['#', 'Course Code', 'Lecture Date', 'Start Time', 'End Time', 'Duration', 'Present Turnout', 'Total Enrolled', 'Attendance Rate', 'Lecture Venue'],
      rows: filtered.map((s, idx) => [
        idx + 1,
        s.courseCode,
        s.date,
        s.startTime,
        s.endTime,
        s.duration,
        s.presentCount,
        s.totalStudents,
        `${Math.round((s.presentCount / s.totalStudents) * 100)}%`,
        s.venue || 'Main Aud',
      ]),
      filename: `GCTU_Attendance_Report_${courseFilter}_${periodFilter}`,
    });
  };

  // Export At-Risk List
  const handleExportAtRisk = () => {
    exportExcelCsv({
      title: 'Academic Standing Notice — At-Risk Students Below 75% Threshold',
      metaSummary: {
        'Course Scope': courseFilter === 'all' ? 'All Courses' : courseFilter,
        'Total At-Risk Count': `${flaggedStudents.length} Students`,
        'GCTU Exam Policy': 'Mandatory 75% Minimum Attendance Required for Semester Examination Eligibility',
      },
      headers: ['#', 'Student Full Name', 'Student ID / Index No.', 'Course Code', 'Attendance Rate', 'GCTU Academic Standing'],
      rows: flaggedStudents.map((s, idx) => [
        idx + 1,
        s.name,
        formatStudentIdForExcel(s.indexNumber),
        s.courseCode,
        `${s.rate}%`,
        s.rate < 60 ? 'Critical (Barred from Exam)' : 'Warning (Below 75%)',
      ]),
      filename: `GCTU_At_Risk_Students_${courseFilter}`,
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-secondary">insights</span>
            Reports & Analytics
          </h1>
          <p className="text-[11px] text-slate-600 font-medium tracking-wide mt-0.5">
            Institutional Attendance Insights & Exam Eligibility Analytics
          </p>
        </div>
        <button
          onClick={handleExportAll}
          className="font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 hover:shadow-md hover:brightness-105 active:scale-95 cursor-pointer bg-secondary text-primary font-sans"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export Full Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 relative z-30 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Course filter */}
          <div className="w-full sm:w-72">
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
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {([['week', 'This Week'], ['month', 'This Month'], ['all', 'All Time']] as [PeriodFilter, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriodFilter(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  periodFilter === key
                    ? 'bg-[#081637] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Active filter tags */}
          {(courseFilter !== 'all' || periodFilter !== 'all') && (
            <div className="flex items-center gap-2 ml-0 sm:ml-auto">
              {courseFilter !== 'all' && (
                <button
                  onClick={() => setCourseFilter('all')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#081637] text-white rounded-md text-xs font-bold uppercase transition-all hover:bg-[#081637]/90 active:scale-95"
                >
                  {courseFilter} <span className="text-slate-400">×</span>
                </button>
              )}
              {periodFilter !== 'all' && (
                <button
                  onClick={() => setPeriodFilter('all')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#081637] text-white rounded-md text-xs font-bold uppercase transition-all hover:bg-[#081637]/90 active:scale-95"
                >
                  {periodFilter === 'week' ? 'This Week' : 'This Month'} <span className="text-slate-400">×</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4 Academic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Average Attendance */}
        <div className="bg-[#081637] text-white rounded-2xl p-5 border border-[#081637] shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-1">Avg. Attendance</p>
            <p className="text-3xl font-black text-white">{avgAttendance}%</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              across {totalSessions} session{totalSessions !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined text-[24px] text-secondary">trending_up</span>
          </div>
        </div>

        {/* KPI 2: Total Sessions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sessions Held</p>
            <p className="text-3xl font-black text-slate-900">{totalSessions}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {periodFilter === 'all' ? 'All recorded history' : periodFilter === 'week' ? 'This active week' : 'This active month'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-slate-700">event_note</span>
          </div>
        </div>

        {/* KPI 3: Total Recorded Check-ins */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Check-Ins</p>
            <p className="text-3xl font-black text-emerald-700">{totalCheckins}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Individual sign-ins verified</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-emerald-600">how_to_reg</span>
          </div>
        </div>

        {/* KPI 4: Students At Risk */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">At-Risk Students</p>
            <p className={`text-3xl font-black ${flaggedStudents.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {flaggedStudents.length}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Below 75% exam requirement</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${flaggedStudents.length > 0 ? 'bg-rose-50' : 'bg-slate-100'}`}>
            <span className={`material-symbols-outlined text-[24px] ${flaggedStudents.length > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              warning
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Standing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Attendance Trajectory Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Attendance Trajectory</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chronological class attendance performance</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {chartData.length} Data Points
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">query_stats</span>
              <p className="text-xs font-semibold uppercase tracking-wider">No session data for selected filters</p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRateReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#081637" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#081637" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[40, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#081637', borderRadius: '12px', border: 'none', padding: '12px 16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
                    itemStyle={{ color: '#F8FAFC', fontWeight: 600, fontSize: '12px' }}
                    labelStyle={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}
                    formatter={(value: number, name: string) => {
                      if (name === 'rate') return [`${value}%`, 'Attendance Rate'];
                      return [value, name];
                    }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#081637" strokeWidth={3} fillOpacity={1} fill="url(#colorRateReport)" animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Academic Exam Eligibility Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Exam Eligibility</h2>
              <p className="text-xs text-slate-500 mt-0.5">GCTU 75% Attendance Standing</p>
            </div>
            <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <span className="material-symbols-outlined text-[18px]">school</span>
            </span>
          </div>

          <div className="space-y-4">
            {/* Good Standing (>= 75%) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800">Good Standing (≥75%)</span>
                </div>
                <span className="font-mono font-bold text-emerald-700">{standingStats.good} ({standingStats.goodPct}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${standingStats.goodPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Eligible to sit for semester examinations</p>
            </div>

            {/* Warning (60-74%) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-slate-800">Warning (60%–74%)</span>
                </div>
                <span className="font-mono font-bold text-amber-700">{standingStats.warning} ({standingStats.warningPct}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${standingStats.warningPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Requires 1-2 more lectures to clear threshold</p>
            </div>

            {/* Critical (<60%) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-bold text-slate-800">Critical At Risk (&lt;60%)</span>
                </div>
                <span className="font-mono font-bold text-rose-700">{standingStats.critical} ({standingStats.criticalPct}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${standingStats.criticalPct}%` }} />
              </div>
              <p className="text-[10px] text-rose-600 font-semibold mt-1">In danger of being barred from exams</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mt-auto">
            <div className="flex items-center gap-2 text-slate-800 text-xs font-bold mb-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">policy</span>
              <span>Institutional Rule Notice</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Students falling below 75% attendance are automatically flagged and exported for academic counseling.
            </p>
          </div>
        </div>
      </div>

      {/* Course Performance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Course Performance Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any course row to open its full dashboard & session logs</p>
          </div>
          <span className="text-xs text-slate-700 font-bold px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
            {coursePerformance.length} Courses
          </span>
        </div>

        {coursePerformance.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">school</span>
            <p className="text-xs font-semibold">No courses match the active filter</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {coursePerformance.map((report) => {
              const sparkColor = report.avgRate >= 80 ? '#10b981' : report.avgRate >= 70 ? '#f59e0b' : '#ef4444';
              const isAtRisk = report.avgRate < 75;
              return (
                <button
                  key={report.code}
                  onClick={() => report.courseId && navigate(`/courses/${report.courseId}`)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#081637] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-secondary transition-colors">{report.code}</h4>
                      {isAtRisk ? (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase rounded-md border border-rose-200 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">warning</span>
                          Attention Needed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-md border border-emerald-200">
                          Healthy Standing
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{report.name}</p>
                  </div>

                  {/* Sparkline */}
                  <div className="hidden sm:block">
                    {report.sparkData.length >= 2 && (() => {
                      const data = report.sparkData;
                      const max = Math.max(...data), min = Math.min(...data);
                      const h = 28, w = 70, r = max - min || 1;
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
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        +{report.trend}%
                      </span>
                    ) : report.trend < 0 ? (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_down</span>
                        {report.trend}%
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_flat</span>
                        0%
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0 min-w-[80px]">
                    <p className="text-lg font-black text-slate-900 font-mono leading-none">{report.avgRate}%</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">{report.sessions} lecture{report.sessions !== 1 ? 's' : ''}</p>
                  </div>

                  <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all shrink-0">
                    chevron_right
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Flagged Students Card */}
      {flaggedStudents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <span className="material-symbols-outlined text-[18px]">person_alert</span>
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                  Flagged At-Risk Students ({flaggedStudents.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Students currently failing the 75% attendance threshold</p>
              </div>
            </div>

            <button
              onClick={handleExportAtRisk}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export At-Risk List</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {flaggedStudents.map((student, i) => {
              const isCritical = student.rate < 60;
              return (
                <div key={`${student.indexNumber}-${student.courseCode}-${i}`} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCritical 
                      ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {student.avatarInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{student.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{student.indexNumber}</p>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md shrink-0">
                    {student.courseCode}
                  </span>

                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black font-mono leading-none ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                      {student.rate}%
                    </p>
                    <p className={`text-[10px] font-bold uppercase mt-1 ${isCritical ? 'text-rose-500' : 'text-amber-600'}`}>
                      {isCritical ? 'Critical (<60%)' : 'Warning (60-74%)'}
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
