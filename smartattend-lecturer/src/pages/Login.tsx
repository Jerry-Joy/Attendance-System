import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Lock, User, MapPin, QrCode, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [lecturerId, setLecturerId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login()
      navigate('/courses')
    }, 800)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] bg-brand-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500" />
        <div className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-32 right-10 w-64 h-64 rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/3 right-24 w-40 h-40 rounded-full bg-white/[0.06]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-white text-3xl font-extrabold tracking-tight">SmartAttend</h1>
              <p className="text-blue-200/80 text-sm font-medium">Lecturer Dashboard</p>
            </div>
          </div>

          <p className="text-blue-100 text-xl font-light leading-relaxed mb-14 max-w-md">
            Manage attendance with dynamic QR codes and GPS geofencing verification.
          </p>

          <div className="space-y-5">
            {[
              { icon: QrCode, text: 'Dynamic QR codes that refresh every 30 seconds' },
              { icon: MapPin, text: 'GPS geofencing ensures physical presence' },
              { icon: Shield, text: 'Tamper-proof attendance verification' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <item.icon className="w-5 h-5 text-blue-200" />
                </div>
                <p className="text-blue-100/90 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-slate-800 text-2xl font-extrabold tracking-tight">SmartAttend</h1>
              <p className="text-slate-500 text-sm">Lecturer Dashboard</p>
            </div>
          </div>

          <h2 className="text-[26px] font-bold text-slate-800 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 mt-1.5 mb-8">Sign in to manage your attendance sessions</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Lecturer ID</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type="text"
                  value={lecturerId}
                  onChange={(e) => setLecturerId(e.target.value)}
                  placeholder="Enter your lecturer ID"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
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

          <div className="mt-8 p-4 bg-brand-50 rounded-xl border border-brand-100">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <p className="text-sm text-brand-600 leading-relaxed">
                This app uses GPS location verification to ensure students are physically present during attendance sessions.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">SmartAttend v1.0 · QR + GPS Geofencing</p>
        </div>
      </div>
    </div>
  )
}
