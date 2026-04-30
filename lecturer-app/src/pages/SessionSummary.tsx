import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api, mapAttendance } from "../lib/api";
import type { SessionSummaryType, PastSession, AttendingStudent } from "../types";

const emptySummary: SessionSummaryType = {
  courseCode: '', courseName: '', date: '', startTime: '', endTime: '',
  duration: '', totalStudents: 0, presentCount: 0, absentCount: 0,
  qrGpsVerified: 0, geofenceRadius: 50, venueName: '',
};

export default function SessionSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedState = location.state as {
    session?: (SessionSummaryType | PastSession) & { id?: string };
    attendees?: AttendingStudent[];
  } | null;

  const summary: SessionSummaryType = (() => {
    if (!passedState?.session) return emptySummary;
    const s = passedState.session;
    if ('venueName' in s && typeof (s as SessionSummaryType).geofenceRadius === 'number') return s as SessionSummaryType;
    const ps = s as PastSession;
    return {
      courseCode: ps.courseCode, courseName: ps.courseName, date: ps.date,
      startTime: ps.startTime, endTime: ps.endTime, duration: ps.duration,
      totalStudents: ps.totalStudents, presentCount: ps.presentCount,
      absentCount: ps.absentCount, qrGpsVerified: ps.qrGpsVerified ?? ps.presentCount,
      geofenceRadius: ps.geofenceRadius ?? 50, venueName: ps.venue,
    };
  })();

  const [attendees, setAttendees] = useState<AttendingStudent[]>(() => {
    if (passedState?.attendees?.length) return passedState.attendees;
    const s = passedState?.session;
    if (s && 'attendees' in s && (s as PastSession).attendees) return (s as PastSession).attendees!;
    return [];
  });

  const [downloading, setDownloading] = useState(false);

  // Fetch attendees from API if we don't have them (e.g. navigating from History)
  useEffect(() => {
    const sessionId = passedState?.session?.id;
    if (attendees.length === 0 && sessionId) {
      api.getSessionAttendance(sessionId)
        .then((records) => setAttendees(records.map(mapAttendance)))
        .catch(() => { /* ignore */ });
    }
  }, [passedState?.session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const attendanceRate = summary.totalStudents > 0 ? Math.round((summary.presentCount / summary.totalStudents) * 100) : 0;
  const absentCount = Math.max(summary.totalStudents - summary.presentCount, 0);
  const gpsVerifiedCount = summary.qrGpsVerified;
  const gpsPercent = summary.presentCount > 0 ? Math.min(Math.round((gpsVerifiedCount / summary.presentCount) * 100), 100) : 0;

  // SVG ring params
  const ringRadius = 58;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (attendanceRate / 100) * ringCircumference;

  const rateColor = attendanceRate >= 75 ? 'text-emerald-400' : attendanceRate >= 50 ? 'text-amber-400' : 'text-red-400';
  const rateStroke = attendanceRate >= 75 ? 'stroke-emerald-500' : attendanceRate >= 50 ? 'stroke-amber-500' : 'stroke-red-500';

  const handleDownload = () => {
    setDownloading(true);
    const csvRows = [
      ['#', 'Student Name', 'Student ID', 'Time Marked', 'GPS Verified'],
      ...attendees.map((s, i) => [i + 1, s.name, s.indexNumber, s.time, s.gpsVerified ? 'Yes' : 'No']),
      [], ['Session Summary'],
      ['Course', `${summary.courseCode} - ${summary.courseName}`],
      ['Date', summary.date], ['Duration', summary.duration],
      ['Total Students', summary.totalStudents], ['Present', summary.presentCount],
      ['Absent', absentCount], ['Attendance Rate', `${attendanceRate}%`],
      ['GPS Verified', gpsVerifiedCount],
    ];
    const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${summary.courseCode.replace(/\s/g, '_')}_${summary.date.replace(/[\s,]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D11] flex flex-col pt-20 px-4 sm:px-8 relative overflow-hidden font-sans">
      {/* Topnav */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#15181E] border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/history')} className="w-8 h-8 rounded bg-slate-50 dark:bg-[#0B0D11] border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
          <h1 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Session Summary</h1>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
          <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Completed</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col mt-4 relative z-10 pb-12">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{summary.courseCode} · {summary.courseName} · {summary.date}</p>
        </div>

        {/* Hero: Ring + Stats */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6 lg:p-8 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* SVG Ring */}
            <div className="relative flex-shrink-0">
              <svg width="160" height="160" className="-rotate-90">
                <circle cx="80" cy="80" r={ringRadius} fill="none" className="stroke-slate-800" strokeWidth="12" />
                <circle cx="80" cy="80" r={ringRadius} fill="none" className={rateStroke} strokeWidth="12" strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${rateColor}`}>{attendanceRate}%</span>
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Attendance</span>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {[
                { icon: 'groups', label: 'Total', value: summary.totalStudents, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: 'check_circle', label: 'Present', value: summary.presentCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { icon: 'cancel', label: 'Absent', value: absentCount, color: 'text-red-400', bg: 'bg-red-500/10' },
                { icon: 'trending_up', label: 'Rate', value: `${attendanceRate}%`, color: rateColor, bg: attendanceRate >= 75 ? 'bg-emerald-500/10' : attendanceRate >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 dark:bg-[#0B0D11]/50 rounded-xl p-5 text-center border border-slate-200 dark:border-slate-800">
                  <div className={`w-11 h-11 mx-auto mb-3 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
                  </div>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details + Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Session Details */}
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">description</span>
              Session Details
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Start Time', value: summary.startTime },
                { label: 'End Time', value: summary.endTime },
                { label: 'Duration', value: summary.duration },
                { label: 'Venue', value: summary.venueName },
                { label: 'Geofence', value: `${summary.geofenceRadius}m radius` },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50 last:border-0">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{item.label}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Breakdown */}
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Verification Breakdown
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono uppercase">QR + GPS Verified</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">{gpsVerifiedCount}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700 shadow-[0_0_6px_rgba(16,185,129,0.3)]" style={{ width: `${gpsPercent}%` }} />
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/20 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[14px] text-emerald-400 flex-shrink-0">check_circle</span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase">All present students verified with QR + GPS</span>
            </div>
          </div>
        </div>

        {/* Attendance Log */}
        {attendees.length > 0 && (
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0B0D11]/30">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">list_alt</span>
                Student Attendance Log ({attendees.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-mono tracking-widest border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-3 font-semibold text-left">#</th>
                    <th className="px-5 py-3 font-semibold text-left">Student</th>
                    <th className="px-5 py-3 font-semibold text-left">Index</th>
                    <th className="px-5 py-3 font-semibold text-left">Time</th>
                    <th className="px-5 py-3 font-semibold text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {attendees.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-100 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 text-[10px] text-slate-500 font-mono">{idx + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-[9px] font-bold shrink-0">{student.avatarInitials}</div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 font-mono">{student.indexNumber}</td>
                      <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 font-mono">{student.time}</td>
                      <td className="px-5 py-3">
                        {student.gpsVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-bold uppercase border border-emerald-500/20">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            QR + GPS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[9px] font-bold uppercase border border-amber-500/20">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            Verifying
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleDownload} disabled={downloading} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-[#15181E] border border-blue-500/30 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/10 transition-colors disabled:opacity-50">
            {downloading ? (
              <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Downloading...</>
            ) : (
              <><span className="material-symbols-outlined text-[16px]">download</span> Download Report</>
            )}
          </button>
          <button onClick={() => navigate('/history')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-[#15181E] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 dark:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[16px]">history</span>
            Session History
          </button>
          <button onClick={() => navigate('/')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 border border-blue-500/50 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.2)]">
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
