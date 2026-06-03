import { useNavigate, useSearchParams } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { useData } from "../context/DataContext";
import { api } from "../lib/api";
import type { ActiveSessionType } from "../types";

function readGeoSample(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 30000, // Increased to 30 seconds for desktop/laptop GPS
      maximumAge: 5000, // Allow cached position up to 5 seconds old
    });
  });
}

export default function CreateSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courses, startActiveSession, activeSession } = useData();

  const initialCourseId = searchParams.get('course') || courses[0]?.id || '';
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [duration, setDuration] = useState("15");
  const [radius, setRadius] = useState("50");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GPS state
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'locked' | 'error'>('idle');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // System status state
  const [systemStatus, setSystemStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  // If there's already an active session, redirect
  useEffect(() => {
    if (activeSession) {
      navigate('/session/active', { replace: true });
    }
  }, [activeSession, navigate]);

  const captureGps = useCallback(async () => {
    setGpsStatus('acquiring');
    setGpsError(null);

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Take 3 samples for better accuracy
      const samples: GeolocationPosition[] = [];
      const maxSamples = 3;
      const minSamples = 1; // At least 1 sample required

      for (let i = 0; i < maxSamples; i++) {
        try {
          const pos = await readGeoSample();
          samples.push(pos);
          console.log(`GPS sample ${i + 1}/${maxSamples}:`, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        } catch (sampleErr) {
          console.warn(`Failed to get GPS sample ${i + 1}:`, sampleErr);
          // Continue trying to get remaining samples
          if (samples.length >= minSamples) {
            break; // We have enough samples
          }
          if (i === maxSamples - 1) {
            throw sampleErr; // Last attempt failed and we don't have enough samples
          }
        }
      }

      if (samples.length === 0) {
        throw new Error('Could not acquire any GPS samples');
      }

      // Average the samples
      const avgLat = samples.reduce((s, p) => s + p.coords.latitude, 0) / samples.length;
      const avgLng = samples.reduce((s, p) => s + p.coords.longitude, 0) / samples.length;
      const bestAccuracy = Math.min(...samples.map(p => p.coords.accuracy));

      setLatitude(avgLat);
      setLongitude(avgLng);
      setGpsAccuracy(Number(bestAccuracy.toFixed(1)));
      setGpsStatus('locked');
      console.log('GPS locked:', { lat: avgLat, lng: avgLng, accuracy: bestAccuracy, samples: samples.length });
    } catch (err: any) {
      console.error('GPS error:', err);
      setGpsStatus('error');
      
      // Provide more specific error messages
      let errorMessage = 'Failed to acquire location.';
      
      if (err.code === 1) {
        errorMessage = 'Location permission denied. Please allow location access in your browser settings.';
      } else if (err.code === 2) {
        errorMessage = 'Location unavailable. Make sure location services are enabled on your device.';
      } else if (err.code === 3) {
        errorMessage = 'Location request timed out. This may happen on devices without GPS. Try again or use a mobile device.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setGpsError(errorMessage);
    }
  }, []);

  // Start GPS capture on mount
  useEffect(() => {
    captureGps();
  }, [captureGps]);

  // Check backend health on mount
  useEffect(() => {
    api.checkHealth().then((res) => {
      setSystemStatus(res.status === 'ok' ? 'ok' : 'error');
    });
  }, []);

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseData || gpsStatus !== 'locked' || latitude === null || longitude === null) {
      setError('Please wait for GPS to lock before starting the session');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const backendSession = await api.createSession({
        courseId: selectedCourseData.id,
        duration: Number(duration),
        latitude: latitude,
        longitude: longitude,
        lecturerAccuracy: gpsAccuracy!,
        lecturerLocationCapturedAt: new Date().toISOString(),
        geofenceRadius: Number(radius),
      });

      const session: ActiveSessionType = {
        courseId: selectedCourseData.id,
        courseCode: selectedCourseData.code,
        courseName: selectedCourseData.name,
        radius: Number(radius),
        duration,
        latitude: latitude,
        longitude: longitude,
        lecturerAccuracy: gpsAccuracy!,
        startedAt: new Date(backendSession.startedAt).getTime(),
        attendees: [],
        sessionId: backendSession.id,
        qrToken: backendSession.qrToken,
      };

      startActiveSession(session);
      navigate('/session/active');
    } catch (err: any) {
      setError(err?.message || 'Failed to create session');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20 px-4 sm:px-8 relative overflow-hidden font-sans">
      {/* Topnav */}
      <header className="fixed top-0 left-0 right-0 h-14 border-b border-white/10 px-6 flex items-center justify-between z-40" style={{ backgroundColor: "#081637" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
          <h1 className="text-xs font-bold text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>Start Session</h1>
        </div>
      </header>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-emerald-500/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col mt-4 relative z-10 pb-12">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          {/* Left Info Panel */}
          <div className="w-full lg:w-1/3 flex flex-col" style={{ backgroundColor: "#081637" }}>
            <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col items-center text-center">
              <div className="w-24 h-24 flex items-center justify-center mb-6">
                <img src="/gctu-crest.png" alt="GCTU Crest" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wider mb-2 text-white">Session Setup</h2>
              <p className="text-[10px] text-white/60 font-mono leading-relaxed">
                Choose the course and set the location rules. A dynamic QR code will be used when you start.
              </p>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col gap-4" style={{ backgroundColor: "rgba(0,0,0,0.15)" }}>
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">System Check</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full transition-colors ${systemStatus === 'ok' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : systemStatus === 'checking' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-mono text-white/70 uppercase">System Status</span>
                </div>
                <span className="text-[10px] font-mono font-bold" style={{ color: "#F5B41C" }}>
                  {systemStatus === 'ok' ? 'OK' : systemStatus === 'checking' ? 'Checking...' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full transition-colors ${gpsStatus === 'locked' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : gpsStatus === 'acquiring' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-pulse' : gpsStatus === 'error' ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                  <span className="text-[10px] font-mono text-white/70 uppercase">GPS Accuracy</span>
                </div>
                <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: "#F5B41C" }}>
                  {gpsStatus === 'locked' && gpsAccuracy !== null ? `±${gpsAccuracy}m` : gpsStatus === 'acquiring' ? 'Acquiring...' : gpsStatus === 'error' ? 'Error' : 'Idle'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                  <span className="text-[10px] font-mono text-white/70 uppercase">Blockchain</span>
                </div>
                <span className="text-[10px] font-mono font-bold" style={{ color: "#F5B41C" }}>READY</span>
              </div>
              {gpsStatus === 'error' && gpsError && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-mono">
                  {gpsError}
                </div>
              )}
              {(gpsStatus === 'locked' || gpsStatus === 'error') && (
                <button type="button" onClick={captureGps} className="mt-2 text-[10px] font-mono uppercase transition-colors flex items-center gap-1 hover:opacity-70" style={{ color: "#F5B41C" }}>
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  {gpsStatus === 'locked' ? 'Refresh GPS' : 'Retry GPS Capture'}
                </button>
              )}
            </div>
          </div>

          {/* Right Form Panel */}
          <form onSubmit={handleStart} className="p-6 sm:p-8 w-full lg:w-2/3 flex flex-col justify-between bg-white">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-mono uppercase text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Column 1 */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3 block">Choose Course</label>
                  <div className="flex flex-col gap-2">
                    {courses.map(course => (
                      <label key={course.id} className={`relative p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${selectedCourse === course.id ? 'bg-amber-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`} style={selectedCourse === course.id ? { borderColor: "#F5B41C" } : {}}>
                        <input type="radio" name="course" value={course.id} checked={selectedCourse === course.id} onChange={() => setSelectedCourse(course.id)} className="sr-only" />
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${selectedCourse === course.id ? 'border-amber-400' : 'border-slate-600'}`}>
                            {selectedCourse === course.id && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F5B41C" }}></div>}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 uppercase block">{course.name}</span>
                            <span className="text-[10px] text-emerald-400 font-mono">{course.studentCount} students</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{course.code}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3 block">Session Length</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono transition-colors appearance-none cursor-pointer" style={{ outlineColor: "#081637" }}>
                    <option value="5">5 Minutes</option>
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes</option>
                    <option value="90">90 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3 block">Location Coordinates</label>
                  <input type="text" disabled value={latitude !== null && longitude !== null ? `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°` : 'Acquiring GPS location...'} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-500 font-mono cursor-not-allowed" />
                  <p className="text-[9px] text-slate-500 font-mono mt-1.5 uppercase">
                    {gpsStatus === 'locked' ? `GPS Locked — ±${gpsAccuracy}m accuracy` : gpsStatus === 'acquiring' ? 'Acquiring from device GPS sensor...' : gpsStatus === 'error' ? 'GPS Error - Click Retry above' : 'Awaiting GPS lock'}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3 block">Allowed Radius (meters)</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="10" max="200" step="10" value={radius} onChange={(e) => setRadius(e.target.value)} className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" style={{ accentColor: "#F5B41C" }} />
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded" style={{ color: "#081637", backgroundColor: "rgba(245, 180, 28, 0.2)" }}>{radius}m</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3 block">Attendance Checks</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1 p-3 rounded border border-slate-200 bg-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-900 tracking-widest uppercase">Location Required</span>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Always On</span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase">Students must be within the geofence to check in</p>
                    </div>
                    <label className="flex flex-col gap-1 p-3 rounded border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-900 tracking-widest uppercase">Save to Blockchain</span>
                        <input type="checkbox" defaultChecked className="w-3 h-3 bg-white border-slate-300 rounded focus:ring-0" style={{ accentColor: "#081637" }} />
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase">Save verified attendance to blockchain</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-slate-200 flex justify-end gap-3">
              <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 rounded border border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={gpsStatus !== 'locked' || submitting} className={`px-6 py-2.5 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 transition-opacity ${gpsStatus !== 'locked' || submitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`} style={{ backgroundColor: "#F5B41C", color: "#081637" }}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Starting...
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                    Start Session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
