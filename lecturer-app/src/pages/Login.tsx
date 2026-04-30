import { useState, type FormEvent } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Authentication failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D11] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase mb-1">
            Smart Attendance System
          </h1>
          <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
            Welcome Back
          </h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Sign in to manage courses
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-[#15181E] py-8 px-4 border border-slate-200 dark:border-slate-800 shadow-2xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-mono uppercase text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono tracking-widest"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1.5">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-slate-50 dark:bg-[#0B0D11] border-slate-200 dark:border-slate-800 rounded focus:ring-blue-500 text-blue-500 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-[10px] uppercase font-mono text-slate-600 dark:text-slate-400 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-[10px]">
                <a href="#" className="font-bold uppercase tracking-wider text-blue-500 hover:text-blue-400 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex justify-center py-2.5 px-4 border border-blue-500/50 rounded bg-blue-600 hover:bg-blue-500 text-[12px] font-bold text-white uppercase tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors cursor-pointer ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
            
            <div className="mt-6 flex flex-col items-center justify-center border-t border-slate-200 dark:border-slate-800 pt-6">
              <p className="text-[10px] uppercase font-mono text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-blue-500 hover:text-blue-400 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
