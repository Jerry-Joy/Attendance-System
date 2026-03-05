import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Target,
  Clock,
  QrCode,
  Navigation,
  AlertTriangle,
  ChevronDown,
  CheckCircle,
  BookOpen,
} from 'lucide-react'
import { useData } from '../context/DataContext'

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120]

export default function StartSession() {
  const navigate = useNavigate()
  const { courses: mockCourses } = useData()
  const { id } = useParams<{ id: string }>()

  // ── Form state ──────────────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] = useState(id || mockCourses[0]?.id)
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [geofenceRadius, setGeofenceRadius] = useState(50)
  const [loading, setLoading] = useState(false)

  // ── GPS state ───────────────────────────────────────────────
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [capturingLocation, setCapturingLocation] = useState(false)

  const selectedCourse = mockCourses.find((c) => c.id === selectedCourseId) || mockCourses[0]
  const locationCaptured = latitude !== null && longitude !== null

  // ── Real browser GPS capture ────────────────────────────────
  const handleCaptureLocation = () => {
    setGpsError(null)

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.')
      return
    }

    setCapturingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setCapturingLocation(false)
      },
      (error) => {
        setCapturingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Location permission denied. Please allow location access in your browser settings and try again.')
            break
          case error.POSITION_UNAVAILABLE:
            setGpsError('Location information is unavailable. Please check your device settings.')
            break
          case error.TIMEOUT:
            setGpsError('Location request timed out. Please try again.')
            break
          default:
            setGpsError('An unknown error occurred while retrieving location.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const handleResetLocation = () => {
    setLatitude(null)
    setLongitude(null)
    setGpsError(null)
  }

  // ── Submit ──────────────────────────────────────────────────
  const handleStart = () => {
    if (!locationCaptured) return
    setLoading(true)
    setTimeout(() => {
      navigate('/active-session', {
        state: {
          courseId: selectedCourse.id,
          radius: geofenceRadius,
          duration: `${durationMinutes} min`,
          latitude,
          longitude,
        },
      })
    }, 1000)
  }

  // Slider percentage for gradient fill
  const sliderPercent = ((geofenceRadius - 30) / (100 - 30)) * 100

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Start Session</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure and launch an attendance session</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── 1. Course Dropdown ──────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Course</h3>
          </div>
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              {mockCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} ({c.studentCount} students)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {/* Selected course info */}
          <div className="mt-3 flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20">
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedCourse.code}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCourse.name} · {selectedCourse.venueName || 'No venue set'}</p>
            </div>
          </div>
        </div>

        {/* ── 2. Attendance Duration ─────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Attendance Duration</h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">How long the session will remain open for check-ins</p>

          <div className="flex items-center gap-3 mb-3">
            <input
              type="number"
              min={5}
              max={300}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, Math.min(300, Number(e.target.value))))}
              className="w-24 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-center text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400">minutes</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                onClick={() => setDurationMinutes(d)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${durationMinutes === d
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
              >
                {d >= 60 ? `${d / 60}h` : `${d}m`}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. Geofence Radius Slider (30m – 100m) ─────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Geofence Radius</h3>
            </div>
            <span className="text-lg font-bold text-brand-600 dark:text-brand-400">{geofenceRadius}m</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Students must be within this distance to mark attendance</p>

          {/* Range slider */}
          <div className="relative">
            <input
              type="range"
              min={30}
              max={100}
              step={1}
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
              style={{
                background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${sliderPercent}%, #e2e8f0 ${sliderPercent}%, #e2e8f0 100%)`,
              }}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">30m</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">50m</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">75m</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">100m</span>
            </div>
          </div>

          {/* Visual indicator */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative w-14 h-14">
              <div
                className="absolute inset-0 rounded-full border-2 border-brand-300 dark:border-brand-500/50 bg-brand-50 dark:bg-brand-500/10 transition-all duration-300"
                style={{
                  transform: `scale(${0.5 + (geofenceRadius - 30) / 140})`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{geofenceRadius}m radius</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {geofenceRadius <= 40
                  ? 'Very tight — small classroom'
                  : geofenceRadius <= 60
                    ? 'Standard — medium lecture room'
                    : geofenceRadius <= 80
                      ? 'Wide — large lecture hall'
                      : 'Very wide — auditorium / outdoor'}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. Venue Location (real GPS) ───────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Venue Location</h3>
          </div>

          {/* GPS Error */}
          {gpsError && (
            <div className="flex items-start gap-3 p-3 mb-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Location Error</p>
                <p className="text-xs text-red-600 dark:text-red-400/80 mt-0.5">{gpsError}</p>
              </div>
            </div>
          )}

          {locationCaptured ? (
            <div>
              {/* Success state with coordinates */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 mb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Location Captured</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400/80">GPS coordinates acquired successfully</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-slate-700 rounded-lg p-2.5 border border-emerald-100 dark:border-slate-600">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Latitude</p>
                    <p className="text-sm font-mono font-bold text-slate-800 dark:text-white">{latitude!.toFixed(6)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-700 rounded-lg p-2.5 border border-emerald-100 dark:border-slate-600">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Longitude</p>
                    <p className="text-sm font-mono font-bold text-slate-800 dark:text-white">{longitude!.toFixed(6)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleResetLocation}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium transition-all"
              >
                Recapture Location
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Your browser will request GPS permission to capture the venue's exact coordinates.
              </p>
              <button
                onClick={handleCaptureLocation}
                disabled={capturingLocation}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-60"
              >
                {capturingLocation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Acquiring GPS Signal...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    Capture My Location
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* QR Info */}
        <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 flex items-start gap-3">
          <QrCode className="w-5 h-5 text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Dynamic QR Code</p>
            <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
              A time-sensitive QR code will be generated that refreshes every 30 seconds
            </p>
          </div>
        </div>
      </div>

      {/* ── Start Button ──────────────────────────────────────── */}
      <div className="mt-8 sticky bottom-5">
        <button
          onClick={handleStart}
          disabled={!locationCaptured || loading}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Starting Session...
            </>
          ) : (
            'Start Attendance Session'
          )}
        </button>
        {!locationCaptured && !gpsError && (
          <p className="text-center text-xs text-amber-600 mt-2">
            Please capture venue location before starting
          </p>
        )}
      </div>
    </div>
  )
}
