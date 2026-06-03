import { useState, type FormEvent } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    const result = await signup({
      name,
      email,
      department,
      staffId,
      password
    });

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Registration failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* Left Panel - Brand Anchor (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary relative flex-col justify-center items-center p-12 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] left-[10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[100px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/10 blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in">
          <div className="w-48 h-48 bg-white rounded-3xl flex items-center justify-center p-6 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
            <img src="/gctu-crest.png" alt="GCTU Crest" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight uppercase leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Join Smart<br/>Attendance
          </h1>
          <p className="mt-4 text-secondary font-mono tracking-[0.2em] uppercase text-xs font-bold">
            Lecturer Portal
          </p>
          <p className="mt-6 text-primary-fixed-dim max-w-sm text-sm leading-relaxed">
            Create an account to streamline your classroom management. Modern, secure, and fully integrated with the GCTU academic ecosystem.
          </p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <p className="text-[10px] text-primary-fixed-dim font-mono uppercase tracking-wider">
            © 2026 Ghana Communication Technology University
          </p>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-16 xl:px-24 relative z-10 overflow-y-auto">
        <div className="mx-auto w-full max-w-md lg:max-w-lg animate-slide-up">

          {/* Mobile Header (Only visible on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <img src="/gctu-crest.png" alt="GCTU Crest" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-primary uppercase tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              GCTU Registration
            </h1>
            <p className="mt-2 text-secondary font-mono tracking-[0.2em] uppercase text-[10px] font-bold">
              Lecturer Portal
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500">Fill in your professional details to request access to the portal.</p>
          </div>

          <div className="mt-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-[10px] text-red-600 font-mono uppercase text-center animate-shake">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1.5">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                    placeholder="Prof. John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1.5">
                  Official Email
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                    placeholder="jdoe@gctu.edu.gh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1.5">
                    Department
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">domain</span>
                    </div>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="appearance-none block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="staffId" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1.5">
                    Staff ID
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
                    </div>
                    <input
                      id="staffId"
                      name="staffId"
                      type="text"
                      required
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="appearance-none block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                      placeholder="GCTU-2026-XX"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">lock_reset</span>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                  style={{ backgroundColor: "#F5B41C", color: "#081637" }}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#081637]/30 border-t-[#081637] rounded-full animate-spin"></span>
                      Registering Account...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center border-t border-slate-100 pt-6">
                <p className="text-[10px] uppercase font-mono text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-primary hover:text-primary-container transition-colors">
                    Sign in here
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
