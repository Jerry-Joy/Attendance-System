import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

type FilterType = 'all' | 'gps';

export default function LiveMonitor() {
  const navigate = useNavigate();
  const { activeSession, courses } = useData();
  const course = courses.find(c => c.id === activeSession?.courseId) ?? null;

  useEffect(() => {
    if (!activeSession) {
      navigate('/courses', { replace: true });
    }
  }, [activeSession, navigate]);

  const students = [...(activeSession?.attendees ?? [])].reverse();
  const [prevCount, setPrevCount] = useState(students.length);
  const [newRowId, setNewRowId] = useState<string | null>(null);
  const tableEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (students.length > prevCount) {
      const newest = students[0];
      if (newest) {
        setNewRowId(newest.id);
        setTimeout(() => setNewRowId(null), 1500);
        tableEndRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    setPrevCount(students.length);
  }, [students.length, prevCount, students]);

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalCount = students.length;
  const gpsVerified = students.filter(s => s.gpsVerified).length;
  const enrolled = course?.studentCount ?? 0;

  const filteredStudents = students.filter(student => {
    const matchesFilter = filter === 'all' ? true : student.gpsVerified;
    const matchesSearch = searchQuery === '' || student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.indexNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D11] flex flex-col pt-20 px-4 sm:px-8 relative overflow-hidden font-sans">
      {/* Topnav */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#15181E] border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded bg-slate-50 dark:bg-[#0B0D11] border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Real-Time Attendance</h1>
            {activeSession && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-red-400 uppercase">Live</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase">
          <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
          Real-time updates
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col mt-4 relative z-10 pb-12">
        {/* Course info */}
        <p className="text-[10px] text-slate-500 font-mono uppercase mb-4">{course?.code} — {course?.name}</p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-blue-400">groups</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-mono">Checked In</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-blue-400 tabular-nums">{totalCount}</span>
              <span className="text-sm text-slate-500 font-mono">/ {enrolled}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">verified_user</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-mono">GPS Verified</span>
            </div>
            <span className="text-3xl font-bold text-emerald-400 tabular-nums">{gpsVerified}</span>
          </div>
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-amber-400">trending_up</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-mono">Attendance Rate</span>
            </div>
            <span className="text-3xl font-bold text-amber-400 tabular-nums">{enrolled > 0 ? Math.round((totalCount / enrolled) * 100) : 0}%</span>
          </div>
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-slate-600 dark:text-slate-400">schedule</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-mono">Time</span>
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex gap-2">
            {([{ key: 'all' as FilterType, label: 'All', count: totalCount }, { key: 'gps' as FilterType, label: 'GPS Verified', count: gpsVerified }]).map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${filter === f.key ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white dark:bg-[#15181E] text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700'}`}>
                {f.label} <span className={`ml-1 ${filter === f.key ? 'text-blue-400/70' : 'text-slate-600'}`}>{f.count}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-500">search</span>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or student ID..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div ref={tableEndRef} className="overflow-y-auto overflow-x-auto max-h-[480px]">
            {totalCount === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-300 dark:border-slate-700/50">
                  <span className="material-symbols-outlined text-[28px] text-slate-500">person_add</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">No Students Yet</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase max-w-xs text-center">Waiting for students to scan the QR code.</p>
                {activeSession && (
                  <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500 font-mono uppercase">
                    <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                    Waiting for check-ins...
                  </div>
                )}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-[24px] text-slate-600 mb-2 block">search_off</span>
                <p className="text-[10px] text-slate-500 font-mono uppercase">No students match the current filter</p>
                <button onClick={() => { setFilter('all'); setSearchQuery(''); }} className="mt-2 text-[10px] text-blue-400 font-bold hover:underline uppercase">Clear filters</button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-white dark:bg-[#15181E] z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest px-5 py-3 w-10 font-mono">#</th>
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest px-5 py-3 font-mono">Student</th>
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest px-5 py-3 font-mono">Student ID</th>
                    <th className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest px-5 py-3 font-mono">Time</th>
                    <th className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest px-5 py-3 font-mono">Check-In Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    const isNew = student.id === newRowId;
                    return (
                      <tr key={student.id} className={`border-b border-slate-200 dark:border-slate-800/30 transition-all duration-500 ${isNew ? 'bg-blue-500/10' : 'hover:bg-slate-100 dark:bg-slate-800/20'}`}>
                        <td className="px-5 py-3.5 text-xs font-mono text-slate-500 tabular-nums">{filteredStudents.length - index}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 transition-all ${isNew ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{student.avatarInitials}</div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</p>
                              {isNew && <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Just joined</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400 font-mono">{student.indexNumber}</td>
                        <td className="px-5 py-3.5 text-center text-xs text-slate-700 dark:text-slate-300 font-mono">{student.time}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-center">
                            {student.gpsVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-bold uppercase border border-emerald-500/20">
                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                QR + GPS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[9px] font-bold uppercase border border-amber-500/20">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                Verifying
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {totalCount > 0 && (
            <div className="px-5 py-3 bg-slate-50 dark:bg-[#0B0D11]/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase">
                Showing <span className="font-bold text-slate-700 dark:text-slate-300">{filteredStudents.length}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{totalCount}</span> checked-in students
              </span>
              <span className="text-[10px] text-slate-500 font-mono uppercase">{enrolled - totalCount} remaining</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
