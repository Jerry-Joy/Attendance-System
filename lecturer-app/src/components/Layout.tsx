import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topnav from "./Topnav";

export default function Layout() {
  return (
    <div className="flex h-screen text-slate-900 font-sans overflow-hidden transition-colors duration-150" style={{ backgroundColor: "#F8FAFC" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <Topnav />
        <main className="flex-1 pt-14 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
