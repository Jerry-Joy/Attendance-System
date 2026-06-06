import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { api, mapCourse } from "../lib/api";
import type { Course } from "../types";

export default function Courses() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, deleteCourse, updateCourse, pastSessions, activeSession } = useData();
  const { lecturer } = useAuth();

  const [view, setView] = useState<'list' | 'grid'>(() => {
    try { const s = localStorage.getItem('corescan_view'); if (s === 'grid' || s === 'list') return s; } catch { }
    return 'grid';
  });
  const handleSetView = (v: 'list' | 'grid') => { setView(v); try { localStorage.setItem('corescan_view', v); } catch { } };

  const [openMenu, setOpenMenu] = useState<{ id: string; rect: DOMRect } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editScheduleDay, setEditScheduleDay] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  // Helper function to check if class is currently in progress
  const getClassStatus = (schedule?: string) => {
    if (!schedule) return null;
    
    try {
      const parts = schedule.split(',');
      if (parts.length < 2) return null;
      
      const dayName = parts[0].trim();
      const timeRange = parts[1].trim();
      const [startTimePart, endTimePart] = timeRange.split('-').map(t => t.trim());
      
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      if (dayName !== currentDay) return null;
      
      const [startHours, startMinutes] = startTimePart.split(':').map(Number);
      const scheduledStartTime = startHours * 60 + startMinutes;
      
      const [endHours, endMinutes] = endTimePart.split(':').map(Number);
      const scheduledEndTime = endHours * 60 + endMinutes;
      
      // Check if class is currently in progress
      if (currentTime >= scheduledStartTime && currentTime < scheduledEndTime) {
        const minutesRemaining = scheduledEndTime - currentTime;
        return { isLive: true, minutesRemaining };
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const openEditModal = (course: Course) => {
    setEditCode(course.code);
    setEditName(course.name);
    setEditVenue(course.venueName || '');
    setEditLevel(course.level || '');
    
    // Parse schedule if it exists: "Monday, 09:00 - 10:30"
    if (course.schedule) {
      const parts = course.schedule.split(',');
      if (parts.length >= 2) {
        setEditScheduleDay(parts[0].trim());
        const timeRange = parts[1].trim();
        const times = timeRange.split('-').map(t => t.trim());
        if (times.length >= 2) {
          setEditStartTime(times[0]);
          setEditEndTime(times[1]);
        }
      }
    } else {
      setEditScheduleDay('');
      setEditStartTime('');
      setEditEndTime('');
    }
    
    setEditTarget(course);
    setOpenMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editTarget || editCode.trim().length < 3 || editName.trim().length < 3) return;
    try {
      const result = await api.updateCourse(editTarget.id, {
        courseCode: editCode.trim().toUpperCase(),
        courseName: editName.trim(),
        venue: editVenue.trim() || undefined,
        level: editLevel || undefined,
        dayOfWeek: editScheduleDay || undefined,
        startTime: editStartTime || undefined,
        endTime: editEndTime || undefined,
      });
      const mapped = mapCourse(result);
      updateCourse(editTarget.id, mapped);
    } catch { /* ignore */ }
    setEditTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteCourse(deleteTarget.id);
      deleteCourse(deleteTarget.id);
    } catch { /* ignore */ }
    setDeleteTarget(null);
  };

  // Check for edit query parameter and open modal automatically
  useEffect(() => {
    const editCourseId = searchParams.get('edit');
    if (editCourseId && courses.length > 0) {
      const courseToEdit = courses.find(c => c.id === editCourseId);
      if (courseToEdit) {
        openEditModal(courseToEdit);
        // Remove the query parameter to clean up the URL
        setSearchParams({});
      }
    }
  }, [searchParams, courses]);

  const totalStudents = courses.reduce((acc, c) => acc + c.studentCount, 0);
  const totalSessions = pastSessions.length;

  // Course analytics from past sessions
  const courseAnalytics = useMemo(() => {
    const grouped: Record<string, { sum: number; count: number; latestRate: number | null; previousRate: number | null }> = {};
    for (const s of pastSessions) {
      const rate = s.totalStudents > 0 ? (s.presentCount / s.totalStudents) * 100 : 0;
      if (!grouped[s.courseCode]) grouped[s.courseCode] = { sum: 0, count: 0, latestRate: null, previousRate: null };
      if (grouped[s.courseCode].latestRate === null) grouped[s.courseCode].latestRate = rate;
      else if (grouped[s.courseCode].previousRate === null) grouped[s.courseCode].previousRate = rate;
      grouped[s.courseCode].sum += rate;
      grouped[s.courseCode].count += 1;
    }
    const result: Record<string, { progress: number; trendDelta: number | null; sessionCount: number }> = {};
    Object.entries(grouped).forEach(([code, v]) => {
      result[code] = {
        progress: Math.round(v.sum / v.count),
        trendDelta: v.latestRate !== null && v.previousRate !== null ? Math.round(v.latestRate - v.previousRate) : null,
        sessionCount: v.count,
      };
    });
    return result;
  }, [pastSessions]);

  const getProgress = (code: string) => courseAnalytics[code]?.progress ?? 0;
  const getTrendDelta = (code: string) => courseAnalytics[code]?.trendDelta ?? null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Welcome back,</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">{lecturer?.name ?? 'Prof. Adeyemi'}</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-lg">
            <button 
              onClick={() => handleSetView('grid')} 
              className={`p-2 rounded transition-all ${view === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button 
              onClick={() => handleSetView('list')} 
              className={`p-2 rounded transition-all ${view === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="List"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
          <button 
            onClick={() => navigate('/courses/create')} 
            className="font-extrabold text-[11px] uppercase tracking-wide px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:shadow-md hover:-translate-y-0.5" 
            style={{ backgroundColor: "#F5B41C", color: "#000" }}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Course
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Courses', value: String(courses.length).padStart(2, '0'), icon: 'school' },
          { label: 'Total Students', value: String(totalStudents).padStart(2, '0'), icon: 'groups' },
          { label: 'Total Sessions', value: String(totalSessions).padStart(2, '0'), icon: 'schedule' },
          { label: 'Blockchain\nRecords', value: '1.2k', icon: 'link' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col animate-slide-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-pre-line leading-relaxed">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-slate-700">{stat.icon}</span>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tabular-nums">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Course Section Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide">Active Courses</h2>
        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-md">{courses.length}</span>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const progress = getProgress(course.code);
            const trend = getTrendDelta(course.code);
            const isLive = activeSession?.courseId === course.id;
            const classStatus = getClassStatus(course.schedule);
            const isInProgress = classStatus?.isLive && !isLive; // In progress but no active session
            
            return (
              <div 
                key={course.id} 
                className={`rounded-2xl border overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up ${
                  isLive ? 'bg-emerald-50 border-emerald-200' :
                  isInProgress ? 'bg-amber-50 border-amber-200' :
                  'bg-white border-slate-200'
                }`}
                style={{ animationDelay: `${idx * 0.1 + 0.4}s` }}
              >
                {/* Dark Navy Header */}
                <div className="h-28 relative flex items-end p-5" style={{ backgroundColor: "#1a2332" }}>
                  {/* Status Badge */}
                  {(isLive || isInProgress) && (
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isLive ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-white' : 'bg-white'} animate-pulse`}></div>
                      {isLive ? 'Live Session' : `In Progress (${classStatus?.minutesRemaining}m left)`}
                    </div>
                  )}
                  
                  <div className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: "#F5B41C", color: "#000" }}>
                    {course.code}
                  </div>
                </div>

                {/* White Body */}
                <div className="p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {course.name}
                    {course.level && <span className="text-sm font-normal text-slate-500 ml-2">• {course.level}</span>}
                  </h3>

                  {/* Attendance Rate */}
                  <div className="mt-6 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
                      <span className="text-sm font-extrabold text-slate-900">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%`, backgroundColor: "#1a2332" }}
                      />
                    </div>
                    {trend !== null && trend !== 0 && (
                      <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        <span className="material-symbols-outlined text-[12px]">{trend > 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                        {Math.abs(trend)}% VS PREV
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="material-symbols-outlined text-[16px]">key</span>
                      <span className="font-bold">{course.joinCode}</span>
                    </div>
                    {course.schedule && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span className="font-semibold">{course.schedule}</span>
                      </div>
                    )}
                    {course.venueName && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                        <span>{course.venueName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-slate-900">
                      <span className="material-symbols-outlined text-[16px]">groups</span>
                      <span className="font-bold">{course.studentCount} Enrolled</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wide transition-all hover:shadow-md hover:-translate-y-0.5 bg-slate-900 text-white hover:bg-slate-800"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      View Details
                    </button>
                    <button 
                      onClick={() => navigate(`/session/create?course=${course.id}`)}
                      className="p-2.5 rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5"
                      style={{ backgroundColor: "#F5B41C", color: "#000" }}
                      title="Start Session"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    </button>
                    <button 
                      onClick={(e) => setOpenMenu(openMenu?.id === course.id ? null : { id: course.id, rect: e.currentTarget.getBoundingClientRect() })}
                      className="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="flex flex-col gap-3">
          {courses.map((course) => {
            const progress = getProgress(course.code);
            const trend = getTrendDelta(course.code);
            const isLive = activeSession?.courseId === course.id;
            const classStatus = getClassStatus(course.schedule);
            const isInProgress = classStatus?.isLive && !isLive;
            
            return (
              <div key={course.id} className={`bg-white rounded-lg border hover:border-slate-300 transition-colors relative ${
                isLive ? 'border-emerald-500/50' : 
                isInProgress ? 'border-amber-500/50 bg-amber-50/30' :
                'border-slate-200'
              }`}>
                {isLive && (
                  <div className="absolute -top-2 left-6 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-bold text-emerald-400 uppercase tracking-wider z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    Live Session
                  </div>
                )}
                {isInProgress && !isLive && (
                  <div className="absolute -top-2 left-6 flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[9px] font-bold text-amber-600 uppercase tracking-wider z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                    In Progress ({classStatus?.minutesRemaining}m left)
                  </div>
                )}
                <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900">
                      {course.code}: {course.name}
                      {course.level && <span className="text-xs font-normal text-slate-500 ml-2">• {course.level}</span>}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-500 font-mono uppercase">
                      <div className="flex items-center gap-1" style={{ color: "#0D2A66" }}>
                        <span className="material-symbols-outlined text-[12px]">key</span>
                        <span className="font-bold">{course.joinCode}</span>
                      </div>
                      {course.venueName && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">meeting_room</span>
                          {course.venueName}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                        {course.lastSession}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono shrink-0" style={{ color: "#081637", backgroundColor: "rgba(8,22,55,0.08)", border: "1px solid rgba(8,22,55,0.15)" }}>{course.level}</span>
                  <div className="shrink-0 w-36">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Rate</span>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700`} style={{ width: `${progress}%`, backgroundColor: progress >= 70 ? "#081637" : "#F5B41C" }} />
                    </div>
                    {trend !== null && (
                      <span className={`text-[9px] font-mono uppercase mt-1 inline-flex items-center gap-0.5 ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[10px]">{trend > 0 ? 'trending_up' : trend < 0 ? 'trending_down' : 'trending_flat'}</span>
                        {trend > 0 ? `+${trend}%` : `${trend}%`}
                      </span>
                    )}
                  </div>
                  <div className="shrink-0 text-center w-16">
                    <p className="text-lg font-bold text-slate-900 tabular-nums">{course.studentCount}</p>
                    <p className="text-[9px] text-slate-500 font-mono uppercase">Students</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => navigate(`/courses/${course.id}`)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold uppercase transition-all hover:bg-slate-800 hover:shadow-md"
                    >
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      View
                    </button>
                    {isLive ? (
                      <button onClick={() => navigate('/session/active')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold uppercase transition-colors hover:bg-emerald-500/20">
                        <span className="material-symbols-outlined text-[14px]">radio_button_checked</span>
                        Rejoin
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/session/create?course=${course.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-opacity hover:opacity-90" style={{ backgroundColor: "#F5B41C", color: "#081637" }}>
                        <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                        Start
                      </button>
                    )}
                    <div>
                      <button onClick={(e) => setOpenMenu(openMenu?.id === course.id ? null : { id: course.id, rect: e.currentTarget.getBoundingClientRect() })} className="p-1.5 border border-slate-200 rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {courses.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-300">
            <span className="material-symbols-outlined text-[24px] text-slate-500">school</span>
          </div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-2">No Courses</h2>
          <p className="text-[10px] text-slate-500 max-w-sm mx-auto font-mono uppercase leading-relaxed mb-4">Create your first course to start tracking attendance.</p>
          <button onClick={() => navigate('/courses/create')} className="font-bold text-[10px] uppercase tracking-wider px-5 py-2 rounded transition-opacity hover:opacity-90" style={{ backgroundColor: "#F5B41C", color: "#081637" }}>Create First Course</button>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Edit Course Details</h2>
              <button 
                onClick={() => setEditTarget(null)} 
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-400">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Course Code and Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Course Code
                  </label>
                  <input 
                    value={editCode} 
                    onChange={e => setEditCode(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Level
                  </label>
                  <select 
                    value={editLevel} 
                    onChange={e => setEditLevel(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] transition-all appearance-none cursor-pointer"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23F5B41C' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select Level</option>
                    <option value="Level 100">Level 100</option>
                    <option value="Level 200">Level 200</option>
                    <option value="Level 300">Level 300</option>
                    <option value="Level 400">Level 400</option>
                  </select>
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Course Name
                </label>
                <input 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all"
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Venue / Room
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">location_on</span>
                  <input 
                    value={editVenue} 
                    onChange={e => setEditVenue(e.target.value)} 
                    placeholder="e.g. Block C, Room 302"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Schedule Information */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Schedule</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Day
                    </label>
                    <select 
                      value={editScheduleDay} 
                      onChange={e => setEditScheduleDay(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all appearance-none cursor-pointer"
                      style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23F5B41C' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Start Time
                    </label>
                    <input 
                      type="time"
                      value={editStartTime} 
                      onChange={e => setEditStartTime(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      End Time
                    </label>
                    <input 
                      type="time"
                      value={editEndTime} 
                      onChange={e => setEditEndTime(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
                <button 
                  onClick={() => setEditTarget(null)} 
                  className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className="px-6 py-2.5 text-sm font-bold text-slate-900 rounded-lg transition-all hover:shadow-lg"
                  style={{ backgroundColor: "#F5B41C" }}
                >
                  SAVE CHANGES
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <span className="material-symbols-outlined text-[24px] text-red-400">warning</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 text-center uppercase tracking-wider mb-2">Delete Course?</h3>
            <p className="text-[10px] text-slate-600 text-center font-mono uppercase mb-6">This will permanently remove {deleteTarget.code} and all associated records.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200 rounded hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-red-600 rounded border border-red-500/50 hover:bg-red-500 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Global Dropdown Menu */}
      {openMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
          {(() => {
            const course = courses.find(c => c.id === openMenu.id);
            if (!course) return null;
            const menuWidth = 176;
            const menuHeight = 116;
            let top = openMenu.rect.bottom + 4;
            let left = openMenu.rect.right - menuWidth;
            if (top + menuHeight > window.innerHeight) {
              top = openMenu.rect.top - menuHeight - 4;
            }
            if (left < 10) left = 10;
            return (
              <div 
                className="fixed bg-white rounded-lg border border-slate-300 shadow-2xl z-50 py-1"
                style={{ top, left, width: menuWidth }}
              >
                <button onClick={() => { setOpenMenu(null); navigate(`/courses/${course.id}/students`); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">person_add</span>
                  Manage Students
                </button>
                <button onClick={() => openEditModal(course)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">edit</span>
                  Edit Course
                </button>
                <div className="my-1 border-t border-slate-200" />
                <button onClick={() => { setDeleteTarget(course); setOpenMenu(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  Delete Course
                </button>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
