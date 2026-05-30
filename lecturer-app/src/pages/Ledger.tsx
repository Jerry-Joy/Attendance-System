import { mockLedgerRecords } from "../lib/mockData";

export default function Ledger() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[9px] font-mono tracking-[0.15em] uppercase mb-0.5" style={{ color: "#C5960C" }}>Ghana Communication Technology University</p>
          <h1 className="text-xl font-bold tracking-tight uppercase" style={{ color: "#081637", fontFamily: "var(--font-display)" }}>Blockchain Records</h1>
          <div className="h-0.5 w-16 mt-2 rounded-full" style={{ backgroundColor: "#F5B41C" }}></div>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-2">Tamper-proof blockchain records</p>
        </div>
        <div className="px-3 py-1.5 border rounded flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(245, 180, 28, 0.1)", borderColor: "rgba(245, 180, 28, 0.3)", color: "#F5B41C" }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#F5B41C" }}></span>
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#F5B41C" }}></span>
          </span>
          Blockchain Synced
        </div>
      </div>

      <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-50" style={{ background: "linear-gradient(135deg, rgba(8, 22, 55, 0.05) 0%, rgba(245, 180, 28, 0.05) 100%)" }}></div>
        <div className="p-4 border-b bg-slate-50 dark:bg-[#0B0D11]/50 flex items-center justify-between relative z-10" style={{ borderColor: "rgba(8, 22, 55, 0.1)" }}>
          <div className="relative flex items-center w-72">
            <span className="material-symbols-outlined absolute left-3 text-[16px]" style={{ color: "#081637" }}>search</span>
            <input
              className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded pl-9 pr-4 py-1.5 focus:outline-none w-full placeholder:text-slate-600 transition-all font-mono"
              style={{ focusBorderColor: "#081637" }}
              placeholder="Search tx hash, block..."
              type="text"
            />
          </div>

          <button className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 border rounded bg-white dark:bg-[#15181E] cursor-pointer hover:shadow-md transition-all" style={{ color: "#081637", borderColor: "rgba(8, 22, 55, 0.2)" }}>
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#15181E]/50 text-[10px] uppercase font-mono tracking-widest border-b" style={{ color: "#081637", borderColor: "rgba(8, 22, 55, 0.1)" }}>
                <th className="px-6 py-3 font-semibold">Tx Hash</th>
                <th className="px-6 py-3 font-semibold">Block</th>
                <th className="px-6 py-3 font-semibold">Timestamp</th>
                <th className="px-6 py-3 font-semibold">Course</th>
                <th className="px-6 py-3 font-semibold">Student</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {mockLedgerRecords.map((record, i) => (
                <tr key={i} className="hover:bg-slate-100 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 font-mono text-[10px]" style={{ color: "#081637" }}>
                      {record.txnHash}
                      <span className="material-symbols-outlined text-[12px] cursor-pointer transition-all group-hover:scale-110" style={{ color: "#F5B41C" }}>open_in_new</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono text-[10px] text-slate-600 dark:text-slate-400">#{record.blockNumber}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-mono text-[10px]">{new Date(record.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className="border font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "rgba(8, 22, 55, 0.1)", borderColor: "rgba(8, 22, 55, 0.2)", color: "#081637" }}>
                      {record.courseId}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200 text-xs">{record.studentName}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border" style={{ backgroundColor: "rgba(245, 180, 28, 0.1)", color: "#F5B41C", borderColor: "rgba(245, 180, 28, 0.3)" }}>
                      <span className="material-symbols-outlined text-[10px]">verified</span>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-slate-50 dark:bg-[#0B0D11]/50 flex items-center justify-between text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400" style={{ borderColor: "rgba(8, 22, 55, 0.1)" }}>
          <span>Showing 1 to 3 of 1,245 blockchain records</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-slate-600 dark:text-slate-400 cursor-not-allowed opacity-50 border border-transparent"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
            <button className="p-1 rounded hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/70 border border-transparent transition-all" style={{ color: "#081637" }}><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
