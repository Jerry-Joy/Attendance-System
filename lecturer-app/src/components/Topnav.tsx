import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

export default function Topnav() {
  const [time, setTime] = useState(new Date());
  const { activeSession } = useData();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-14 z-40 flex items-center justify-end px-6 transition-all duration-150 border-b border-white/5" style={{ backgroundColor: "#081637" }}>
      <div className="flex items-center gap-5">
        {/* Icons */}
        <div className="flex items-center gap-2 text-white/70">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:text-white transition-colors cursor-pointer flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10"
            title="Toggle theme"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button className="hover:text-white transition-colors cursor-pointer relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(245,180,28,0.5)]" style={{ backgroundColor: "#F5B41C" }}></span>
          </button>
        </div>

        {/* Date + Time */}
        <div className="text-right flex items-center gap-3 border-l border-white/10 pl-5">
          <div>
            <div className="text-[8px] text-white/50 font-mono uppercase tracking-widest">
              {time.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div className="text-sm font-bold tabular-nums text-white" style={{ fontFamily: "var(--font-display)" }}>
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </div>
          </div>
        </div>

        {/* CTA button */}
        <div className="pl-1">
          {activeSession ? (
            <Link
              to="/session/active"
              className="flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded transition-opacity hover:opacity-90 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              style={{ backgroundColor: "#F5B41C", color: "#081637" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
              Live Session
            </Link>
          ) : (
            <Link
              to="/session/create"
              className="flex items-center justify-center gap-1.5 font-bold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded transition-opacity hover:opacity-90 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              style={{ backgroundColor: "#F5B41C", color: "#081637" }}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Start Session
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
