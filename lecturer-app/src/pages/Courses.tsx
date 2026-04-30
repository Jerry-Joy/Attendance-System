import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { api, mapCourse } from "../lib/api";
import type { Course } from "../types";

export default function Courses() {
  const navigate = useNavigate();
  const { courses, deleteCourse, updateCourse, pastSessions, activeSession } = useData();
  const { lecturer } = useAuth();

  const [view, setView] = useState<'list' | 'grid'>(() => {
    try { const s = localStorage.getItem('corescan_view'); if (s === 'grid' || s === 'list') return s; } catch { }
    return 'grid';
  });
  const handleSetView = (v: 'list' | 'grid') => { setView(v); try { localStorage.setItem('corescan_view', v); } catch { } };

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editVenue, setEditVenue] = useState('');

  const openEditModal = (course: Course) => {
    setEditCode(course.code);
    setEditName(course.name);
    setEditVenue(course.venueName || '');
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
      });
      const mapped = mapCourse(result);
      updateCourse(editTarget.id, { code: mapped.code, name: mapped.name, venueName: mapped.venueName });
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Welcome back,</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">{lecturer?.name ?? 'Operator'}</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            <button onClick={() => handleSetView('list')} className={`p-1.5 rounded transition-all ${view === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`} title="List">
              <span className="material-symbols-outlined text-[16px]">view_list</span>
            </button>
            <button onClick={() => handleSetView('grid')} className={`p-1.5 rounded transition-all ${view === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`} title="Grid">
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
            </button>
          </div>
          <button onClick={() => navigate('/courses/create')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.2)] cursor-pointer border border-blue-500/50">
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Course
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Courses', value: courses.length, icon: 'school', accent: 'blue' },
          { label: 'Total Students', value: totalStudents, icon: 'groups', accent: 'amber' },
          { label: 'Total Sessions', value: totalSessions, icon: 'history', accent: 'emerald' },
          { label: 'Blockchain Records', value: '1.2k', icon: 'link', accent: 'indigo' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-300 dark:border-slate-700 transition-colors">
            <div className={`absolute -right-4 -top-4 w-16 h-16 bg-${stat.accent}-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
            <div className="text-[10px] text-slate-500 font-mono uppercase flex justify-between items-center relative z-10">
              <span>{stat.label}</span>
              <span className="material-symbols-outlined text-[14px]">{stat.icon}</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums relative z-10">{typeof stat.value === 'number' ? String(stat.value).padStart(2, '0') : stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Course Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Courses</h2>
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold font-mono rounded border border-slate-300 dark:border-slate-700">{courses.length}</span>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const progress = getProgress(course.code);
            const trend = getTrendDelta(course.code);
            const isLive = activeSession?.courseId === course.id;
            return (
              <div key={course.id} className={`bg-white dark:bg-[#15181E] rounded-lg border overflow-hidden group flex flex-col hover:border-slate-300 dark:border-slate-700 transition-colors relative ${isLive ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'}`}>
                {isLive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-bold text-emerald-400 uppercase tracking-wider z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                    Live
                  </div>
                )}
                <div className="h-20 bg-gradient-to-r from-blue-50 via-white to-slate-100 dark:from-blue-900/40 dark:via-slate-900/70 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-end relative">
                  <div className="absolute top-4 left-4 bg-white/70 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded text-blue-700 dark:text-blue-400 text-[10px] font-bold font-mono uppercase tracking-wider">
                    {course.code}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-1 line-clamp-2">{course.name}</h2>
                  <span className="text-[10px] text-slate-500 font-mono uppercase mb-4">{course.level}</span>

                  {/* Attendance Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Attendance Rate</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${progress >= 85 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]' : progress >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }} />
                    </div>
                    {trend !== null && (
                      <div className={`mt-1.5 flex items-center gap-1 text-[9px] font-mono uppercase ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[10px]">{trend > 0 ? 'trending_up' : trend < 0 ? 'trending_down' : 'trending_flat'}</span>
                        {trend > 0 ? `+${trend}%` : `${trend}%`} vs prev
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 text-[10px] uppercase font-mono text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <span className="material-symbols-outlined text-[14px]">key</span>
                      <span className="font-bold">{course.joinCode}</span>
                    </div>
                    {course.venueName && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                        <span>{course.venueName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="material-symbols-outlined text-[14px]">groups</span>
                      <span>{course.studentCount} Enrolled</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    {isLive ? (
                      <button onClick={() => navigate('/session/active')} className="flex-1 flex justify-center items-center gap-1.5 uppercase tracking-wider bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-bold text-[10px] py-2 rounded transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[14px]">radio_button_checked</span>
                        Rejoin
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/session/create?course=${course.id}`)} className="flex-1 flex justify-center items-center gap-1.5 uppercase tracking-wider bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/30 font-bold text-[10px] py-2 rounded transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                        Start Session
                      </button>
                    )}
                    <button onClick={() => navigate(`/courses/${course.id}/students`)} className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">groups</span>
                    </button>
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)} className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                      </button>
                      {openMenu === course.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#15181E] rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xl z-50 py-1">
                          <button onClick={() => { setOpenMenu(null); navigate(`/courses/${course.id}/students`); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-[14px] text-slate-500">person_add</span>
                            Manage Students
                          </button>
                          <button onClick={() => openEditModal(course)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-[14px] text-slate-500">edit</span>
                            Edit Course
                          </button>
                          <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                          <button onClick={() => { setDeleteTarget(course); setOpenMenu(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            Delete Course
                          </button>
                        </div>
                      )}
                    </div>
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
            return (
              <div key={course.id} className={`bg-white dark:bg-[#15181E] rounded-lg border hover:border-slate-300 dark:border-slate-700 transition-colors relative ${isLive ? 'border-emerald-500/50' : 'border-slate-200 dark:border-slate-800'}`}>
                {isLive && (
                  <div className="absolute -top-2 left-6 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-bold text-emerald-400 uppercase tracking-wider z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    Live
                  </div>
                )}
                <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{course.code}: {course.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-500 font-mono uppercase">
                      <div className="flex items-center gap-1 text-blue-400">
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
                  <span className="px-2 py-0.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 rounded border border-blue-500/20 uppercase font-mono shrink-0">{course.level}</span>
                  <div className="shrink-0 w-36">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Rate</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${progress >= 85 ? 'bg-emerald-500' : progress >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }} />
                    </div>
                    {trend !== null && (
                      <span className={`text-[9px] font-mono uppercase mt-1 inline-flex items-center gap-0.5 ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[10px]">{trend > 0 ? 'trending_up' : trend < 0 ? 'trending_down' : 'trending_flat'}</span>
                        {trend > 0 ? `+${trend}%` : `${trend}%`}
                      </span>
                    )}
                  </div>
                  <div className="shrink-0 text-center w-16">
                    <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{course.studentCount}</p>
                    <p className="text-[9px] text-slate-500 font-mono uppercase">Students</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isLive ? (
                      <button onClick={() => navigate('/session/active')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold uppercase transition-colors hover:bg-emerald-500/20">
                        <span className="material-symbols-outlined text-[14px]">radio_button_checked</span>
                        Rejoin
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/session/create?course=${course.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-bold uppercase transition-colors hover:bg-slate-700 hover:text-blue-400 hover:border-blue-500/30">
                        <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                        Start
                      </button>
                    )}
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)} className="p-1.5 border border-slate-200 dark:border-slate-800 rounded text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                      </button>
                      {openMenu === course.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#15181E] rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xl z-50 py-1">
                          <button onClick={() => { setOpenMenu(null); navigate(`/courses/${course.id}/students`); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-[14px] text-slate-500">person_add</span>
                            Manage Students
                          </button>
                          <button onClick={() => openEditModal(course)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-[14px] text-slate-500">edit</span>
                            Edit Course
                          </button>
                          <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                          <button onClick={() => { setDeleteTarget(course); setOpenMenu(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            Delete Course
                          </button>
                        </div>
                      )}
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
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-300 dark:border-slate-700/50">
            <span className="material-symbols-outlined text-[24px] text-slate-500">school</span>
          </div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2">No Courses</h2>
          <p className="text-[10px] text-slate-500 max-w-sm mx-auto font-mono uppercase leading-relaxed mb-4">Create your first course to start tracking attendance.</p>
          <button onClick={() => navigate('/courses/create')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider px-5 py-2 rounded transition-colors border border-blue-500/50">Create First Course</button>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0D11]/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Edit Course Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Course Code</label>
                <input value={editCode} onChange={e => setEditCode(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Course Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Venue</label>
                <input value={editVenue} onChange={e => setEditVenue(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditTarget(null)} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white bg-blue-600 rounded border border-blue-500/50 hover:bg-blue-500 transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0D11]/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <span className="material-symbols-outlined text-[24px] text-red-400">warning</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white text-center uppercase tracking-wider mb-2">Delete Course?</h3>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 text-center font-mono uppercase mb-6">This will permanently remove {deleteTarget.code} and all associated records.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white bg-red-600 rounded border border-red-500/50 hover:bg-red-500 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
