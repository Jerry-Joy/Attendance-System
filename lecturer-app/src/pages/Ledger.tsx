import { useEffect, useState } from "react";
import { api, BackendLedgerRecord, VerificationResult } from "../lib/api";

export default function Ledger() {
  const [records, setRecords] = useState<BackendLedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verification Modal State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const data = await api.getLedgerRecords();
      setRecords(data);
    } catch (err: any) {
      setError(err.message || "Failed to load ledger records");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setSelectedRecordId(id);
    setVerifyModalOpen(true);
    setVerifying(true);
    setVerifyResult(null);
    setVerifyError(null);

    try {
      const result = await api.verifyAttendanceRecord(id);
      setVerifyResult(result);
    } catch (err: any) {
      setVerifyError(err.message || "Failed to verify record");
    } finally {
      setVerifying(false);
    }
  };

  const closeModal = () => {
    setVerifyModalOpen(false);
    setVerifyResult(null);
    setSelectedRecordId(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
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
        <button
          onClick={loadLedger}
          disabled={loading}
          className="flex items-center gap-2 font-extrabold uppercase tracking-wide text-[11px] px-6 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors disabled:opacity-50">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-slate-500">Loading records...</div>
          ) : error ? (
             <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tx Hash</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Block</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={7} className="p-6 text-center text-slate-400 text-sm">No blockchain records found.</td></tr>
                ) : (
                  records.map((record, i) => {
                    const isConfirmed = record.blockchainStatus === 'CONFIRMED';
                    return (
                      <tr key={record.id} className={`hover:bg-slate-50 transition-colors group ${i !== records.length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-slate-900">
                              {record.transactionHash ? `${record.transactionHash.slice(0, 6)}...${record.transactionHash.slice(-4)}` : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono text-sm text-slate-600">
                          {record.blockNumber ? `#${record.blockNumber}` : 'N/A'}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">{new Date(record.markedAt).toLocaleString()}</td>
                        <td className="px-6 py-5">
                          <span className="font-bold text-sm text-slate-900">
                            {record.session.course.courseCode}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-medium text-sm text-slate-900">{record.student.fullName}</td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide"
                                style={{
                                  backgroundColor: isConfirmed ? "#E6FFF0" : "#FFF9E6",
                                  color: isConfirmed ? "#10B981" : "#F5B41C"
                                }}>
                            <span className="material-symbols-outlined text-[14px]">
                              {isConfirmed ? 'verified' : 'pending'}
                            </span>
                            {record.blockchainStatus}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => handleVerify(record.id)}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Showing {records.length} records
          </span>
        </div>
      </div>

      {/* Verification Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-slate-900">Blockchain Verification</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              {verifying ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <span className="material-symbols-outlined text-4xl text-indigo-500 animate-spin">refresh</span>
                  <p className="mt-4 text-sm font-medium text-slate-600">Verifying on Sepolia Blockchain...</p>
                </div>
              ) : verifyError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                  {verifyError}
                </div>
              ) : verifyResult ? (
                <div className="flex flex-col gap-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                    verifyResult.tampered
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : (verifyResult.hashMatch && verifyResult.onChain)
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    <span className="material-symbols-outlined mt-0.5">
                      {verifyResult.tampered ? 'gpp_bad' : (verifyResult.hashMatch ? 'gpp_good' : 'warning')}
                    </span>
                    <div>
                      <h3 className="font-bold">
                        {verifyResult.tampered ? 'TAMPERING DETECTED'
                          : (!verifyResult.onChain ? 'Not Anchored Yet'
                          : 'Cryptographically Verified')}
                      </h3>
                      <p className="text-sm mt-1 opacity-90">
                        {verifyResult.tampered
                          ? 'The data in the local database does NOT match the immutable hash stored on the blockchain. This record may have been altered.'
                          : (!verifyResult.onChain
                            ? 'This record has not yet been confirmed on the blockchain.'
                            : 'The local database record perfectly matches the secure hash anchored on the blockchain. Data integrity is intact.')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-2">
                    <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-1 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction Hash</span>
                      <span className="font-mono text-xs text-slate-800 break-all">{verifyResult.transactionHash || 'N/A'}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-1 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stored Blockchain Hash</span>
                      <span className="font-mono text-xs text-slate-800 break-all">{verifyResult.storedHash || 'N/A'}</span>
                    </div>

                    <div className={`p-3 rounded-lg flex flex-col gap-1 border ${verifyResult.tampered ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recomputed Local Hash</span>
                      <span className="font-mono text-xs text-slate-800 break-all">{verifyResult.recomputedHash}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
