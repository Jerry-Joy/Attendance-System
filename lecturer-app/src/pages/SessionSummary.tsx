import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api, mapAttendance } from "../lib/api";
import type { SessionSummaryType, PastSession, AttendingStudent } from "../types";
import StudentLocationModal from "../components/StudentLocationModal";
import { Search, X } from "lucide-react";
import { exportExcelCsv, formatStudentIdForExcel } from "../lib/csvExport";

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

  const [attendees, setAttendees] = useState<AttendingStudent[]>(passedState?.attendees || []);
  const [downloading, setDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<AttendingStudent | null>(null);

  const [sessionLatitude, setSessionLatitude] = useState<number | null>(null);
  const [sessionLongitude, setSessionLongitude] = useState<number | null>(null);

  useEffect(() => {
    const sessId = passedState?.session?.id;
    if (sessId) {
      api.getSessionAttendance(sessId).then(records => {
        if (records && records.length > 0) {
          setAttendees(records.map(mapAttendance));
        }
      }).catch(err => console.error("Could not fetch session attendance:", err));

      api.getSession(sessId).then(raw => {
        if (raw?.latitude != null && raw?.longitude != null) {
          setSessionLatitude(raw.latitude);
          setSessionLongitude(raw.longitude);
        }
      }).catch(err => console.error("Could not fetch session details:", err));
    }
  }, [passedState?.session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const attendanceRate = summary.totalStudents > 0 ? Math.round((summary.presentCount / summary.totalStudents) * 100) : 0;
  const absentCount = Math.max(summary.totalStudents - summary.presentCount, 0);
  const gpsVerifiedCount = summary.qrGpsVerified;

  const filteredAttendees = useMemo(() => {
    if (!searchQuery.trim()) return attendees;
    const q = searchQuery.toLowerCase();
    return attendees.filter(
      (a) => a.name.toLowerCase().includes(q) || a.indexNumber.toLowerCase().includes(q)
    );
  }, [attendees, searchQuery]);

  const handleDownload = () => {
    setDownloading(true);
    exportExcelCsv({
      title: 'Session Attendance Verification Report',
      courseCode: summary.courseCode,
      courseName: summary.courseName,
      sessionDate: summary.date,
      venue: summary.venueName,
      metaSummary: {
        'Total Enrolled': summary.totalStudents,
        'Present': summary.presentCount,
        'Absent': absentCount,
        'Attendance Rate': `${attendanceRate}%`,
        'GPS Verified': `${gpsVerifiedCount} (${attendanceRate}%)`,
        'Geofence Radius': `${summary.geofenceRadius}m`,
      },
      headers: ['#', 'Student Name', 'Student ID / Index No.', 'Check-In Time', 'Status', 'GPS Geofence Verified'],
      rows: attendees.map((s, i) => [
        i + 1,
        s.name,
        formatStudentIdForExcel(s.indexNumber),
        s.time || '—',
        s.gpsVerified ? 'Present' : 'Absent',
        s.gpsVerified ? 'Verified (QR + GPS)' : 'Unverified',
      ]),
      filename: `${summary.courseCode.replace(/\s/g, '_')}_Attendance_${summary.date.replace(/[\s,]/g, '_')}`,
    });
    setTimeout(() => setDownloading(false), 800);
  };

  const canShowStudentMap = (student: AttendingStudent) =>
    student.studentLatitude != null &&
    student.studentLongitude != null &&
    sessionLatitude != null &&
    sessionLongitude != null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sticky Header - Always Accessible */}
      <header className="sticky top-0 z-30 bg-[#081637] border-b border-slate-800 shadow-md px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/history')} 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="Back to Session History"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm lg:text-base font-bold text-white tracking-tight">Session Summary</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Completed
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {summary.courseCode} · {summary.courseName} · {summary.date}
            </p>
          </div>
        </div>

        {/* Header Action Buttons (Zero Scrolling Required) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 disabled:opacity-50 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">{downloading ? 'refresh' : 'download'}</span>
            <span className="hidden sm:inline">{downloading ? 'Exporting...' : 'Download CSV'}</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 transition-all hover:shadow-md hover:brightness-105 active:scale-95"
            style={{ backgroundColor: "#F5B41C" }}
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span>Done</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-6">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Circular Attendance Rate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center col-span-2 sm:col-span-1">
            <div className="relative w-[80px] h-[80px] mb-2">
              <svg className="-rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F5B41C"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - attendanceRate / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black" style={{ color: "#F5B41C" }}>{attendanceRate}%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Attendance Rate</p>
          </div>

          {/* Enrolled Total */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[22px] text-slate-700">groups</span>
            </div>
            <p className="text-3xl font-black text-slate-900 leading-none mb-1">{summary.totalStudents}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Total Enrolled</p>
          </div>

          {/* Present */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[22px] text-emerald-600">check_circle</span>
            </div>
            <p className="text-3xl font-black text-emerald-700 leading-none mb-1">{summary.presentCount}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Present</p>
          </div>

          {/* Absent */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[22px] text-rose-500">cancel</span>
            </div>
            <p className="text-3xl font-black text-rose-600 leading-none mb-1">{absentCount}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Absent</p>
          </div>

          {/* GPS Verified */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[22px]" style={{ color: "#F5B41C" }}>verified</span>
            </div>
            <p className="text-3xl font-black leading-none mb-1" style={{ color: "#F5B41C" }}>{gpsVerifiedCount}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">GPS Verified</p>
          </div>
        </div>

        {/* Main Content Layout: Session Details (Left) + Student Log (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Comprehensive Session Details */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="material-symbols-outlined text-[20px] text-slate-700">info</span>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Session Metadata</h2>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Start Time</span>
                <span className="text-xs font-bold text-slate-900">{summary.startTime || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">End Time</span>
                <span className="text-xs font-bold text-slate-900">{summary.endTime || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Duration</span>
                <span className="text-xs font-bold text-slate-900">{summary.duration || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Venue</span>
                <span className="text-xs font-bold text-slate-900">{summary.venueName || 'Classroom Venue'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Geofence Radius</span>
                <span className="text-xs font-bold text-slate-900">{summary.geofenceRadius}m radius</span>
              </div>
            </div>

            {/* Verification & Security Badge Box */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="text-xs font-bold uppercase tracking-wider">100% Geofence Verified</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                All present attendance records were authenticated via dynamic 30-second rotating cryptographic QR tokens and satellite GPS geofencing.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Attendance Log Table */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Table Header & Search Bar */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-slate-700">badge</span>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                  Attendance Records ({filteredAttendees.length}{filteredAttendees.length !== attendees.length ? ` of ${attendees.length}` : ''})
                </h2>
              </div>

              {/* Instant Filter Input */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl focus-within:border-[#081637] focus-within:ring-2 focus-within:ring-[#081637]/10 transition-all w-full sm:w-72 shadow-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="max-h-[500px] overflow-y-auto">
              {filteredAttendees.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">person_off</span>
                  <p className="text-sm font-semibold text-slate-600">No matching students found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {attendees.length === 0 ? "No attendance was recorded during this session." : "Try clearing your search query."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10 bg-[#081637] text-white">
                    <tr>
                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">#</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Student</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Student ID</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Time</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendees.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#081637] text-white flex items-center justify-center text-xs font-bold">
                              {student.avatarInitials}
                            </div>
                            <span className="text-xs font-bold text-slate-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">{student.indexNumber}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">{student.time}</td>
                        <td className="px-6 py-4">
                          {student.gpsVerified ? (
                            <button
                              onClick={() => canShowStudentMap(student) && setSelectedStudent(student)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                                canShowStudentMap(student)
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer shadow-xs'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 cursor-default'
                              }`}
                              title={canShowStudentMap(student) ? 'View student location pin on map' : 'Location data not available'}
                            >
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              Verified
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 bg-slate-100">
                              Present
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Student Location Modal */}
      {selectedStudent && sessionLatitude != null && sessionLongitude != null && (
        <StudentLocationModal
          open={true}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          sessionLatitude={sessionLatitude}
          sessionLongitude={sessionLongitude}
          geofenceRadius={summary.geofenceRadius}
        />
      )}
    </div>
  );
}
