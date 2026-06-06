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

  const totalSessions = pastSessions.length;
  const totalCheckIns = pastSessions.reduce((acc, s) => acc + s.presentCount, 0);
  const avgAttendance = pastSessions.length > 0 ? Math.round(pastSessions.reduce((acc, s) => acc + (s.presentCount / s.totalStudents) * 100, 0) / pastSessions.length) : 0;

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
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md" style={{ backgroundColor: "#FFF9E6" }}>
          <span className="material-symbols-outlined text-[24px]" style={{ color: "#F5B41C" }}>history</span>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-slate-900">Session History</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Archived Records & Analytics</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Sessions - Dark Navy */}
        <div className="rounded-2xl p-6 flex flex-col animate-slide-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={{ backgroundColor: "#1a2332", animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white/20">
              <span className="material-symbols-outlined text-[20px] text-white">calendar_today</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-white tabular-nums">{String(totalSessions).padStart(2, '0')}</h2>
        </div>

        {/* Total Check-ins */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col animate-slide-up hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 cursor-pointer" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Check-ins</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center transition-all duration-300 hover:bg-slate-100">
              <span className="material-symbols-outlined text-[20px] text-slate-600">person</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tabular-nums">{String(totalCheckIns).padStart(2, '0')}</h2>
        </div>

        {/* Avg Attendance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col animate-slide-up hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 cursor-pointer" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg. Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center transition-all duration-300 hover:bg-slate-100">
              <span className="material-symbols-outlined text-[20px] text-slate-600">groups</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tabular-nums">{avgAttendance}%</h2>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 group-focus-within:text-slate-600 transition-colors">search</span>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => handleSearchChange(e.target.value)} 
            placeholder="Search by course, date, venue..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:shadow-md transition-all duration-200"
          />
        </div>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 group-focus-within:text-slate-600 transition-colors">filter_alt</span>
          <select 
            value={courseFilter} 
            onChange={e => handleCourseFilterChange(e.target.value)} 
            className="appearance-none pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:shadow-md transition-all duration-200 cursor-pointer min-w-[200px]"
          >
            <option value="all">All Courses</option>
            {courseOptions.map(opt => (
              <option key={opt.code} value={opt.code}>{opt.code} — {opt.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none group-focus-within:text-slate-600 transition-colors">expand_more</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-slide-up hover:shadow-lg hover:border-slate-300 transition-all duration-300" style={{ animationDelay: '0.5s' }}>
        {filtered.length === 0 ? (
          <div className="py-20 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-300 hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[24px] text-slate-500">history</span>
            </div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-2">No Archived Data</h2>
            <p className="text-[10px] text-slate-500 max-w-sm mx-auto uppercase leading-relaxed">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#1a2332" }}>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">Present/Total</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSessions.map((session, idx) => {
                  const rate = Math.round((session.presentCount / session.totalStudents) * 100);
                  return (
                    <tr key={session.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 animate-slide-up ${idx === paginatedSessions.length - 1 ? 'border-b-0' : ''}`} style={{ animationDelay: `${idx * 0.03 + 0.55}s` }}>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900 text-sm">{session.courseCode}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{session.courseName}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-900">{session.date}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{session.startTime} — {session.endTime}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>{session.duration.replace(' min', '')} min</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-900 text-sm tabular-nums">{session.presentCount}/{session.totalStudents}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 transition-all duration-200">{rate}%</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate('/session/summary', { state: { session } })} 
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-extrabold text-white uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 group" 
                            style={{ backgroundColor: "#1a2332" }}
                          >
                            <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">visibility</span>
                            View
                          </button>
                          <button 
                            onClick={() => handleDownload(session)} 
                            disabled={downloadingId === session.id} 
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 uppercase tracking-wide hover:bg-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 active:scale-95 group"
                          >
                            {downloadingId === session.id ? (
                              <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                            ) : (
                              <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">download</span>
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
      </div>
    </div>
  );
}
