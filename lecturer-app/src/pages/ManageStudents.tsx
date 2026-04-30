import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useData } from "../context/DataContext";
import { api } from "../lib/api";

export default function ManageStudents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, enrolledStudents, removeStudent, fetchStudents } = useData();

  const course = courses.find(c => c.id === id);
  const students = (id ? enrolledStudents[id] : []) || [];

  // Fetch students from API on mount
  useEffect(() => {
    if (id) fetchStudents(id);
  }, [id, fetchStudents]);

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

  const copyJoinCode = () => {
    navigator.clipboard?.writeText(course.joinCode);
  };

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate(-1)} className="text-[10px] text-slate-500 hover:text-blue-400 uppercase font-mono tracking-widest flex items-center gap-1 w-fit cursor-pointer transition-colors">
        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
        Go Back
      </button>

      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono">{course.code}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Student Roster</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Join Code Card */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enrollment Access</h3>

          <div className="bg-slate-50 dark:bg-[#0B0D11] rounded-lg border border-slate-300 dark:border-slate-700 p-5 text-center">
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-3">Join Code</p>
            <div className="text-2xl font-bold font-mono tracking-[0.2em] text-slate-900 dark:text-white mb-4">{course.joinCode}</div>
            <div className="flex gap-2 justify-center">
              <button onClick={copyJoinCode} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors">
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                Copy
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
              <span>Total Enrolled</span>
              <span className="text-slate-900 dark:text-white font-bold">{students.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
              <span>Course Level</span>
              <span className="text-slate-900 dark:text-white font-bold">{course.level}</span>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#0B0D11]/30">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enrolled Students ({students.length})</h3>
          </div>

          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-mono tracking-widest border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-3 font-semibold">#</th>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Student ID</th>
                    <th className="px-5 py-3 font-semibold">Attendance Rate</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {students.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-100 dark:bg-slate-800/20 transition-colors group">
                      <td className="px-5 py-3 text-[10px] text-slate-500 font-mono">{idx + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-bold">{student.avatarInitials}</div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono uppercase">{student.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 font-mono">{student.indexNumber}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${student.attendanceRate >= 85 ? 'bg-emerald-500' : student.attendanceRate >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${student.attendanceRate}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{student.attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={async () => {
                          if (!id) return;
                          try {
                            await api.removeStudent(id, student.id);
                            removeStudent(id, student.id);
                          } catch { /* ignore */ }
                        }} className="text-[10px] font-bold uppercase tracking-wider text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-300 dark:border-slate-700/50">
                <span className="material-symbols-outlined text-[24px] text-slate-500">group</span>
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2">No Enrolled Students</h2>
              <p className="text-[10px] text-slate-500 max-w-sm font-mono uppercase leading-relaxed">Share the join code above with students to enable enrollment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
