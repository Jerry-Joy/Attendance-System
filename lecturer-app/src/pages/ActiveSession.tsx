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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D11] flex flex-col pt-20 px-4 sm:px-8 relative overflow-hidden font-sans">
      {/* Topnav */}
      <header className="fixed top-0 left-0 right-0 h-14 border-b border-white/10 px-6 flex items-center justify-between z-40" style={{ backgroundColor: "#081637" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Return to dashboard (session stays active)" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Live Session</span>
          </div>
          <span className="text-[10px] text-white/60 font-mono uppercase font-bold tracking-wider">{activeSession.courseCode}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/session/live-monitor" className="text-[10px] font-bold uppercase tracking-wider hover:opacity-70 transition-opacity flex items-center gap-1" style={{ color: "#F5B41C" }}>
            <span className="material-symbols-outlined text-[14px]">monitor_heart</span>
            Live Attendance
          </Link>
          <button onClick={() => setShowEndConfirm(true)} className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-90 cursor-pointer" style={{ backgroundColor: "#F5B41C", color: "#081637" }}>
            End Session
          </button>
        </div>
      </header>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-[30%] h-[30%] bg-blue-500/3 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[15%] right-[10%] w-[25%] h-[25%] bg-emerald-500/3 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col mt-4 relative z-10 pb-12">
        {/* Time + Progress Bar */}
        <div className="bg-white dark:bg-[#15181E] rounded-lg p-5 mb-6 border-t-4" style={{ borderColor: "#081637", borderLeftColor: "#0D2A66", borderRightColor: "#0D2A66", borderBottomColor: "#0D2A66", borderWidth: "4px 1px 1px 1px", borderStyle: "solid" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Elapsed</p>
                <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{formatTime(elapsed)}</p>
              </div>
              <div className="w-px h-10 bg-slate-100 dark:bg-slate-800"></div>
              <div className="text-center">
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Remaining</p>
                <p className={`text-2xl font-bold font-mono tabular-nums ${remaining < 60 ? 'text-red-400' : ''}`} style={remaining >= 60 ? { color: "#081637" } : {}}>{formatTime(remaining)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Duration</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{activeSession.duration} min</p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${progress >= 90 ? 'bg-red-500' : ''}`} style={progress < 90 ? { width: `${progress}%`, backgroundColor: "#081637" } : { width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code Section */}
          <div className="lg:col-span-1 rounded-lg flex flex-col items-center gap-4" style={{ backgroundColor: "#081637" }}>
            <div className="flex items-center justify-between w-full p-6 border-b border-white/10">
              <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">QR Code</h3>
              <div className="flex items-center gap-1 text-[10px] font-mono text-white/50">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span className="tabular-nums">{qrCountdown}s</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl cursor-pointer hover:scale-105 transition-transform relative mx-auto mt-2" onClick={() => setIsFullscreenQr(true)}>
              <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} bgColor="#ffffff" fgColor="#0B0D11" />
            </div>

            <div className="w-full px-6 pb-2 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest">Auto-Refresh</span>
                <span className="text-[9px] font-mono uppercase text-white">{qrCountdown}s</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 bg-white" style={{ width: `${(qrCountdown / 30) * 100}%` }} />
              </div>
            </div>

            <div className="w-full px-6 pb-6 mt-2">
              <button onClick={() => setIsFullscreenQr(true)} className="w-full px-4 py-3 rounded text-[10px] font-bold uppercase tracking-wider transition-opacity flex items-center justify-center gap-2 hover:opacity-90" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#FFFFFF" }}>
                <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                Expand QR
              </button>
            </div>
          </div>

          {/* Stats + Info Section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-[20px] mb-1 block" style={{ color: "#081637" }}>groups</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{attendeeCount}</p>
                <p className="text-[9px] text-slate-500 font-mono uppercase">Checked In</p>
              </div>
              <div className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-[20px] mb-1 block" style={{ color: "#0D2A66" }}>verified_user</span>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "#0D2A66" }}>{gpsVerified}</p>
                <p className="text-[9px] text-slate-500 font-mono uppercase">GPS Verified</p>
              </div>
              <div className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-[20px] mb-1 block" style={{ color: "#0D2A66" }}>trending_up</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{enrolled > 0 ? Math.round((attendeeCount / enrolled) * 100) : 0}%</p>
                <p className="text-[9px] text-slate-500 font-mono uppercase">Attendance Rate</p>
              </div>
              <div className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-[20px] mb-1 block" style={{ color: "#081637" }}>people_outline</span>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "#081637" }}>{Math.max(0, enrolled - attendeeCount)}</p>
                <p className="text-[9px] text-slate-500 font-mono uppercase">Remaining</p>
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-white dark:bg-[#15181E] rounded-lg p-5 border-t-4" style={{ borderColor: "#081637", borderLeftColor: "#0D2A66", borderRightColor: "#0D2A66", borderBottomColor: "#0D2A66", borderWidth: "4px 1px 1px 1px", borderStyle: "solid" }}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#081637" }}>Session Info</h3>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-mono uppercase">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/50 pb-2">
                  <span className="text-slate-500">Course</span>
                  <span className="font-bold" style={{ color: "#081637" }}>{activeSession.courseCode}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/50 pb-2">
                  <span className="text-slate-500">Venue</span>
                  <span className="font-bold" style={{ color: "#081637" }}>{course?.venueName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/50 pb-2">
                  <span className="text-slate-500">Geofence</span>
                  <span className="font-bold" style={{ color: "#0D2A66" }}>{activeSession.radius}m</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/50 pb-2">
                  <span className="text-slate-500">Enrolled</span>
                  <span className="font-bold" style={{ color: "#081637" }}>{enrolled}</span>
                </div>
              </div>
            </div>

            {/* Recent Check-ins */}
            <div className="bg-white dark:bg-[#15181E] rounded-lg p-5 border-t-4" style={{ borderColor: "#081637", borderLeftColor: "#0D2A66", borderRightColor: "#0D2A66", borderBottomColor: "#0D2A66", borderWidth: "4px 1px 1px 1px", borderStyle: "solid" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#081637" }}>Recent Check-ins</h3>
                <Link to="/session/live-monitor" className="text-[10px] font-bold uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: "#0D2A66" }}>View All</Link>
              </div>
              {activeSession.attendees.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-[32px] text-slate-600 mb-2 block">hourglass_empty</span>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">Waiting for check-ins...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto relative pl-4">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800" style={{ backgroundColor: "rgba(8,22,55,0.1)" }}></div>
                  {[...activeSession.attendees].reverse().slice(0, 6).map((student, idx) => (
                    <div key={student.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#0B0D11]/50 rounded border border-slate-200 dark:border-slate-800/50 relative z-10 group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {idx === 0 && (
                            <div className="absolute -inset-1 rounded-full animate-pulse opacity-50" style={{ backgroundColor: "#0D2A66" }}></div>
                          )}
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold relative z-10" style={{ backgroundColor: "#0D2A66", color: "#FFFFFF" }}>{student.avatarInitials}</div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{student.indexNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">{student.time}</span>
                        {student.gpsVerified ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border" style={{ color: "#0D2A66", backgroundColor: "rgba(13, 42, 102, 0.1)", borderColor: "rgba(13, 42, 102, 0.2)" }}>GPS ✓</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border" style={{ color: "#081637", backgroundColor: "rgba(8, 22, 55, 0.1)", borderColor: "rgba(8, 22, 55, 0.2)" }}>Pending</span>
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

      {/* End Session Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0D11]/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <span className="material-symbols-outlined text-[24px] text-red-400">stop_circle</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white text-center uppercase tracking-wider mb-2">End Session?</h3>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 text-center font-mono uppercase mb-6">
              {attendeeCount} student{attendeeCount !== 1 ? 's' : ''} checked in. Session data will be archived.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:bg-slate-800 transition-colors">Continue</button>
              <button onClick={handleEndSession} disabled={ending} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white bg-red-600 rounded border border-red-500/50 hover:bg-red-500 transition-colors ${ending ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {ending ? 'Ending...' : 'End Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen QR Modal */}
      {isFullscreenQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0D11]/95 backdrop-blur-sm cursor-pointer" onClick={() => setIsFullscreenQr(false)}>
          <div className="flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
            <div className="p-8 bg-white rounded-2xl shadow-2xl">
              <QRCodeSVG value={qrValue} size={350} level="H" includeMargin={true} bgColor="#ffffff" fgColor="#0B0D11" />
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase">
              <span>Auto-refresh: {qrCountdown}s</span>
              <span>|</span>
              <span>{activeSession.courseCode}</span>
              <span>|</span>
              <span>{attendeeCount} checked in</span>
            </div>
            <button onClick={() => setIsFullscreenQr(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded text-[10px] font-bold uppercase tracking-wider border border-slate-300 dark:border-slate-700 hover:bg-slate-700 transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
