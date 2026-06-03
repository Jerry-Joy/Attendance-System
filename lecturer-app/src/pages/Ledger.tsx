import { mockLedgerRecords } from "../lib/mockData";

export default function Ledger() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-slate-900">Blockchain Records</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Tamper-proof blockchain records</p>
        </div>
        <div className="px-4 py-2 border-2 rounded-lg flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: "rgba(245, 180, 28, 0.1)", borderColor: "#F5B41C", color: "#F5B41C" }}>
          <span className="material-symbols-outlined text-[16px]">link</span>
          Blockchain Synced
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
          <input
            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-slate-300 placeholder:text-slate-400 transition-all"
            placeholder="Search tx hash, block..."
            type="text"
          />
        </div>
        <button className="flex items-center gap-2 font-extrabold uppercase tracking-wide text-[11px] px-6 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tx Hash</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Block</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockLedgerRecords.map((record, i) => (
                <tr key={i} className={`hover:bg-slate-50 transition-colors group ${i !== mockLedgerRecords.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-slate-900">{record.txnHash}</span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-[16px] text-slate-400 hover:text-slate-600">content_copy</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-slate-600">#{record.blockNumber}</td>
                  <td className="px-6 py-5 text-sm text-slate-600">{new Date(record.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-sm text-slate-900">
                      {record.courseId}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-medium text-sm text-slate-900">{record.studentName}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: "#FFF9E6", color: "#F5B41C" }}>
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Showing 1 to 3 of 1,245 blockchain records
          </span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 cursor-not-allowed opacity-50">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
