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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header - Dark Navy */}
      <header className="h-[72px] px-8 flex items-center justify-between rounded-2xl mx-4 mt-4 animate-fade-in" style={{ backgroundColor: "#1a2332" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/history')} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-110">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <h1 className="text-[13px] font-bold text-white uppercase tracking-[0.1em]">Session Summary</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-md border-2 hover:scale-105 transition-transform" style={{ borderColor: "#F5B41C", backgroundColor: "transparent" }}>
          <span className="material-symbols-outlined text-[14px]" style={{ color: "#F5B41C" }}>check_circle</span>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#F5B41C" }}>Completed</span>
        </div>
      </header>

      <div className="flex-1 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Course Info */}
          <div className="mb-6 mt-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">
              {summary.courseCode} · {summary.courseName} · {summary.date}
            </p>
          </div>

          {/* Stats Grid - 5 individual cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {/* Circular Progress Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center animate-slide-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-[90px] h-[90px] mb-4">
                <svg className="-rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f5f5f5" strokeWidth="12" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    fill="none" 
                    stroke="#F5B41C" 
                    strokeWidth="12" 
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - attendanceRate / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[28px] font-extrabold" style={{ color: "#F5B41C" }}>{attendanceRate}%</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-bold">Attendance</p>
            </div>

            {/* Total Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center animate-slide-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: '0.3s' }}>
              <div className="w-[48px] h-[48px] rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px] text-slate-700">groups</span>
              </div>
              <p className="text-[42px] font-extrabold text-slate-900 mb-1 leading-none">{summary.totalStudents}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-bold mt-2">Total</p>
            </div>

            {/* Present Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center animate-slide-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: '0.4s' }}>
              <div className="w-[48px] h-[48px] rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px] text-slate-700">help_outline</span>
              </div>
              <p className="text-[42px] font-extrabold text-slate-900 mb-1 leading-none">{summary.presentCount}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-bold mt-2">Present</p>
            </div>

            {/* Absent Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center animate-slide-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: '0.5s' }}>
              <div className="w-[48px] h-[48px] rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px] text-slate-700">radio_button_unchecked</span>
              </div>
              <p className="text-[42px] font-extrabold text-slate-900 mb-1 leading-none">{absentCount}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-bold mt-2">Absent</p>
            </div>

            {/* Rate Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center animate-slide-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: '0.6s' }}>
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: "#FFF9E6" }}>
                <span className="material-symbols-outlined text-[26px]" style={{ color: "#F5B41C" }}>show_chart</span>
              </div>
              <p className="text-[42px] font-extrabold mb-1 leading-none" style={{ color: "#F5B41C" }}>{attendanceRate}%</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-bold mt-2">Rate</p>
            </div>
          </div>

          {/* Two Column Layout - Session Details + Verification */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Session Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-slide-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0.7s' }}>
              <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-600">description</span>
                Session Details
              </h3>
              <div className="space-y-0">
                {[
                  { label: 'START TIME', value: summary.startTime },
                  { label: 'END TIME', value: summary.endTime },
                  { label: 'DURATION', value: summary.duration },
                  { label: 'VENUE', value: summary.venueName },
                  { label: 'GEOFENCE', value: `${summary.geofenceRadius}m radius` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{item.label}</span>
                    <span className="text-[13px] font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-slide-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0.8s' }}>
              <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-600">verified_user</span>
                Verification Breakdown
              </h3>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">QR + GPS Verified</span>
                  </div>
                  <span className="text-[13px] font-bold text-slate-900">{gpsVerifiedCount}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${gpsPercent}%`, backgroundColor: "#F5B41C" }} />
                </div>
              </div>
              <div className="flex items-start gap-3 pt-4">
                <span className="material-symbols-outlined text-[18px] text-slate-900 flex-shrink-0">check</span>
                <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wide leading-relaxed">
                  All present students verified with QR + GPS
                </span>
              </div>
            </div>
          </div>

          {/* Student Attendance Log */}
          {attendees.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6 animate-slide-up" style={{ animationDelay: '0.9s' }}>
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-600">list_alt</span>
                  Student Attendance Log ({attendees.length})
                </h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#1a2332" }}>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">Index</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((student, idx) => (
                    <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-6 py-5 text-[12px] text-slate-500 font-medium">{idx + 1}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold transition-transform hover:scale-110" style={{ backgroundColor: "#1a2332" }}>
                            {student.avatarInitials}
                          </div>
                          <span className="text-[13px] font-semibold text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[13px] text-slate-600 font-medium">{student.indexNumber}</td>
                      <td className="px-6 py-5 text-[13px] text-slate-600 font-medium">{student.time}</td>
                      <td className="px-6 py-5">
                        {student.gpsVerified ? (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            QR + GPS
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            Verifying
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '1s' }}>
            <button 
              onClick={handleDownload} 
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-300 text-slate-900 rounded-xl text-[11px] font-extrabold uppercase tracking-wide hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="material-symbols-outlined text-[20px]">{downloading ? 'refresh' : 'download'}</span>
              {downloading ? 'Downloading...' : 'Download Report'}
            </button>
            <button 
              onClick={() => navigate('/history')}
              className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-300 text-slate-900 rounded-xl text-[11px] font-extrabold uppercase tracking-wide hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
              Session History
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 py-4 rounded-xl text-[11px] font-extrabold uppercase tracking-wide hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{ backgroundColor: "#F5B41C", color: "#000" }}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
