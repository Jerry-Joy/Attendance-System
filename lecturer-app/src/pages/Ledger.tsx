import { mockLedgerRecords } from "../lib/mockData";

export default function Ledger() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Blockchain Records</h1>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono tracking-widest uppercase mt-1">Tamper-proof blockchain records</p>
        </div>
        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Blockchain Synced
        </div>
      </div>

      <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0D11]/50 flex items-center justify-between">
          <div className="relative flex items-center w-72">
            <span className="material-symbols-outlined absolute left-3 text-slate-600 dark:text-slate-400 text-[16px]">search</span>
            <input
              className="bg-white dark:bg-[#15181E] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded pl-9 pr-4 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full placeholder:text-slate-600 transition-all font-mono"
              placeholder="Search tx hash, block..."
              type="text"
            />
          </div>

          <button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#15181E] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-mono tracking-widest border-b border-slate-200 dark:border-slate-800">
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
                <tr key={i} className="hover:bg-slate-100 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 text-blue-400 font-mono text-[10px]">
                      {record.txnHash}
                      <span className="material-symbols-outlined text-[12px] cursor-pointer hover:text-blue-300">open_in_new</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono text-[10px] text-slate-600 dark:text-slate-400">#{record.blockNumber}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-mono text-[10px]">{new Date(record.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                      {record.courseId}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200 text-xs">{record.studentName}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <span className="material-symbols-outlined text-[10px]">verified</span>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0D11]/50 flex items-center justify-between text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400">
          <span>Showing 1 to 3 of 1,245 blockchain records</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-slate-600 dark:text-slate-400 cursor-not-allowed opacity-50 border border-transparent"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
            <button className="p-1 rounded hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-300 dark:border-slate-700 transition-colors"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
