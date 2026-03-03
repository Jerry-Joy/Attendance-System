import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, MapPin, QrCode, Shield, Eye, EyeOff, AlertCircle, Fingerprint } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [lecturerId, setLecturerId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ id?: string; password?: string }>({})

  const validate = () => {
    const errs: { id?: string; password?: string } = {}
    if (!lecturerId.trim()) errs.id = 'Lecturer ID is required'
    if (!password) errs.password = 'Password is required'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    setTimeout(() => {
      const result = login(lecturerId.trim(), password)
      if (result.success) {
        navigate('/courses')
      } else {
        setError(result.error || 'Login failed')
        setLoading(false)
      }
    }, 800)
  }

  const features = [
    { icon: MapPin, label: 'Geofencing Secured' },
    { icon: QrCode, label: 'Dynamic QR Rotation' },
    { icon: Fingerprint, label: 'Liveness Detection' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
      {/* Top navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-10 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">SmartAttendance</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            University Portal
          </button>
          <button className="px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors">
            Support
          </button>
        </div>
      </nav>

      {/* Centered login card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[440px]">
          {/* Logo / crest */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-[26px] font-bold text-slate-800 tracking-tight">Lecturer Portal</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to manage your attendance sessions</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Lecturer ID</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                  <input
                    type="text"
                    value={lecturerId}
                    onChange={(e) => { setLecturerId(e.target.value); setFieldErrors((p) => ({ ...p, id: undefined })); setError('') }}
                    placeholder="Enter your lecturer ID"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.id ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                      }`}
                  />
                </div>
                {fieldErrors.id && <p className="text-xs text-red-500 mt-1">{fieldErrors.id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); setError('') }}
                    placeholder="Enter your password"
                    className={`w-full pl-11 pr-11 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.password ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-500 accent-brand-500" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:shadow-brand-600/30 hover:-translate-y-[1px] active:translate-y-0"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-700 font-medium text-center">Demo: <span className="font-mono">LEC001</span> / <span className="font-mono">password</span></p>
            </div>
          </div>

          {/* Feature badges */}
          <div className="flex items-center justify-center gap-5 mt-8 flex-wrap">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-400">
                <f.icon className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-medium">{f.label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">SmartAttend v1.0 · QR + GPS Geofencing</p>
        </div>
      </div>
    </div>
  )
}
