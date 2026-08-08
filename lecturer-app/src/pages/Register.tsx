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
      <div 
        className="hidden lg:flex lg:w-5/12 relative flex-col justify-center items-center p-12 overflow-hidden bg-cover bg-center border-r border-white/10"
        style={{ backgroundImage: "url('/gctu-building.jpg')" }}
      >
        {/* Dark brand-aligned gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-primary/80 mix-blend-multiply z-0"></div>
        
        {/* Decorative background glow elements */}
        <div className="absolute inset-0 z-0 opacity-45">
          <div className="absolute top-[10%] left-[10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[100px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 blur-[120px]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in">
          {/* Glassmorphic GCTU Crest Card */}
          <div className="w-36 h-36 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center p-5 shadow-2xl mb-8 transform hover:scale-105 transition-all duration-500">
            <img src="/gctu-crest.png" alt="GCTU Crest" className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]" />
          </div>
          
          {/* Typographic brand heading with golden color gradient */}
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight uppercase leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Smart Attendance</span>
          </h1>
          
          {/* Status badge representing live connection */}
          <div className="mt-4 flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <p className="text-secondary font-mono tracking-[0.2em] uppercase text-[10px] font-bold">
              Lecturer Portal
            </p>
          </div>
          
          <p className="mt-6 text-slate-200 max-w-sm text-sm leading-relaxed">
            Create an account to streamline your classroom management. Modern, secure, and fully integrated with the GCTU academic ecosystem.
          </p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <p className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">
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
                <label htmlFor="name" className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    placeholder="Prof. John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                  Official Email
                </label>
                <div className="relative mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    placeholder="jdoe@gctu.edu.gh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                    Department
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="department"
                      name="department"
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="staffId" className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                    Staff ID
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="staffId"
                      name="staffId"
                      type="text"
                      required
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="GCTU-2026-XX"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-[10px] uppercase font-mono tracking-widest text-slate-700 font-bold mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'}`}
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
