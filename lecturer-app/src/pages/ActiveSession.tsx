import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { io, type Socket } from "socket.io-client";
import { useData } from "../context/DataContext";
import { api, WS_BASE, getToken, mapAttendance } from "../lib/api";
import type { AttendingStudent } from "../types";

export default function ActiveSession() {
  const navigate = useNavigate();
  const { activeSession, addAttendee, endActiveSession, addPastSession, courses } = useData();

  const [qrToken, setQrToken] = useState(() => activeSession?.qrToken || `SA-${Math.floor(Date.now()/1000)}-${Math.random().toString(16).substring(2,8)}`);
  const [elapsed, setElapsed] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isFullscreenQr, setIsFullscreenQr] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(30);
  const [ending, setEnding] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(false);

  // Redirect if no active session (but not during initial mount)
  useEffect(() => {
    if (mountedRef.current && !activeSession && !ending) {
      navigate('/session/create', { replace: true });
    }
    mountedRef.current = true;
  }, [activeSession, navigate, ending]);

  // Connect WebSocket
  useEffect(() => {
    if (!activeSession?.sessionId) return;

    const token = getToken();
    if (!token) return;

    const socket = io(WS_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('session:join', { sessionId: activeSession.sessionId });
    });

    socket.on('attendance:new', (data: any) => {
      const student: AttendingStudent = data.student
        ? mapAttendance(data)
        : {
          id: data.studentId || data.id,
          name: data.studentName || data.fullName || 'Unknown',
          indexNumber: data.studentId || '',
          time: new Date(data.markedAt || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          gpsVerified: data.method === 'QR_GPS',
          avatarInitials: (data.studentName || data.fullName || 'UN').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
        };
      addAttendee(student);
    });

    socket.on('session:qr-refreshed', (data: { token: string }) => {
      setQrToken(data.token);
      setQrCountdown(30);
    });

    socket.on('session:ended', () => {
      if (!ending) {
        endActiveSession();
      }
    });

    socketRef.current = socket;

    return () => {
      socket.emit('session:leave', { sessionId: activeSession.sessionId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeSession?.sessionId, addAttendee, endActiveSession]);

  // Elapsed timer
  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeSession.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  // QR auto-refresh countdown — calls backend to rotate token
  useEffect(() => {
    if (!activeSession?.sessionId) return;

    const timer = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) {
          // Call backend to refresh QR token
          api.refreshQr(activeSession.sessionId!).then((res) => {
            setQrToken(res.qrToken);
          }).catch(() => {
            // Fallback: generate local token
            setQrToken(`SA-${Math.floor(Date.now()/1000)}-${Math.random().toString(16).substring(2,8)}`);
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession?.sessionId]);

  const handleEndSession = useCallback(async () => {
    if (!activeSession || ending) return;
    setEnding(true);

    const course = courses.find(c => c.id === activeSession.courseId);
    const now = new Date();
    const sessionData = {
      id: activeSession.sessionId,
      courseCode: activeSession.courseCode,
      courseName: activeSession.courseName,
      date: now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      startTime: new Date(activeSession.startedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      endTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      duration: `${Math.round(elapsed / 60)} min`,
      totalStudents: course?.studentCount || activeSession.attendees.length,
      presentCount: activeSession.attendees.length,
      absentCount: Math.max(0, (course?.studentCount || 0) - activeSession.attendees.length),
      qrGpsVerified: activeSession.attendees.filter(a => a.gpsVerified).length,
      geofenceRadius: activeSession.radius,
      venueName: course?.venueName || 'Unknown',
    };

    const attendeesData = [...activeSession.attendees];

    addPastSession({
      id: activeSession.sessionId || `past_${Date.now()}`,
      courseCode: activeSession.courseCode,
      courseName: activeSession.courseName,
      date: sessionData.date,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      duration: sessionData.duration,
      totalStudents: sessionData.totalStudents,
      presentCount: sessionData.presentCount,
      absentCount: sessionData.absentCount,
      venue: sessionData.venueName,
      qrGpsVerified: sessionData.qrGpsVerified,
      geofenceRadius: sessionData.geofenceRadius,
      attendees: attendeesData,
    });

    // Navigate FIRST immediately, synchronous with react state update
    navigate('/session/summary', {
      state: {
        session: sessionData,
        attendees: attendeesData,
      },
      replace: true,
    });

    // Clear active session AFTER navigation synchronously
    endActiveSession();

    try {
      // End the session on the backend asynchronously without blocking UI
      if (activeSession.sessionId) {
        await api.endSession(activeSession.sessionId);
      }
    } catch {
      // Continue even if API call fails
    }
  }, [activeSession, elapsed, navigate, endActiveSession, addPastSession, courses, ending]);

  if (!activeSession) return null;

  const totalDuration = Number(activeSession.duration) * 60;
  const remaining = Math.max(0, totalDuration - elapsed);
  const progress = totalDuration > 0 ? Math.min((elapsed / totalDuration) * 100, 100) : 0;
  const course = courses.find(c => c.id === activeSession.courseId);
  const enrolled = course?.studentCount || 0;
  const attendeeCount = activeSession.attendees.length;
  const gpsVerified = activeSession.attendees.filter(a => a.gpsVerified).length;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Auto-end at duration
  useEffect(() => {
    if (remaining <= 0 && elapsed > 0) {
      handleEndSession();
    }
  }, [remaining, elapsed, handleEndSession]);

  const qrValue = JSON.stringify({
    token: qrToken,
    courseId: activeSession.courseId,
    courseCode: activeSession.courseCode,
    lat: activeSession.latitude,
    lng: activeSession.longitude,
    lecturerAccuracy: activeSession.lecturerAccuracy,
    radius: activeSession.radius,
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative font-sans">
      {/* Topnav - Sticky */}
      <header className="sticky top-0 h-14 border-b px-6 flex items-center justify-between z-50 backdrop-blur-sm" style={{ backgroundColor: "#0F1B2E", borderBottomColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-8 h-8 rounded flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer" title="Return to dashboard">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#3B82F6" }}></div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "#60A5FA" }}>Live Session</span>
          </div>
          <span className="text-sm font-bold text-white uppercase tracking-wider">{activeSession.courseCode}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/session/live-monitor" className="text-[10px] font-medium uppercase tracking-wider hover:opacity-70 transition-opacity flex items-center gap-1.5 text-white/60">
            <span className="material-symbols-outlined text-[16px]">bar_chart</span>
            Live Attendance
          </Link>
          <button onClick={() => setShowEndConfirm(true)} className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-90 cursor-pointer" style={{ backgroundColor: "#F5B41C", color: "#0F1B2E" }}>
            End Session
          </button>
        </div>
      </header>

      <div className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Time Section - Clean, no card */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.15em] mb-1.5">Elapsed</p>
                <p className="text-3xl font-bold tabular-nums" style={{ color: "#0F1B2E" }}>{formatTime(elapsed)}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.15em] mb-1.5">Remaining</p>
                <p className="text-3xl font-bold tabular-nums" style={{ color: remaining < 60 ? "#EF4444" : "#0F1B2E" }}>{formatTime(remaining)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.15em] mb-1.5">Duration</p>
                <p className="text-base font-bold" style={{ color: "#0F1B2E" }}>{activeSession.duration} min</p>
              </div>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%`, backgroundColor: progress >= 90 ? "#EF4444" : "#0F1B2E" }} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* QR Code Section */}
            <div className="lg:col-span-1 rounded-xl flex flex-col overflow-hidden animate-slide-up" style={{ backgroundColor: "#0F1B2E", animationDelay: "100ms" }}>
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">QR Code</h3>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/50">
                  <span className="material-symbols-outlined text-[14px]">timer</span>
                  <span className="tabular-nums">{qrCountdown}s</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="p-5 bg-white rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg" onClick={() => setIsFullscreenQr(true)}>
                  <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} bgColor="#ffffff" fgColor="#0F1B2E" />
                </div>

                <div className="w-full mt-6">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-[9px] font-semibold text-white/50 uppercase tracking-[0.15em]">Auto-Refresh</span>
                    <span className="text-[10px] font-bold text-white tabular-nums">{qrCountdown}s</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(qrCountdown / 30) * 100}%`, backgroundColor: "#F5B41C" }} />
                  </div>
                </div>

                <button onClick={() => setIsFullscreenQr(true)} className="w-full mt-5 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 hover:border-white/20" style={{ color: "#FFFFFF" }}>
                  <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                  Expand QR
                </button>
              </div>
            </div>

            {/* Stats + Info Section */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Stats Grid - Top borders only */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
                <div className="bg-white rounded-lg p-4 text-center border-t-4 hover:shadow-lg transition-all duration-300" style={{ borderTopColor: "#0F1B2E" }}>
                  <span className="material-symbols-outlined text-[24px] mb-2 block text-slate-400">groups</span>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums mb-0.5">{attendeeCount}</p>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.15em]">Checked In</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-t-4 hover:shadow-lg transition-all duration-300" style={{ borderTopColor: "#F5B41C" }}>
                  <span className="material-symbols-outlined text-[24px] mb-2 block text-slate-400">verified_user</span>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums mb-0.5">{gpsVerified}</p>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.15em]">GPS Verified</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-t-4 hover:shadow-lg transition-all duration-300" style={{ borderTopColor: "#F5B41C" }}>
                  <span className="material-symbols-outlined text-[24px] mb-2 block text-slate-400">trending_up</span>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums mb-0.5">{enrolled > 0 ? Math.round((attendeeCount / enrolled) * 100) : 0}%</p>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.15em]">Attendance Rate</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-t-4 hover:shadow-lg transition-all duration-300" style={{ borderTopColor: "#F5B41C" }}>
                  <span className="material-symbols-outlined text-[24px] mb-2 block text-slate-400">people_outline</span>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums mb-0.5">{Math.max(0, enrolled - attendeeCount)}</p>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.15em]">Remaining</p>
                </div>
              </div>

              {/* Session Info - Clean, minimal */}
              <div className="bg-white rounded-lg p-5 animate-slide-up hover:shadow-md transition-all duration-300" style={{ animationDelay: "300ms" }}>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4">Session Information</h3>
                <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 uppercase font-medium">Course</span>
                    <span className="text-sm font-bold text-slate-900">{activeSession.courseCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 uppercase font-medium">Venue</span>
                    <span className="text-sm font-bold text-slate-900">{course?.venueName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 uppercase font-medium">Geofence</span>
                    <span className="text-sm font-bold text-slate-900">{activeSession.radius}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 uppercase font-medium">Enrolled</span>
                    <span className="text-sm font-bold text-slate-900">{enrolled}</span>
                  </div>
                </div>
              </div>

              {/* Recent Check-ins - Clean design */}
              <div className="bg-white rounded-lg p-5 animate-slide-up hover:shadow-md transition-all duration-300" style={{ animationDelay: "400ms" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Recent Check-ins</h3>
                  <Link to="/session/live-monitor" className="text-[10px] font-bold uppercase tracking-wider hover:opacity-70 transition-opacity text-slate-900 flex items-center gap-1">
                    View All
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
                {activeSession.attendees.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-[48px] text-slate-300 mb-3 block animate-pulse">hourglass_empty</span>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Waiting for check-ins...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto">
                    {[...activeSession.attendees].reverse().slice(0, 6).map((student, idx) => (
                      <div key={student.id} className="flex items-center justify-between px-3 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200 animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "#0F1B2E", color: "#FFFFFF" }}>{student.avatarInitials}</div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900">{student.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{student.indexNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] text-slate-500 font-mono">{student.time}</span>
                          {student.gpsVerified ? (
                            <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase" style={{ color: "#FFFFFF", backgroundColor: "#0F1B2E" }}>GPS ✓</span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase border" style={{ color: "#F5B41C", backgroundColor: "rgba(245,180,28,0.1)", borderColor: "rgba(245,180,28,0.3)" }}>Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <span className="material-symbols-outlined text-[24px] text-red-400">stop_circle</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 text-center uppercase tracking-wider mb-2">End Session?</h3>
            <p className="text-[10px] text-slate-600 text-center font-mono uppercase mb-6">
              {attendeeCount} student{attendeeCount !== 1 ? 's' : ''} checked in. Session data will be archived.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200 rounded hover:bg-slate-100 transition-colors">Continue</button>
              <button onClick={handleEndSession} disabled={ending} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-red-600 rounded border border-red-500/50 hover:bg-red-500 transition-colors ${ending ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {ending ? 'Ending...' : 'End Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen QR Modal */}
      {isFullscreenQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15, 27, 46, 0.95)" }} onClick={() => setIsFullscreenQr(false)}>
          {/* Close button - Top right corner */}
          <button 
            onClick={() => setIsFullscreenQr(false)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            title="Close (or click anywhere)"
          >
            <span className="material-symbols-outlined text-[24px] text-white">close</span>
          </button>

          <div className="flex flex-col items-center gap-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            {/* Header Badge */}
            <div className="flex items-center gap-3 px-6 py-2.5 rounded-lg" style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}>
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "#3B82F6" }}></div>
              <span className="text-sm font-bold uppercase tracking-widest text-white">Live QR Code</span>
            </div>
            
            {/* QR Code */}
            <div className="p-8 bg-white rounded-2xl shadow-2xl">
              <QRCodeSVG value={qrValue} size={380} level="H" includeMargin={true} bgColor="#ffffff" fgColor="#0F1B2E" />
            </div>
            
            {/* Info Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-mono px-6 py-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#FFFFFF" }}>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                <strong>Refresh: {qrCountdown}s</strong>
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
              <span className="font-bold">{activeSession.courseCode}</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">groups</span>
                <strong>{attendeeCount} checked in</strong>
              </span>
            </div>
            
            {/* Hint Text */}
            <p className="text-[11px] text-white/50 uppercase tracking-wider">Click anywhere or press ESC to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
