import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { useData } from "../context/DataContext";

export default function Sidebar() {
  const { activeSession } = useData();

  const navItems = [
    { name: "Dashboard", path: "/", icon: "dashboard", detail: "Today overview" },
    { name: "Courses", path: "/courses", icon: "school", detail: "Active classes" },
    { name: "History", path: "/history", icon: "history", detail: "Past sessions" },
    { name: "Reports", path: "/reports", icon: "insights", detail: "Performance reports" },
    { name: "Blockchain", path: "/ledger", icon: "account_tree", detail: "Blockchain records" },
    { name: "Settings", path: "/settings", icon: "settings", detail: "System settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 flex flex-col transition-colors duration-150" style={{ backgroundColor: "#081637" }}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center relative bg-white/10 shrink-0">
            <img src="/gctu-crest.png" alt="GCTU" className="w-16 h-16 max-w-none object-contain" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block" style={{ fontFamily: "var(--font-display)" }}>GCTU</span>
            <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "#F5B41C" }}>Smart Attendance</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 p-4 space-y-0.5 overflow-hidden">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3 text-white/30">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded transition-colors cursor-pointer group",
                isActive
                  ? "text-gctu-navy font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )
            }
            style={({ isActive }) =>
              isActive ? { backgroundColor: "#F5B41C", color: "#081637" } : {}
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[18px] shrink-0"
                  style={isActive ? { fontVariationSettings: "'FILL' 1", color: "#081637" } : {}}
                >
                  {item.icon}
                </span>
                <div>
                  <div className={cn("text-xs font-semibold", isActive ? "" : "group-hover:text-white")}>{item.name}</div>
                  <div className={cn("text-[10px]", isActive ? "opacity-70" : "text-white/30 group-hover:text-white/50")}>{item.detail}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Active Session Indicator */}
      {activeSession && (
        <div className="mx-4 mb-4">
          <NavLink
            to="/session/active"
            className="flex items-center gap-3 px-3 py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer group"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Session</div>
              <div className="text-[10px] text-emerald-400/70 font-mono">{activeSession.courseCode}</div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-emerald-400/50 ml-auto">arrow_forward</span>
          </NavLink>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: "#F5B41C", color: "#081637" }}>
            JV
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate text-white">Dr. Julian Vance</p>
            <p className="text-[10px] text-white/40 uppercase font-mono">Staff: #7721</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
