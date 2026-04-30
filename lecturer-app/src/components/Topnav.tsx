import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Topnav() {
  const [time, setTime] = useState(new Date());
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-14 z-40 bg-white dark:bg-[#0B0D11] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 transition-all duration-150">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase">System Status:</span>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded text-[10px] border border-emerald-500/20 uppercase">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Blockchain Sync:</span>
          <span className="text-[10px] text-slate-600 dark:text-slate-300">Blockchain synced</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2 text-slate-400 dark:text-slate-500 text-[16px]">search</span>
          <input
            className="bg-slate-50 dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded pl-8 pr-3 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            placeholder="Search query..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

        <div className="text-right flex items-center gap-3">
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase">
              {time.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div className="text-xs font-bold tabular-nums text-slate-800 dark:text-white">
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
