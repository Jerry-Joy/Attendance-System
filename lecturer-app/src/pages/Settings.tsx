import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { api } from "../lib/api";
import { CustomSelect } from "../components/CustomSelect";

const RADIUS_OPTIONS = [
  { value: "25", label: "25m (High Precision)", badge: "Tight" },
  { value: "50", label: "50m (Standard)", badge: "Recommended" },
  { value: "100", label: "100m (Large Lecture Hall)" },
  { value: "150", label: "150m (Campus Wide)" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)} 
      className={`relative w-10 h-5 rounded-full border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-110 active:scale-95 ${checked ? '' : 'bg-slate-100 border-slate-300'}`} 
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

  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    blockNumber?: number;
    networkName?: string;
    walletAddress?: string;
    balance?: string;
    contractAddress?: string;
    error?: string;
  } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    // Initial connection health check
    api.getBlockchainStatus()
      .then(setConnectionStatus)
      .catch((err) => setConnectionStatus({ connected: false, error: err.message }));
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await api.getBlockchainStatus();
      setConnectionStatus(res);
    } catch (err: any) {
      setConnectionStatus({ connected: false, error: err.message || "Failed to connect" });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#081637", fontFamily: "var(--font-display)" }}>System Settings</h1>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 animate-slide-up hover:shadow-lg hover:border-slate-300 transition-all duration-300" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ backgroundColor: "#F5B41C", color: "#081637" }}>
                {lecturer?.avatarInitials ?? 'PA'}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-900 mb-0.5">{lecturer?.name}</h2>
                <p className="text-[11px] text-slate-500 mb-3">{lecturer?.title}</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 group hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-all duration-200">
                    <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600 transition-colors">mail</span>
                    <span className="text-[11px] text-slate-600">{lecturer?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 group hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-all duration-200">
                    <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600 transition-colors">badge</span>
                    <span className="text-[11px] text-slate-600">ID: {lecturer?.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {[
              { label: 'COURSES', value: courses.length },
              { label: 'STUDENTS', value: totalStudents },
              { label: 'SESSIONS', value: pastSessions.length },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 text-center hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer group" style={{ animationDelay: `${i * 0.05 + 0.2}s` }}>
                <p className="text-3xl font-bold text-slate-900 tabular-nums mb-1 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Blockchain Status Card */}
          <div className="rounded-lg p-6 animate-slide-up hover:shadow-lg transition-all duration-300" style={{ backgroundColor: "#1a2332", animationDelay: "0.3s" }}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-white">Blockchain Status</h3>
            
            {testingConnection ? (
              <div className="bg-slate-800/50 rounded-lg p-4 flex items-center gap-3 mb-4 hover:bg-slate-800/70 transition-all duration-200">
                <span className="material-symbols-outlined text-[20px] text-amber-500 animate-spin">refresh</span>
                <span className="text-sm font-semibold text-amber-500">Testing connection...</span>
              </div>
            ) : connectionStatus?.connected ? (
              <div className="flex flex-col gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-4 flex items-center gap-3 hover:bg-slate-800/70 transition-all duration-200 group">
                  <span className="material-symbols-outlined text-[20px] text-green-500 group-hover:scale-110 transition-transform animate-pulse">link</span>
                  <span className="text-sm font-semibold text-green-500">Sepolia Connected (Block #{connectionStatus.blockNumber})</span>
                </div>
                <div className="bg-slate-800/20 border border-slate-700/50 rounded-lg p-3 text-[10px] font-mono text-slate-300 flex flex-col gap-1.5">
                  <div className="flex justify-between"><span className="text-slate-500">NETWORK</span><span>{connectionStatus.networkName?.toUpperCase()}</span></div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">WALLET</span>
                    <a 
                      href={`https://sepolia.etherscan.io/address/${connectionStatus.walletAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#F5B41C]/90 hover:text-[#F5B41C] hover:underline flex items-center gap-0.5 transition-colors"
                    >
                      <span className="truncate">{connectionStatus.walletAddress?.slice(0, 6)}...{connectionStatus.walletAddress?.slice(-4)}</span>
                      <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                  </div>
                  <div className="flex justify-between"><span className="text-slate-500">BALANCE</span><span>{Number(connectionStatus.balance).toFixed(4)} ETH</span></div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">CONTRACT</span>
                    <a 
                      href={`https://sepolia.etherscan.io/address/${connectionStatus.contractAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#F5B41C]/90 hover:text-[#F5B41C] hover:underline flex items-center gap-0.5 transition-colors"
                    >
                      <span className="truncate">{connectionStatus.contractAddress?.slice(0, 6)}...{connectionStatus.contractAddress?.slice(-4)}</span>
                      <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-lg p-4 flex items-center gap-3 mb-4 hover:bg-slate-800/70 transition-all duration-200 group">
                <span className="material-symbols-outlined text-[20px] text-red-500">link_off</span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-red-500">Connection Failed</span>
                  <span className="text-[9px] text-red-400/80 truncate max-w-[200px]" title={connectionStatus?.error}>{connectionStatus?.error || 'Node unreachable'}</span>
                </div>
              </div>
            )}

            <button 
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full px-4 py-2.5 rounded-lg text-[11px] uppercase font-bold transition-all duration-300 font-mono border-2 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0" 
              style={{ backgroundColor: "transparent", color: "#F5B41C", borderColor: "#F5B41C" }}
            >
              TEST CONNECTION
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Session Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 animate-slide-up hover:shadow-lg hover:border-slate-300 transition-all duration-300" style={{ animationDelay: "0.1s" }}>
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Session Configuration</h3>
              <p className="text-[11px] text-slate-500">Manage defaults for new attendance sessions.</p>
            </div>
            <div className="flex flex-col gap-5">
              {[
                { key: 'qrAutoRefresh' as const, label: 'QR Auto-Refresh', desc: 'Refresh QR code every 30 seconds' },
                { key: 'gpsRequired' as const, label: 'GPS Required', desc: 'Require location services for all sessions' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between group hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-all duration-200">
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
                <CustomSelect 
                  value={String(preferences.defaultRadius)}
                  onChange={(val) => updatePreferences({ defaultRadius: Number(val) })}
                  options={RADIUS_OPTIONS}
                  placeholder="Select default radius"
                />
              </div>

              {[
                { key: 'notifications' as const, label: 'Check-in Notifications', desc: 'Get alerts when students check in' },
                { key: 'blockchainWrite' as const, label: 'Save to Blockchain', desc: 'Save verified attendance to blockchain' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between pt-1 group hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-all duration-200">
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
          <button className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between hover:bg-slate-50 hover:shadow-md hover:border-slate-300 transition-all duration-200 animate-slide-up group active:scale-95" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-slate-600 group-hover:text-slate-900 group-hover:scale-110 transition-all duration-200">shield</span>
              <span className="text-[13px] font-semibold text-slate-900">Privacy & Security</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200">chevron_right</span>
          </button>

          {/* Help & Support Link */}
          <button className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between hover:bg-slate-50 hover:shadow-md hover:border-slate-300 transition-all duration-200 animate-slide-up group active:scale-95" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-slate-600 group-hover:text-slate-900 group-hover:scale-110 transition-all duration-200">help_outline</span>
              <span className="text-[13px] font-semibold text-slate-900">Help & Support</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200">chevron_right</span>
          </button>

          {/* Sign Out Button */}
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-8 py-3 hover:bg-red-50 text-red-500 border-2 border-red-500/40 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-red-500 active:scale-95 group">
              <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">logout</span>
              SIGN OUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
