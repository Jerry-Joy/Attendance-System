import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

const ROWS_PER_PAGE = 8;

export default function History() {
  const navigate = useNavigate();
  const { pastSessions } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const courseOptions = useMemo(() => {
    const codes = [...new Set(pastSessions.map(s => s.courseCode))];
    return codes.map(code => {
      const session = pastSessions.find(s => s.courseCode === code);
      return { code, name: session?.courseName || '' };
    });
  }, [pastSessions]);

  const filtered = useMemo(() => {
    return pastSessions.filter(session => {
      const matchesCourse = courseFilter === 'all' || session.courseCode === courseFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        session.courseCode.toLowerCase().includes(query) ||
        session.courseName.toLowerCase().includes(query) ||
        session.date.toLowerCase().includes(query) ||
        session.venue.toLowerCase().includes(query);
      return matchesCourse && matchesSearch;
    });
  }, [searchQuery, courseFilter, pastSessions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSessions = filtered.slice((safeCurrentPage - 1) * ROWS_PER_PAGE, safeCurrentPage * ROWS_PER_PAGE);

  const handleSearchChange = (value: string) => { setSearchQuery(value); setCurrentPage(1); };
  const handleCourseFilterChange = (value: string) => { setCourseFilter(value); setCurrentPage(1); };

  const totalSessions = filtered.length;
  const avgAttendance = filtered.length > 0 ? Math.round(filtered.reduce((acc, s) => acc + (s.presentCount / s.totalStudents) * 100, 0) / filtered.length) : 0;
  const totalPresent = filtered.reduce((acc, s) => acc + s.presentCount, 0);

  const handleDownload = (session: typeof pastSessions[0]) => {
    setDownloadingId(session.id);
    const csvRows = [
      ['Session Report'], ['Course', `${session.courseCode} - ${session.courseName}`],
      ['Date', session.date], ['Time', `${session.startTime} - ${session.endTime}`],
      ['Duration', session.duration], ['Venue', session.venue],
      ['Total Students', session.totalStudents], ['Present', session.presentCount],
      ['Absent', session.absentCount], ['Attendance Rate', `${Math.round((session.presentCount / session.totalStudents) * 100)}%`],
    ];
    const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.courseCode.replace(/\s/g, '_')}_${session.date.replace(/[\s,]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloadingId(null), 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-400">history</span>
            Session History
          </h1>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono tracking-widest uppercase mt-1">Archived Records & Analytics</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Sessions', value: totalSessions, icon: 'calendar_today', accent: 'blue' },
          { label: 'Total Check-ins', value: totalPresent, icon: 'how_to_reg', accent: 'emerald' },
          { label: 'Avg. Attendance', value: `${avgAttendance}%`, icon: 'groups', accent: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3 hover:border-slate-300 dark:border-slate-700 transition-colors">
            <div className={`w-10 h-10 rounded-lg bg-${stat.accent}-500/10 flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-[18px] text-${stat.accent}-400`}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{stat.value}</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono uppercase">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-600 dark:text-slate-400">search</span>
            <input type="text" value={searchQuery} onChange={e => handleSearchChange(e.target.value)} placeholder="Search by course, date, venue..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors" />
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-600 dark:text-slate-400">filter_alt</span>
            <select value={courseFilter} onChange={e => handleCourseFilterChange(e.target.value)} className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors cursor-pointer">
              <option value="all">All Courses</option>
              {courseOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.code} — {opt.name}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery || courseFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono uppercase">Filters:</span>
            {courseFilter !== 'all' && (
              <button onClick={() => handleCourseFilterChange('all')} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold uppercase border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                {courseFilter} <span className="ml-0.5">×</span>
              </button>
            )}
            {searchQuery && (
              <button onClick={() => handleSearchChange('')} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold hover:bg-slate-700 transition-colors">
                "{searchQuery}" <span className="ml-0.5">×</span>
              </button>
            )}
            <button onClick={() => { handleSearchChange(''); handleCourseFilterChange('all'); }} className="text-[10px] text-slate-600 hover:text-slate-700 dark:text-slate-300 ml-1 transition-colors font-mono uppercase">Clear all</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-300 dark:border-slate-700/50">
              <span className="material-symbols-outlined text-[24px] text-slate-600 dark:text-slate-400">history</span>
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2">No Archived Data</h2>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 max-w-sm mx-auto font-mono uppercase leading-relaxed">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#15181E]/50 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-mono tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <th className="px-5 py-3 font-semibold text-left">Course</th>
                  <th className="px-5 py-3 font-semibold text-left">Date</th>
                  <th className="px-5 py-3 font-semibold text-left">Duration</th>
                  <th className="px-5 py-3 font-semibold text-left">Present/Total</th>
                  <th className="px-5 py-3 font-semibold text-left">Rate</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedSessions.map(session => {
                  const rate = Math.round((session.presentCount / session.totalStudents) * 100);
                  const rateColor = rate >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : rate >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';
                  return (
                    <tr key={session.id} className="hover:bg-slate-100 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 dark:text-white text-xs uppercase">{session.courseCode}</p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">{session.courseName}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-slate-700 dark:text-slate-300">{session.date}</p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">{session.startTime} — {session.endTime}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {session.duration}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 dark:text-white text-xs tabular-nums">{session.presentCount}</span>
                        <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">/{session.totalStudents}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${rateColor}`}>{rate}%</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate('/session/summary', { state: { session } })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors uppercase">
                            <span className="material-symbols-outlined text-[12px]">visibility</span>
                            View
                          </button>
                          <button onClick={() => handleDownload(session)} disabled={downloadingId === session.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-700 transition-colors uppercase disabled:opacity-50">
                            {downloadingId === session.id ? (
                              <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                            ) : (
                              <span className="material-symbols-outlined text-[12px]">download</span>
                            )}
                            CSV
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0D11]/30">
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono uppercase">
              Showing <span className="font-bold text-slate-700 dark:text-slate-300">{(safeCurrentPage - 1) * ROWS_PER_PAGE + 1}</span>–<span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(safeCurrentPage * ROWS_PER_PAGE, filtered.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{filtered.length}</span> sessions
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage <= 1} className="p-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-white dark:hover:bg-slate-700/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded text-[10px] font-bold transition-all ${page === safeCurrentPage ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-white dark:hover:bg-slate-700/70 border border-transparent hover:border-slate-300 dark:border-slate-700'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage >= totalPages} className="p-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-white dark:hover:bg-slate-700/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
