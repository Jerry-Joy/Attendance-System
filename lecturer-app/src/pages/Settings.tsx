import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative w-10 h-5 rounded-full border transition-all duration-200 cursor-pointer ${checked ? 'bg-blue-500/20 border-blue-500/50' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5 bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'translate-x-0.5 bg-slate-500'}`} />
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">System Settings</h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Configuration & Preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Operator Profile</h3>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {lecturer?.avatarInitials ?? '??'}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{lecturer?.name}</h2>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono uppercase">{lecturer?.title}</p>
                <p className="text-[10px] text-slate-500 font-mono uppercase">{lecturer?.department}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase text-slate-500">
                <span className="material-symbols-outlined text-[14px]">mail</span>
                <span className="text-slate-700 dark:text-slate-300">{lecturer?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase text-slate-500">
                <span className="material-symbols-outlined text-[14px]">badge</span>
                <span className="text-slate-700 dark:text-slate-300">ID: {lecturer?.id}</span>
              </div>
            </div>
          </div>

          {/* Session Settings */}
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Session Configuration</h3>
            <div className="flex flex-col gap-4">
              {[
                { key: 'qrAutoRefresh' as const, label: 'QR Auto-Refresh', desc: 'Refresh QR code every 30 seconds', icon: 'qr_code_2', accent: 'blue' },
                { key: 'gpsRequired' as const, label: 'GPS Required', desc: 'Require location services for all sessions', icon: 'location_on', accent: 'emerald' },
                { key: 'notifications' as const, label: 'Check-in Notifications', desc: 'Get alerts when students check in', icon: 'notifications', accent: 'amber' },
                { key: 'blockchainWrite' as const, label: 'Save to Blockchain', desc: 'Save verified attendance to blockchain', icon: 'link', accent: 'indigo' },
              ].map((setting, i) => (
                <div key={setting.key}>
                  {i > 0 && <div className="border-t border-slate-200 dark:border-slate-800/50 mb-4" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-${setting.accent}-500/10 flex items-center justify-center border border-${setting.accent}-500/20`}>
                        <span className={`material-symbols-outlined text-[16px] text-${setting.accent}-400`}>{setting.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{setting.label}</p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase">{setting.desc}</p>
                      </div>
                    </div>
                    <Toggle checked={preferences[setting.key]} onChange={v => updatePreferences({ [setting.key]: v })} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geofence Settings */}
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Geofence Parameters</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Default Radius (Meters)</label>
                <select className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none font-mono cursor-pointer">
                  <option>25m (High Precision)</option>
                  <option>50m (Standard)</option>
                  <option>100m (Large Lecture Hall)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Courses', value: courses.length, icon: 'school' },
                { label: 'Students', value: totalStudents, icon: 'groups' },
                { label: 'Sessions', value: pastSessions.length, icon: 'history' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 dark:bg-[#0B0D11]/50 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-center">
                  <span className={`material-symbols-outlined text-[18px] text-blue-400 mb-1 block`}>{stat.icon}</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{stat.value}</p>
                  <p className="text-[9px] text-slate-500 font-mono uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Sync */}
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Blockchain Sync</h3>
            <div className="bg-slate-50 dark:bg-[#0B0D11]/50 border border-slate-300 dark:border-slate-700/50 p-4 rounded flex flex-col items-center justify-center text-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-emerald-400">link</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Blockchain Connected</h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase leading-relaxed">Records are being saved to the blockchain.</p>
              <button className="mt-2 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors font-mono">Test Connection</button>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 transition-colors border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-slate-500">security</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Privacy & Security</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-600">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-slate-500">help</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Help & Support</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-600">chevron_right</span>
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-widest border-b border-red-900/30 pb-2 mb-4">Danger Zone</h3>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign Out
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-600 font-mono uppercase">CORE-SCAN v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
