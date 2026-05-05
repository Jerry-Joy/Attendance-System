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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[9px] text-[#C5960C] font-mono tracking-[0.15em] uppercase mb-0.5">Ghana Communication Technology University</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Dashboard</h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Status & Schedule</p>
        </div>
        {activeSession ? (
          <button onClick={() => navigate('/session/active')} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            Rejoin Live Session
          </button>
        ) : (
          <Link to="/session/create" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.2)] cursor-pointer border border-blue-500/50">
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            Start Session
          </Link>
        )}
      </div>

      {/* KPI Cards — Operational */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Live Status */}
        <div className={`rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group transition-colors border ${activeSession ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50' : 'bg-white dark:bg-[#15181E] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
          <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out ${activeSession ? 'bg-emerald-500/10' : 'bg-slate-500/5'}`}></div>
          <div className="text-[10px] text-slate-500 font-mono uppercase flex justify-between items-center relative z-10">
            <span>Live Status</span>
            <span className="material-symbols-outlined text-[14px]">sensors</span>
          </div>
          <div className="flex items-end justify-between relative z-10">
            {activeSession ? (
              <>
                <div>
                  <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
                    Active
                  </h2>
                  <p className="text-[10px] text-emerald-400/70 font-mono mt-0.5">{activeSession.courseCode}</p>
                </div>
                <div className="text-emerald-400 text-[10px] font-mono mb-1 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                  {activeSession.attendees.length} joined
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Standby</h2>
                <div className="text-slate-500 text-[10px] font-mono mb-1">No active session</div>
              </>
            )}
          </div>
        </div>

        {/* Active Courses */}
        <div className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="text-[10px] text-slate-500 font-mono uppercase flex justify-between items-center relative z-10">
            <span>Active Courses</span>
            <span className="material-symbols-outlined text-[14px]">school</span>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{String(courses.length).padStart(2, '0')}</h2>
            <div className="text-slate-500 text-[10px] font-mono mb-1">F26 Term</div>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="text-[10px] text-slate-500 font-mono uppercase flex justify-between items-center relative z-10">
            <span>Total Students</span>
            <span className="material-symbols-outlined text-[14px]">groups</span>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{totalStudents}</h2>
            <div className="flex items-center text-amber-400 text-[10px] font-mono gap-1 mb-1">Enrolled</div>
          </div>
        </div>

        {/* Next Class */}
        <div className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="text-[10px] text-slate-500 font-mono uppercase flex justify-between items-center relative z-10">
            <span>Next Class</span>
            <span className="material-symbols-outlined text-[14px]">event</span>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{nextClass?.code || '—'}</h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[120px]">{nextClass?.venueName || 'TBA'}</p>
            </div>
            <div className="text-indigo-400 text-[10px] font-mono mb-1 bg-indigo-400/10 px-1.5 py-0.5 rounded border border-indigo-400/20">
              {nextClass?.schedule?.split(' ').slice(0, 2).join(' ') || 'TBA'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Activity + Active Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h2>
            <Link to="/history" className="text-[10px] text-blue-500 hover:text-blue-400 uppercase font-mono">View All</Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-300 dark:border-slate-700/50">
                  <span className="material-symbols-outlined text-[20px] text-slate-500">history</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono uppercase">No completed sessions yet</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {recentSessions.map((session, idx) => {
                const rate = Math.round((session.presentCount / session.totalStudents) * 100);
                const rateColor = rate >= 85 ? 'emerald' : rate >= 75 ? 'amber' : 'red';
                return (
                  <button
                    key={session.id}
                    onClick={() => navigate('/session/summary', { state: { session } })}
                    className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors cursor-pointer rounded group relative"
                  >
                    {/* Timeline line */}
                    {idx < recentSessions.length - 1 && (
                      <div className="absolute left-[29px] top-[42px] w-px h-[calc(100%-24px)] bg-slate-800"></div>
                    )}

                    {/* Timeline dot */}
                    <div className={`w-[14px] h-[14px] rounded-full border-2 shrink-0 relative z-10 ${idx === 0 ? `border-${rateColor}-500 bg-${rateColor}-500/20` : 'border-slate-700 bg-white dark:bg-[#15181E]'
                      }`}>
                      {idx === 0 && <div className={`absolute inset-[3px] rounded-full bg-${rateColor}-500`}></div>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{session.courseCode}</span>
                        <span className="text-[10px] text-slate-600 font-mono">—</span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono truncate">{session.courseName}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                          {session.date}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">{session.startTime}</span>
                      </div>
                    </div>

                    {/* Rate badge */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{session.presentCount}<span className="text-slate-500 font-normal">/{session.totalStudents}</span></p>
                        <p className={`text-[10px] font-bold text-${rateColor}-400`}>{rate}%</p>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-slate-600 group-hover:text-slate-600 dark:text-slate-400 transition-colors">chevron_right</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Schedule */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Schedule</h2>
            <Link to="/courses" className="text-[10px] text-blue-500 hover:text-blue-400 uppercase font-mono">View All</Link>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto">
            {courses.map((course, idx) => {
              const isLive = activeSession?.courseId === course.id;
              return (
                <div key={course.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-[#0B0D11]/50 hover:bg-slate-100 dark:hover:bg-slate-950 transition-colors relative group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">{course.code}</span>
                    {isLive ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        LIVE
                      </span>
                    ) : (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${idx === 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700/50'}`}>
                        {idx === 0 ? 'IN 30 MIN' : 'LATER'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-xs mb-1 truncate">{course.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">meeting_room</span>
                    {course.venueName || 'TBA'}
                  </p>
                  {isLive ? (
                    <button onClick={() => navigate('/session/active')} className="mt-3 w-full flex justify-center uppercase tracking-wider bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/30 font-bold text-[10px] py-1.5 rounded transition-colors cursor-pointer">
                      Rejoin Session
                    </button>
                  ) : idx === 0 ? (
                    <button onClick={() => navigate(`/session/create?course=${course.id}`)} className="mt-3 w-full flex justify-center uppercase tracking-wider bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/30 font-bold text-[10px] py-1.5 rounded transition-colors cursor-pointer">
                      Set Up Session
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
