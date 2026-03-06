import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Lock,
  User,
  Mail,
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
  Moon,
  Sun,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  QrCode,
  MapPin,
  ScanFace,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

interface FormErrors {
  name?: string
  email?: string
  department?: string
  lecturerId?: string
  password?: string
  confirmPassword?: string
}

export default function SignUp() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [lecturerId, setLecturerId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})

  /* ── Step management (1 = info, 2 = credentials) ────── */
  const [step, setStep] = useState<1 | 2>(1)

  const clearFieldError = (field: keyof FormErrors) =>
    setFieldErrors((p) => ({ ...p, [field]: undefined }))

  const validateStep1 = () => {
    const errs: FormErrors = {}
    if (!name.trim()) errs.name = 'Full name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email'
    if (!department.trim()) errs.department = 'Department is required'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs: FormErrors = {}
    if (!lecturerId.trim()) errs.lecturerId = 'Lecturer ID is required'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateStep2()) return

    setLoading(true)
    const result = await signup({
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      staffId: lecturerId.trim().toUpperCase(),
      password,
    })
    if (result.success) {
      navigate('/courses')
    } else {
      setError(result.error || 'Signup failed')
      setLoading(false)
    }
  }

  /* Password strength */
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '', width: '0%' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' }
    if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: '40%' }
    if (score <= 3) return { label: 'Good', color: 'bg-sky-500', width: '60%' }
    if (score <= 4) return { label: 'Strong', color: 'bg-emerald-500', width: '80%' }
    return { label: 'Very Strong', color: 'bg-emerald-500', width: '100%' }
  }
  const strength = getPasswordStrength()

  const highlights = [
    { icon: QrCode, title: 'Dynamic QR Codes', desc: 'Auto-rotating codes prevent screenshot sharing' },
    { icon: MapPin, title: 'GPS Geofencing', desc: 'Verify students are physically present in the venue' },
    { icon: ScanFace, title: 'Liveness Detection', desc: 'AI-powered face check stops proxy attendance' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track attendance trends and generate instant reports' },
  ]

  return (
    <div className="h-dvh flex bg-gradient-to-br from-slate-50 via-white to-brand-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* ── Left Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 dark:from-brand-700 dark:via-brand-600 dark:to-indigo-700">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-6 xl:p-8 w-full overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">SmartAttend</span>
          </div>

          <div className="my-auto py-4">
            <p className="text-brand-200 text-sm font-semibold uppercase tracking-widest mb-3">Get Started</p>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Join thousands<br />
              <span className="text-brand-200">of lecturers.</span>
            </h1>
            <p className="mt-3 text-brand-100/80 text-sm leading-relaxed max-w-md">
              Create your free account and start taking attendance smarter — with QR codes, GPS verification, and AI-powered analytics.
            </p>

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

        <div className="px-6 py-4">
          <div className="w-full max-w-[420px] mx-auto">
            {/* Heading */}
            <div className="mb-4">
              <div className="lg:hidden flex justify-center mb-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shadow-lg shadow-brand-200/50 dark:shadow-brand-500/10">
                  <GraduationCap className="w-6 h-6 text-brand-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight text-center lg:text-left">
                Create your account
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center lg:text-left">
                Fill in your details to get started
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-4">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                      }`}
                  >
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span
                    className={`text-xs font-semibold ${step >= s ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                  >
                    {s === 1 ? 'Personal Info' : 'Credentials'}
                  </span>
                  {s === 1 && (
                    <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ml-2">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: step >= 2 ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 p-5">
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl animate-slide-up">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (step === 1) handleNext()
                  else handleSubmit(e)
                }}
                className="space-y-4"
              >
                {step === 1 ? (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => { setName(e.target.value); clearFieldError('name') }}
                          placeholder="e.g. Prof. Adeyemi"
                          className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.name ? 'border-red-300 dark:border-red-500/40' : 'border-slate-200 dark:border-slate-600'
                            }`}
                        />
                      </div>
                      {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                    </div>

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
                          onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                          placeholder="lecturer@university.edu"
                          className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.email ? 'border-red-300 dark:border-red-500/40' : 'border-slate-200 dark:border-slate-600'
                            }`}
                        />
                      </div>
                      {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Department
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => { setDepartment(e.target.value); clearFieldError('department') }}
                          placeholder="e.g. Computer Science Dept."
                          className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.department ? 'border-red-300 dark:border-red-500/40' : 'border-slate-200 dark:border-slate-600'
                            }`}
                        />
                      </div>
                      {fieldErrors.department && <p className="text-xs text-red-500 mt-1">{fieldErrors.department}</p>}
                    </div>

                    {/* Continue */}
                    <button
                      type="submit"
                      className="group w-full py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:shadow-brand-600/30 hover:-translate-y-[1px] active:translate-y-0"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Lecturer ID */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Lecturer ID
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          value={lecturerId}
                          onChange={(e) => { setLecturerId(e.target.value); clearFieldError('lecturerId') }}
                          placeholder="e.g. LEC001"
                          className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.lecturerId ? 'border-red-300 dark:border-red-500/40' : 'border-slate-200 dark:border-slate-600'
                            }`}
                        />
                      </div>
                      {fieldErrors.lecturerId && <p className="text-xs text-red-500 mt-1">{fieldErrors.lecturerId}</p>}
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
                          onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); setError('') }}
                          placeholder="Min. 6 characters"
                          className={`w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.password ? 'border-red-300 dark:border-red-500/40' : 'border-slate-200 dark:border-slate-600'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                      </div>
                      {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                      {/* Strength bar */}
                      {password && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${strength.color} rounded-full transition-all duration-500`}
                              style={{ width: strength.width }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 w-16 text-right">
                            {strength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500" />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword') }}
                          placeholder="Re-enter your password"
                          className={`w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.confirmPassword ? 'border-red-300 dark:border-red-500/40' : 'border-slate-200 dark:border-slate-600'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Back + Submit */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center justify-center gap-1.5 px-5 py-3.5 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex-1 py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:shadow-brand-600/30 hover:-translate-y-[1px] active:translate-y-0"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>

              {/* Terms notice */}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2.5 leading-relaxed">
                By creating an account, you agree to our{' '}
                <button className="text-brand-500 dark:text-brand-400 hover:underline font-medium">Terms</button> and{' '}
                <button className="text-brand-500 dark:text-brand-400 hover:underline font-medium">Privacy Policy</button>.
              </p>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white dark:bg-slate-800 text-xs font-medium text-slate-400 dark:text-slate-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Sign in link */}
              <Link
                to="/login"
                className="group w-full flex items-center justify-center gap-2 py-2.5 border-2 border-brand-200 dark:border-brand-500/30 hover:border-brand-400 dark:hover:border-brand-500/50 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5 rounded-xl font-semibold text-sm transition-all"
              >
                Sign in instead
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
              SmartAttend v1.0 &middot; QR + GPS Geofencing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
