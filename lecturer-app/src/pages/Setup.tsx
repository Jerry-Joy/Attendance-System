import { Link } from "react-router-dom";

export default function Setup() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D11] text-slate-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.2)] mb-4 relative z-10">
        <span className="material-symbols-outlined text-[28px] text-blue-500">settings_applications</span>
      </div>
      <div className="text-center relative z-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Get Started</h1>
        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-2">Set up your organization</p>
      </div>

      <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md mt-8 shadow-xl relative z-10">
        <form className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Organization Name</label>
            <input type="text" className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 placeholder-slate-700 font-mono focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="E.g. Computer Science Dept." />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Admin Name</label>
            <input type="text" className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 placeholder-slate-700 font-mono focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="E.g. Dr. Alan Turing" />
          </div>

          <div className="pt-4">
            <Link to="/login" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-3 rounded flex items-center justify-center gap-2 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.2)] cursor-pointer border border-blue-500/50">
              <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
              Continue
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
