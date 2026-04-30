import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, pastSessions } = useData();

  const course = courses.find((c) => c.id === id) || courses[0];
  const sessions = pastSessions.filter((s) => s.courseCode === course?.code);

  // Compute pie chart data from actual session stats
  const pieChartData = useMemo(() => {
    if (!sessions.length || !course) {
      return [
        { name: 'Present', value: 0, color: '#10b981' },
        { name: 'Absent', value: 0, color: '#ef4444' },
      ];
    }
    const totalPresent = sessions.reduce((a, s) => a + s.presentCount, 0);
    const totalAbsent = sessions.reduce((a, s) => a + s.absentCount, 0);
    return [
      { name: 'Present', value: totalPresent, color: '#10b981' },
      { name: 'Absent', value: totalAbsent, color: '#ef4444' },
    ];
  }, [sessions, course]);

  if (!course) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate(-1)} className="text-[10px] text-slate-500 hover:text-blue-400 uppercase font-mono tracking-widest flex items-center gap-1 w-fit cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Go Back
        </button>
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-[32px] text-red-400 mb-3">error</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Course Not Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section with back button */}
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="text-[10px] text-slate-500 hover:text-blue-400 uppercase font-mono tracking-widest flex items-center gap-1 w-fit cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Go Back
        </button>
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono">{course.code}</span>
              <span className="text-[10px] text-slate-500 font-mono uppercase">{course.level}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">{course.name}</h1>
          </div>
          <div className="flex gap-3">
            <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit
            </button>
            <button
              onClick={() => navigate(`/session/create?course=${course.id}`)}
              className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50 font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.2)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              Start Session
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Info Card */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-6 relative overflow-hidden">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Course Details</h3>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded border border-slate-300 dark:border-slate-700/50 text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              </div>
              <div className="mt-0.5">
                <p className="text-[10px] font-mono text-slate-500 uppercase">Schedule</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{course.schedule || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded border border-slate-300 dark:border-slate-700/50 text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-[16px]">meeting_room</span>
              </div>
              <div className="mt-0.5">
                <p className="text-[10px] font-mono text-slate-500 uppercase">Location</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{course.venueName || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded border border-slate-300 dark:border-slate-700/50 text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-[16px]">groups</span>
              </div>
              <div className="mt-0.5">
                <p className="text-[10px] font-mono text-slate-500 uppercase">Capacity</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{course.studentCount} Students</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded flex justify-between items-center text-blue-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Join Code</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-widest text-slate-900 dark:text-white">{course.joinCode}</span>
                <button className="hover:text-blue-300 cursor-pointer transition-colors" onClick={() => navigator.clipboard?.writeText(course.joinCode)}>
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center justify-center gap-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-full text-left mb-2">Attendance Breakdown</h3>
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '4px', border: '1px solid #1e293b', padding: '8px' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase mt-2 w-full justify-center">
            {pieChartData.map(d => (
              <div key={d.name} className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.2)]" style={{ backgroundColor: d.color }}></div>
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student List</h3>
            <button onClick={() => navigate(`/courses/${course.id}/students`)} className="text-[10px] text-blue-500 uppercase font-bold hover:text-blue-400 cursor-pointer transition-colors">Manage</button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-300 dark:border-slate-700/50">
                <span className="material-symbols-outlined text-[20px] text-slate-500">group</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">{course.studentCount}</p>
              <p className="text-[10px] font-mono uppercase text-slate-500">Enrolled Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col mt-2 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#0B0D11]/30">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-mono tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold">State</th>
                <th className="px-5 py-3 font-semibold">Present/Total</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-100 dark:bg-slate-800/20 transition-colors group">
                  <td className="px-5 py-3">
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">{session.date}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{session.startTime} — {session.endTime}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
                      Completed
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-1 w-32">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{session.presentCount}</span>
                        <span className="text-[10px] text-slate-500 font-mono">/ {session.totalStudents}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${(session.presentCount / session.totalStudents) * 100}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => navigate('/session/summary', { state: { session } })} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-400 transition-colors cursor-pointer">View Summary</button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-slate-500 text-[10px] font-mono uppercase tracking-widest">No sessions recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
