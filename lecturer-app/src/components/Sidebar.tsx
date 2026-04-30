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
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-slate-50 dark:bg-[#15181E] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-150">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold tracking-tight">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span>Smart Attendance System</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-1 overflow-hidden">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded transition-colors cursor-pointer group",
                isActive
                  ? "bg-blue-50 dark:bg-blue-500/10 border-l-2 border-blue-500 text-blue-700 dark:text-white"
                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 border-l-2 border-transparent"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn("material-symbols-outlined text-[18px]", isActive ? "text-blue-600 dark:text-blue-400 fill" : "group-hover:text-slate-800 dark:group-hover:text-slate-200")}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <div>
                  <div className={cn("text-xs font-semibold", isActive ? "text-slate-900 dark:text-white" : "group-hover:text-slate-900 dark:group-hover:text-slate-200")}>{item.name}</div>
                  <div className={cn("text-[10px]", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-600")}>{item.detail}</div>
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
            className="flex items-center gap-3 px-3 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 transition-colors cursor-pointer group"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live Session</div>
              <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono">{activeSession.courseCode}</div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-emerald-500/50 dark:text-emerald-400/50 ml-auto">arrow_forward</span>
          </NavLink>
        </div>
      )}

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
            JV
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">Dr. Julian Vance</p>
            <p className="text-[10px] text-slate-500 uppercase font-mono">Staff: #7721</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
