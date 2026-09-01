import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { api, mapCourse } from "../lib/api";
import type { Course } from "../types";
import { CustomSelect } from "../components/CustomSelect";
import { TimeSelect, timeToMinutes, minutesToTimeStr } from "../components/TimeSelect";
import { Search, X } from "lucide-react";
import { exportExcelCsv } from "../lib/csvExport";

const LEVEL_OPTIONS = [
  { value: 'Level 100', label: 'Level 100', badge: '1st Year' },
  { value: 'Level 200', label: 'Level 200', badge: '2nd Year' },
  { value: 'Level 300', label: 'Level 300', badge: '3rd Year' },
  { value: 'Level 400', label: 'Level 400', badge: 'Final Year' },
];

const DAY_OPTIONS = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
];

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, pastSessions, enrolledStudents, fetchStudents, updateCourse } = useData();
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionSearch, setSessionSearch] = useState("");
  const [downloading, setDownloading] = useState(false);

  // In-Place Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editScheduleDay, setEditScheduleDay] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const course = courses.find((c) => c.id === id) || courses[0];
  const sessions = pastSessions.filter((s) => s.courseCode === course?.code);
  const students = enrolledStudents[course?.id || ''] || [];

  // Fetch students for the course on mount
  useEffect(() => {
    if (course?.id) {
      fetchStudents(course.id);
    }
  }, [course?.id, fetchStudents]);

  const openEditModal = () => {
    if (!course) return;
    setEditCode(course.code);
    setEditName(course.name);
    setEditVenue(course.venueName || '');
    setEditLevel(course.level || '');
    
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
      } else {
        setEditScheduleDay('Monday');
        setEditStartTime('09:00');
        setEditEndTime('11:00');
      }
    } else {
      setEditScheduleDay('Monday');
      setEditStartTime('09:00');
      setEditEndTime('11:00');
    }
    setIsEditing(true);
  };

  const handleEditStartTimeChange = (newStart: string) => {
    setEditStartTime(newStart);
    const startMins = timeToMinutes(newStart);
    const endMins = timeToMinutes(editEndTime);
    if (!editEndTime || endMins <= startMins) {
      setEditEndTime(minutesToTimeStr(startMins + 120));
    }
  };

  const handleSaveEdit = async () => {
    if (!course || !editCode.trim() || !editName.trim()) return;
    setSavingEdit(true);
    try {
      const scheduleStr = editScheduleDay && editStartTime && editEndTime 
        ? `${editScheduleDay}, ${editStartTime} - ${editEndTime}`
        : course.schedule;
      
      const localUpdated: Partial<Course> = {
        code: editCode.trim().toUpperCase(),
        name: editName.trim(),
        venueName: editVenue.trim(),
        level: editLevel,
        schedule: scheduleStr,
      };

      try {
        const result = await api.updateCourse(course.id, {
          courseCode: editCode.trim().toUpperCase(),
          courseName: editName.trim(),
          venue: editVenue.trim() || undefined,
          level: editLevel || undefined,
          dayOfWeek: editScheduleDay || undefined,
          startTime: editStartTime || undefined,
          endTime: editEndTime || undefined,
        });
        if (result) {
          const mapped = mapCourse(result);
          updateCourse(course.id, mapped);
        } else {
          updateCourse(course.id, localUpdated);
        }
      } catch (apiErr) {
        console.warn("API update encountered an issue, applied local state update:", apiErr);
        updateCourse(course.id, localUpdated);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update course:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredSessions = useMemo(() => {
    if (!sessionSearch.trim()) return sessions;
    const q = sessionSearch.toLowerCase();
    return sessions.filter(
      (s) => s.date.toLowerCase().includes(q) || (s.venue && s.venue.toLowerCase().includes(q))
    );
  }, [sessions, sessionSearch]);

  const ROWS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / ROWS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSessions = filteredSessions.slice((safeCurrentPage - 1) * ROWS_PER_PAGE, safeCurrentPage * ROWS_PER_PAGE);

  const handleDownloadAll = () => {
    if (!course || sessions.length === 0) return;
    setDownloading(true);
    exportExcelCsv({
      title: 'Course Session Records & Turnout Log',
      courseCode: course.code,
      courseName: course.name,
      metaSummary: {
        'Academic Level': course.level || 'Not set',
        'Enrolled Class Size': `${students.length || course.studentCount} Students`,
        'Total Sessions Held': sessions.length,
        'Overall Course Average Attendance': `${overallRate}%`,
      },
      headers: ['#', 'Lecture Date', 'Start Time', 'Duration', 'Venue / Hall', 'Present Turnout', 'Absent Count', 'Total Students', 'Attendance Rate'],
      rows: sessions.map((s, idx) => [
        idx + 1,
        s.date,
        s.startTime,
        s.duration,
        s.venue || 'Main Aud',
        s.presentCount,
        s.absentCount,
        s.totalStudents,
        `${Math.round((s.presentCount / s.totalStudents) * 100)}%`,
      ]),
      filename: `${course.code.replace(/\s/g, '_')}_Session_Records`,
    });
    setTimeout(() => setDownloading(false), 800);
  };

  const overallRate = useMemo(() => {
    if (!sessions.length) return 0;
    const total = sessions.reduce((a, s) => a + (s.presentCount / s.totalStudents) * 100, 0);
    return Math.round(total / sessions.length);
  }, [sessions]);

  const standingSummary = useMemo(() => {
    if (!students.length) return { good: 0, warning: 0, critical: 0 };
    const good = students.filter(s => s.attendanceRate >= 75).length;
    const warning = students.filter(s => s.attendanceRate >= 60 && s.attendanceRate < 75).length;
    const critical = students.filter(s => s.attendanceRate < 60).length;
    return { good, warning, critical };
  }, [students]);

  if (!course) {
    return (
      <div className="flex flex-col gap-6 font-sans">
        <button onClick={() => navigate(-1)} className="text-xs text-slate-500 hover:text-slate-800 uppercase font-mono tracking-widest flex items-center gap-1 w-fit cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Go Back
        </button>
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-[36px] text-rose-500 mb-3">error</span>
          <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Course Not Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans animate-fade-in">
      {/* Top Hero Banner */}
      <div className="bg-[#081637] rounded-2xl p-6 lg:p-8 text-white shadow-md border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Left Info */}
        <div className="space-y-3 z-10 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => navigate('/courses')} 
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Back to All Courses"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <span className="px-3 py-1 bg-secondary text-primary font-black text-xs uppercase tracking-wider rounded-md font-mono">
              {course.code}
            </span>
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-secondary">school</span>
              {course.level || 'Level 300'}
            </span>
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-secondary">location_on</span>
              {course.venueName || 'Main Auditorium'}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">{course.name}</h1>

          {/* Metadata Row with Copyable Join Code */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
              <span>{course.schedule || 'Schedule Not Set'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">groups</span>
              <span>{course.studentCount} Students Enrolled</span>
            </div>
            <span>•</span>
            {/* Interactive Join Code Badge */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(course.joinCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-lg text-xs font-mono font-bold text-white transition-all active:scale-95 cursor-pointer"
              title="Click to copy join code for students"
            >
              <span className="text-slate-400">Code:</span>
              <span className="text-secondary tracking-widest">{course.joinCode}</span>
              <span className="material-symbols-outlined text-[14px]" style={{ color: copied ? '#10b981' : '#F5B41C' }}>
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied && <span className="text-[10px] text-emerald-400 uppercase font-sans">Copied!</span>}
            </button>
          </div>
        </div>

        {/* Right Hero Action Buttons */}
        <div className="flex flex-wrap lg:flex-col sm:flex-row items-stretch gap-2.5 z-10 shrink-0">
          <button
            onClick={() => navigate(`/session/create?course=${course.id}`)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold text-slate-950 flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-95 shadow-md cursor-pointer"
            style={{ backgroundColor: "#F5B41C" }}
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            <span>START SESSION</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={openEditModal}
              className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit</span>
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={downloading || sessions.length === 0}
              className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download all past session CSV records"
            >
              <span className="material-symbols-outlined text-[16px]">{downloading ? 'refresh' : 'download'}</span>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Average Attendance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Avg Attendance</p>
            <p className="text-3xl font-black" style={{ color: overallRate >= 75 ? '#081637' : '#e11d48' }}>
              {overallRate}%
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {overallRate >= 75 ? 'Above 75% threshold' : 'Below university target'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]" style={{ color: overallRate >= 75 ? '#10b981' : '#e11d48' }}>
              trending_up
            </span>
          </div>
        </div>

        {/* KPI 2: Sessions Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Sessions</p>
            <p className="text-3xl font-black text-slate-900">{sessions.length}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Conducted to date</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined text-[24px]">history</span>
          </div>
        </div>

        {/* KPI 3: Registered Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Enrolled Roster</p>
            <p className="text-3xl font-black text-slate-900">{students.length || course.studentCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Active class size</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined text-[24px]">groups</span>
          </div>
        </div>

        {/* KPI 4: Exam Eligibility Health */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Exam Eligibility</p>
            <p className="text-3xl font-black text-emerald-700">{standingSummary.good}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Students in good standing</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
        </div>
      </div>

      {/* 2-Column Main Workspace (7 : 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Session Records Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header & Search */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-700">event_available</span>
                Session History ({filteredSessions.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus-within:border-[#081637] focus-within:ring-2 focus-within:ring-[#081637]/10 transition-all w-full sm:w-64 shadow-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search date or venue..."
                value={sessionSearch}
                onChange={(e) => {
                  setSessionSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
              />
              {sessionSearch && (
                <button
                  onClick={() => setSessionSearch("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#081637] text-white">
                <tr>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Date & Time</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Venue</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Turnout</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Rate</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSessions.map((session) => {
                  const rate = Math.round((session.presentCount / session.totalStudents) * 100);
                  const isHealthy = rate >= 75;
                  return (
                    <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-slate-900">{session.date}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{session.startTime} · {session.duration}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-slate-600">
                        {session.venue || 'Main Aud'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {session.presentCount}
                        </span>
                        <span className="text-xs text-slate-400 font-mono"> / {session.totalStudents}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold font-mono ${isHealthy ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {rate}%
                          </span>
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                              style={{ width: `${rate}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => navigate('/session/summary', { state: { session } })}
                          className="px-3 py-1 bg-slate-100 hover:bg-[#081637] hover:text-white text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-slate-400">
                      <span className="material-symbols-outlined text-3xl mb-1 text-slate-300">calendar_today</span>
                      <p className="text-xs font-semibold text-slate-600">No session records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredSessions.length > ROWS_PER_PAGE && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {safeCurrentPage} of {totalPages} ({filteredSessions.length} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-md font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-md font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Student Roster & Attendance Health (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Enrolled Students Snapshot Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Enrolled Roster</h2>
                <p className="text-xs text-slate-500 mt-0.5">{students.length} registered students</p>
              </div>
              <button
                onClick={() => navigate(`/courses/${course.id}/roster`)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#081637] hover:text-secondary transition-colors cursor-pointer"
              >
                <span>Manage Roster</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Student Preview List */}
            <div className="divide-y divide-slate-100">
              {students.slice(0, 5).map((student) => {
                const isAtRisk = student.attendanceRate < 75;
                return (
                  <div key={student.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#081637] text-white flex items-center justify-center text-xs font-bold">
                        {student.avatarInitials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{student.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{student.indexNumber}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold font-mono ${isAtRisk ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {student.attendanceRate}%
                      </span>
                      <span className={`block text-[9px] font-bold uppercase ${isAtRisk ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {isAtRisk ? 'At Risk' : 'Eligible'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {students.length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-1 text-slate-300">person_off</span>
                  <p className="text-xs font-semibold">No students enrolled yet</p>
                </div>
              )}
            </div>

            {students.length > 5 && (
              <div className="pt-3 mt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => navigate(`/courses/${course.id}/roster`)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  View all {students.length} students →
                </button>
              </div>
            )}
          </div>

          {/* Attendance Health Distribution Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Attendance Distribution</h2>
              <span className="text-xs font-bold font-mono text-secondary bg-[#081637] px-2 py-0.5 rounded">
                {overallRate}% Avg
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">🟢 Good Standing (≥75%)</span>
                <span className="font-bold text-slate-900 font-mono">{standingSummary.good} Students</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">🟡 Warning (60%–74%)</span>
                <span className="font-bold text-slate-900 font-mono">{standingSummary.warning} Students</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">🔴 Critical At Risk (&lt;60%)</span>
                <span className="font-bold text-slate-900 font-mono">{standingSummary.critical} Students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Place Edit Course Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081637]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 w-full max-w-lg shadow-2xl animate-scale-in relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#081637] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Edit Course Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Update metadata, schedule, and venue for {course.code}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Code & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="e.g. CSCI 301"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-[#081637] transition-all uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Academic Level
                  </label>
                  <CustomSelect
                    value={editLevel}
                    onChange={setEditLevel}
                    options={LEVEL_OPTIONS}
                    placeholder="Select Level"
                  />
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Course Title
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Software Engineering"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#081637] transition-all"
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Default Venue / Lecture Hall
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">location_on</span>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    placeholder="e.g. Main Auditorium / Lab 3"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#081637] transition-all"
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Lecture Schedule
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-medium text-slate-400 mb-1">Day</label>
                    <CustomSelect
                      value={editScheduleDay}
                      onChange={setEditScheduleDay}
                      options={DAY_OPTIONS}
                      placeholder="Select Day"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-medium text-slate-400 mb-1">Start Time</label>
                    <TimeSelect
                      value={editStartTime}
                      onChange={handleEditStartTimeChange}
                      placeholder="Start Time"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-medium text-slate-400 mb-1">End Time</label>
                    <TimeSelect
                      value={editEndTime}
                      onChange={setEditEndTime}
                      minTime={editStartTime}
                      placeholder="End Time"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit || !editCode.trim() || !editName.trim()}
                className="px-6 py-2.5 text-xs font-bold text-slate-950 rounded-xl transition-all hover:brightness-105 active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: "#F5B41C" }}
              >
                {savingEdit ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
