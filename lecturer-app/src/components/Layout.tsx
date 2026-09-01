import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import Topnav from "./Topnav";

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Auto-scroll to top of main container on every page navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex h-screen text-slate-900 font-sans overflow-hidden transition-colors duration-150" style={{ backgroundColor: "#F8FAFC" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <Topnav />
        <main ref={mainRef} className="flex-1 pt-20 px-8 pb-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
