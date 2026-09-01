import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationPanel from "./NotificationPanel";

export default function Topnav() {
  const [time, setTime] = useState(new Date());
  const { activeSession, courses } = useData();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute smart back button and breadcrumbs for nested pages
  const navContext = useMemo(() => {
    const path = location.pathname;

    // 1. Course Roster page: /courses/:id/roster
    const rosterMatch = path.match(/^\/courses\/([^/]+)\/roster$/);
    if (rosterMatch) {
      const courseId = rosterMatch[1];
      const course = courses.find((c) => c.id === courseId);
      return {
        showBack: true,
        backLabel: `Back to ${course?.code || 'Course'}`,
        backUrl: `/courses/${courseId}`,
        breadcrumb: `Courses / ${course?.code || 'Course'} / Roster`,
      };
    }

    // 2. Manage Students page: /courses/:id/students
    const studentsMatch = path.match(/^\/courses\/([^/]+)\/students$/);
    if (studentsMatch) {
      const courseId = studentsMatch[1];
      const course = courses.find((c) => c.id === courseId);
      return {
        showBack: true,
        backLabel: `Back to ${course?.code || 'Course'}`,
        backUrl: `/courses/${courseId}`,
        breadcrumb: `Courses / ${course?.code || 'Course'} / Students`,
      };
    }

    // 3. Course Details page: /courses/:id (not /courses or /courses/create)
    const detailsMatch = path.match(/^\/courses\/([^/]+)$/);
    if (detailsMatch && detailsMatch[1] !== 'create' && detailsMatch[1] !== 'new') {
      const courseId = detailsMatch[1];
      const course = courses.find((c) => c.id === courseId);
      return {
        showBack: true,
        backLabel: "Back to Courses",
        backUrl: "/courses",
        breadcrumb: `Courses / ${course?.code || 'Course'}`,
      };
    }

    // 4. Create Course page: /courses/create or /courses/new
    if (path === '/courses/create' || path === '/courses/new') {
      return {
        showBack: true,
        backLabel: "Back to Courses",
        backUrl: "/courses",
        breadcrumb: "Courses / New Course",
      };
    }

    return null;
  }, [location.pathname, courses]);

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-14 z-40 flex items-center justify-between px-6 transition-all duration-150 border-b border-white/5 font-sans" style={{ backgroundColor: "#081637" }}>
        {/* Left: Smart Fixed Back Navigation & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {navContext ? (
            <div className="flex items-center gap-2.5 min-w-0 animate-fade-in">
              <button
                onClick={() => navigate(navContext.backUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                title={navContext.backLabel}
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>{navContext.backLabel}</span>
              </button>

              <span className="text-xs text-slate-400 font-medium hidden md:inline truncate">
                {navContext.breadcrumb}
              </span>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-400 tracking-wider uppercase hidden sm:block">
              {location.pathname === '/' ? 'Dashboard Overview' : location.pathname.replace('/', '').toUpperCase()}
            </div>
          )}
        </div>

        {/* Right: Notification, Date/Time, Action CTA */}
        <div className="flex items-center gap-5 shrink-0">
          {/* Icons */}
          <div className="flex items-center gap-2 text-white/70">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="hover:text-white transition-all duration-200 cursor-pointer relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 hover:scale-110 active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">notifications</span>
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold animate-scale-in" style={{ backgroundColor: "#F5B41C", color: "#081637" }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(245,180,28,0.5)] animate-pulse" style={{ backgroundColor: "#F5B41C" }}></span>
                </>
              )}
            </button>
          </div>

          {/* Date + Time */}
          <div className="text-right hidden sm:flex items-center gap-3 border-l border-white/10 pl-5">
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
                className="flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider px-4 lg:px-5 py-2 rounded-lg transition-opacity hover:opacity-90 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                style={{ backgroundColor: "#F5B41C", color: "#081637" }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                Live Session
              </Link>
            ) : (
              <Link
                to="/session/create"
                className="flex items-center justify-center gap-1.5 font-bold text-[11px] uppercase tracking-wider px-4 lg:px-5 py-2 rounded-lg transition-opacity hover:opacity-90 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                style={{ backgroundColor: "#F5B41C", color: "#081637" }}
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Start Session
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}
