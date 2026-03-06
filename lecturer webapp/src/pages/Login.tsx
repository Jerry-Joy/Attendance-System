import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Lock,
  Mail,
  QrCode,
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
  ScanFace,
  Moon,
  Sun,
  ArrowRight,
  MapPin,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const errs: { email?: string; password?: string } = {}
    if (!email.trim()) errs.email = 'Email is required'
    if (!password) errs.password = 'Password is required'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    const result = await login(email.trim(), password)
    if (result.success) {
      navigate('/courses')
    } else {
      setError(result.error || 'Login failed')
      setLoading(false)
    }
  }

  const highlights = [
    { icon: QrCode, title: 'Dynamic QR Codes', desc: 'Auto-rotating codes prevent screenshot sharing' },
    { icon: MapPin, title: 'GPS Geofencing', desc: 'Verify students are physically present in the venue' },
    { icon: ScanFace, title: 'Liveness Detection', desc: 'AI-powered face check stops proxy attendance' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track attendance trends and generate instant reports' },
  ]

  return (
    <div className="h-dvh flex bg-gradient-to-br from-slate-50 via-white to-brand-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* ── Left Panel (hidden on small screens) ─────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 dark:from-brand-700 dark:via-brand-600 dark:to-indigo-700">
        {/* Decorative shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-6 xl:p-8 w-full overflow-y-auto">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">SmartAttend</span>
          </div>

          {/* Hero text */}
          <div className="my-auto py-4">
            <p className="text-brand-200 text-sm font-semibold uppercase tracking-widest mb-3">Lecturer Portal</p>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Smart Attendance<br />
              <span className="text-brand-200">Made Simple.</span>
            </h1>
            <p className="mt-3 text-brand-100/80 text-sm leading-relaxed max-w-md">
              Manage sessions, track attendance in real-time, and leverage AI-powered verification — all from one dashboard.
            </p>

            {/* Feature highlights */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/10 hover:bg-white/[0.12] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <h.icon className="w-4 h-4 text-brand-200" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{h.title}</p>
                    <p className="text-brand-200/70 text-xs leading-relaxed mt-0.5">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-6">
            {[
              { value: '10k+', label: 'Sessions Held' },
              { value: '150+', label: 'Universities' },
              { value: '99.2%', label: 'Uptime' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-brand-200/60 text-[10px] font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ───────────────────────────── */}
      <div className="flex-1 h-dvh overflow-y-auto">
        {/* Top bar */}
        <nav className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 py-3">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-200 dark:shadow-brand-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">SmartAttend</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Centered form */}
        <div className="px-6 py-4">
          <div className="w-full max-w-[420px] mx-auto">
            {/* Heading */}
            <div className="mb-5">
              <div className="lg:hidden flex justify-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shadow-lg shadow-brand-200/50 dark:shadow-brand-500/10">
                  <GraduationCap className="w-6 h-6 text-brand-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight text-center lg:text-left">
                Welcome back
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center lg:text-left">
                Sign in to your lecturer account to continue
              </p>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl animate-slide-up">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setFieldErrors((p) => ({ ...p, email: undefined }))
                        setError('')
                      }}
                      placeholder="e.g. adeyemi@university.edu"
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.email
                        ? 'border-red-300 dark:border-red-500/40 bg-red-50/50 dark:bg-red-500/5'
                        : 'border-slate-200 dark:border-slate-600'
                        }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setFieldErrors((p) => ({ ...p, password: undefined }))
                        setError('')
                      }}
                      placeholder="Enter your password"
                      className={`w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.password
                        ? 'border-red-300 dark:border-red-500/40 bg-red-50/50 dark:bg-red-500/5'
                        : 'border-slate-200 dark:border-slate-600'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-[18px] h-[18px]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-500 accent-brand-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:shadow-brand-600/30 hover:-translate-y-[1px] active:translate-y-0"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo credentials */}
              <div className="mt-4 p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium text-center">
                  Demo: <span className="font-mono">adeyemi@university.edu</span> /{' '}
                  <span className="font-mono">password</span>
                </p>
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white dark:bg-slate-800 text-xs font-medium text-slate-400 dark:text-slate-500">
                    New to SmartAttend?
                  </span>
                </div>
              </div>

              {/* Sign up link */}
              <Link
                to="/signup"
                className="group w-full flex items-center justify-center gap-2 py-2.5 border-2 border-brand-200 dark:border-brand-500/30 hover:border-brand-400 dark:hover:border-brand-500/50 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5 rounded-xl font-semibold text-sm transition-all"
              >
                Create an account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
              SmartAttend v1.0 &middot; QR + GPS Geofencing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
