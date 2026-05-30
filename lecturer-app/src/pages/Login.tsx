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
    <div className="min-h-screen flex bg-white dark:bg-[#0B0D11]">

      {/* Left Panel - Brand Anchor (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-center items-center p-12 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-secondary/20 blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center p-4 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
            <img src="/gctu-crest.png" alt="GCTU Crest" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight uppercase leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            GCTU Smart<br/>Attendance
          </h1>
          <p className="mt-4 text-secondary font-mono tracking-[0.2em] uppercase text-xs font-bold">
            Lecturer Portal
          </p>
          <p className="mt-6 text-primary-fixed-dim max-w-md text-sm leading-relaxed">
            Sign in to seamlessly manage your courses, monitor student attendance in real-time, and generate comprehensive analytical reports.
          </p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <p className="text-[10px] text-primary-fixed-dim font-mono uppercase tracking-wider">
            © 2026 Ghana Communication Technology University
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-md animate-slide-up">

          {/* Mobile Header (Only visible on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <img src="/gctu-crest.png" alt="GCTU Crest" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-primary dark:text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              GCTU Attendance
            </h1>
            <p className="mt-2 text-secondary font-mono tracking-[0.2em] uppercase text-[10px] font-bold">
              Lecturer Portal
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Please enter your credentials to access your account.</p>
          </div>

          <div className="mt-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded text-[10px] text-red-600 dark:text-red-400 font-mono uppercase text-center animate-shake">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">mail</span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all font-mono"
                    placeholder="adeyemi@university.edu"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">lock</span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all font-mono"
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
                    className="h-3.5 w-3.5 text-primary border-slate-300 rounded cursor-pointer focus:ring-primary"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <div className="text-[10px]">
                  <a href="#" className="font-bold uppercase tracking-wider text-primary hover:text-primary-container dark:text-secondary dark:hover:text-secondary-fixed transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                  style={{ backgroundColor: "#F5B41C", color: "#081637" }}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#081637]/30 border-t-[#081637] rounded-full animate-spin"></span>
                      Authenticating...
                    </>
                  ) : (
                    'Sign In to Portal →'
                  )}
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
                <p className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">
                  New to the system?{' '}
                  <Link to="/register" className="font-bold text-primary hover:text-primary-container dark:text-secondary dark:hover:text-secondary-fixed transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Mobile Footer */}
          <div className="lg:hidden mt-10 text-center">
            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">
              © 2026 GCTU
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
