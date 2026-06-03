import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)} 
      className={`relative w-10 h-5 rounded-full border transition-all duration-200 cursor-pointer ${checked ? '' : 'bg-slate-100 border-slate-300'}`} 
      style={checked ? { backgroundColor: "rgba(245,180,28,0.2)", borderColor: "rgba(245,180,28,0.5)", boxShadow: "0 0 8px rgba(245,180,28,0.3)" } : {}}
    >
      <div 
        className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5 bg-slate-500'}`} 
        style={checked ? { backgroundColor: "#F5B41C" } : {}} 
      />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { lecturer, logout } = useAuth();
  const { courses, pastSessions, preferences, updatePreferences } = useData();

  const totalStudents = courses.reduce((a, c) => a + c.studentCount, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#081637", fontFamily: "var(--font-display)" }}>System Settings</h1>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl" style={{ backgroundColor: "#F5B41C", color: "#081637" }}>
                {lecturer?.avatarInitials ?? 'PA'}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-900 mb-0.5">{lecturer?.name}</h2>
                <p className="text-[11px] text-slate-500 mb-3">{lecturer?.title}</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                    <span className="text-[11px] text-slate-600">{lecturer?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
                    <span className="text-[11px] text-slate-600">ID: {lecturer?.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {[
              { label: 'COURSES', value: courses.length },
              { label: 'STUDENTS', value: totalStudents },
              { label: 'SESSIONS', value: pastSessions.length },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900 tabular-nums mb-1">{stat.value}</p>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Blockchain Status Card */}
          <div className="rounded-lg p-6 animate-slide-up" style={{ backgroundColor: "#1a2332", animationDelay: "0.4s" }}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-white">Blockchain Status</h3>
            <div className="bg-slate-800/50 rounded-lg p-4 flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[20px] text-green-500">link</span>
              <span className="text-sm font-semibold text-green-500">Node Connected</span>
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg text-[11px] uppercase font-bold transition-all font-mono border-2 hover:shadow-lg" style={{ backgroundColor: "transparent", color: "#F5B41C", borderColor: "#F5B41C" }}>
              TEST CONNECTION
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Session Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Session Configuration</h3>
              <p className="text-[11px] text-slate-500">Manage defaults for new attendance sessions.</p>
            </div>
            <div className="flex flex-col gap-5">
              {[
                { key: 'qrAutoRefresh' as const, label: 'QR Auto-Refresh', desc: 'Refresh QR code every 30 seconds' },
                { key: 'gpsRequired' as const, label: 'GPS Required', desc: 'Require location services for all sessions' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">{setting.label}</p>
                    <p className="text-[11px] text-slate-500">{setting.desc}</p>
                  </div>
                  <Toggle checked={preferences[setting.key]} onChange={v => updatePreferences({ [setting.key]: v })} />
                </div>
              ))}

              {/* Default Radius Dropdown */}
              <div className="pt-1">
                <label className="block text-[13px] font-semibold text-slate-900 mb-2">Default Radius (Meters)</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-0 cursor-pointer" style={{ focusRingColor: "#081637" }}>
                  <option>25m (High Precision)</option>
                  <option>50m (Standard)</option>
                  <option>100m (Large Lecture Hall)</option>
                </select>
              </div>

              {[
                { key: 'notifications' as const, label: 'Check-in Notifications', desc: 'Get alerts when students check in' },
                { key: 'blockchainWrite' as const, label: 'Save to Blockchain', desc: 'Save verified attendance to blockchain' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">{setting.label}</p>
                    <p className="text-[11px] text-slate-500">{setting.desc}</p>
                  </div>
                  <Toggle checked={preferences[setting.key]} onChange={v => updatePreferences({ [setting.key]: v })} />
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Security Link */}
          <button className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between hover:bg-slate-50 transition-colors animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-slate-600">shield</span>
              <span className="text-[13px] font-semibold text-slate-900">Privacy & Security</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
          </button>

          {/* Help & Support Link */}
          <button className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between hover:bg-slate-50 transition-colors animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-slate-600">help_outline</span>
              <span className="text-[13px] font-semibold text-slate-900">Help & Support</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
          </button>

          {/* Sign Out Button */}
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-8 py-3 hover:bg-red-50 text-red-500 border-2 border-red-500/40 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              SIGN OUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
