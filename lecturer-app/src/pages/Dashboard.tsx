import { Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses, pastSessions, activeSession } = useData();

  const totalStudents = courses.reduce((a, c) => a + c.studentCount, 0);

  // Find the "next class" from courses (mock: pick first non-live course)
  const nextClass = courses.find(c => c.id !== activeSession?.courseId) || courses[0];

  // Recent activity: last 5 completed sessions
  const recentSessions = pastSessions.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-slate-900">Dashboard</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Status & Schedule</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Live Status */}
        <div className={`rounded-2xl p-6 flex flex-col relative overflow-hidden border animate-slide-up ${activeSession ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`} style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Status</span>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-slate-600">sensors</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${activeSession ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">{activeSession ? 'Active' : 'Standby'}</h2>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{activeSession ? activeSession.courseCode : 'No active session'}</p>
        </div>

        {/* Active Courses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Courses</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-slate-600">school</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tabular-nums mb-1">{String(courses.length).padStart(2, '0')}</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">F26 Term</p>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-slate-600">groups</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-extrabold text-slate-900 tabular-nums">{totalStudents}</h2>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide mb-1.5" style={{ backgroundColor: "#FFF3CD", color: "#856404" }}>Enrolled</span>
          </div>
        </div>

        {/* Next Class */}
        <div className="bg-white rounded-2xl p-6 border-2 flex flex-col relative overflow-hidden animate-slide-up" style={{ borderColor: "#F5B41C", animationDelay: '0.4s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Next Class</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFF9E6" }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color: "#F5B41C" }}>event</span>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{nextClass?.code || '—'}</h2>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-semibold">{nextClass?.venueName || 'TBA'}</span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase">TBA</span>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Activity + Active Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-2 flex flex-col animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">Recent Activity</h2>
            <Link to="/history" className="text-[10px] uppercase font-bold hover:opacity-70 transition-opacity tracking-wide" style={{ color: "#F5B41C" }}>View All</Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-300">
                  <span className="material-symbols-outlined text-[20px] text-slate-500">history</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono uppercase">No completed sessions yet</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {recentSessions.map((session, idx) => {
                const rate = Math.round((session.presentCount / session.totalStudents) * 100);
                return (
                  <button
                    key={session.id}
                    onClick={() => navigate('/session/summary', { state: { session } })}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors cursor-pointer rounded-lg group relative"
                  >
                    {/* Timeline dot */}
                    <div className={`w-10 h-10 rounded-full border-2 shrink-0 flex items-center justify-center ${idx === 0 ? 'bg-amber-50 border-amber-400' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: idx === 0 ? "#F5B41C" : "#64748b" }}>
                        {idx === 0 ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: "#F5F5F5", color: "#1a2332" }}>{session.courseCode}</span>
                        <span className="text-xs font-semibold text-slate-900 truncate">{session.courseName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                          {session.date}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{session.startTime}</span>
                      </div>
                    </div>

                    {/* Rate badge */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-extrabold text-slate-900 tabular-nums">{session.presentCount}/{session.totalStudents}</p>
                      <p className="text-[10px] font-bold text-slate-500">{rate}%</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">Active Schedule</h2>
            <Link to="/courses" className="text-[10px] uppercase font-bold hover:opacity-70 transition-opacity tracking-wide" style={{ color: "#F5B41C" }}>View All</Link>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto">
            {courses.map((course, idx) => {
              const isLive = activeSession?.courseId === course.id;
              const isNext = idx === 0 && !isLive;
              return (
                <div key={course.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  {/* Course Header */}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: isNext ? "#FFF9E6" : "#F5F5F5", color: isNext ? "#F5B41C" : "#1a2332" }}>{course.code}</span>
                        {isNext && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: "#FFF3CD", color: "#856404" }}>In 30 min</span>
                        )}
                        {!isNext && !isLive && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-slate-200 text-slate-600">Later</span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mb-1">{course.name}</h3>
                      <p className="text-[10px] text-slate-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">meeting_room</span>
                        {course.venueName || 'TBA'}
                      </p>
                    </div>
                  </div>
                  {/* Action Button */}
                  {isNext && (
                    <div className="px-4 pb-4">
                      <button 
                        onClick={() => navigate(`/session/create?course=${course.id}`)} 
                        className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all hover:shadow-md" 
                        style={{ backgroundColor: "#F5B41C", color: "#000" }}
                      >
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        Set Up Session
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
