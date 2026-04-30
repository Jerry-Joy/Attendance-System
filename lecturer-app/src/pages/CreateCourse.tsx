import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { api, mapCourse } from "../lib/api";

export default function CreateCourse() {
  const navigate = useNavigate();
  const { addCourse } = useData();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Level 100');
  const [venue, setVenue] = useState('');
  const [groups, setGroups] = useState('');
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await api.createCourse({
        courseCode: code.trim().toUpperCase(),
        courseName: name.trim(),
        venue: venue.trim() || undefined,
      });

      const mapped = mapCourse(result);
      // Attach level and groups from the form (not stored in backend)
      mapped.level = level;
      const groupList = groups.split(',').map(g => g.trim()).filter(Boolean);
      mapped.groups = groupList.length > 0 ? groupList : ['All'];

      addCourse(mapped);
      setJoinCode(result.joinCode);
    } catch (err: any) {
      setError(err?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const copyJoinCode = () => {
    if (joinCode) {
      navigator.clipboard?.writeText(joinCode);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D11] flex flex-col pt-20 px-4 sm:px-8 relative overflow-hidden font-sans">
      {/* Topnav */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#15181E] border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded bg-slate-50 dark:bg-[#0B0D11] border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
          <h1 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Create New Course</h1>
        </div>
      </header>

      {/* Background deco */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-emerald-500/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col mt-4 relative z-10 pb-12">
        {!joinCode ? (
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px] text-blue-500">school</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Course Details</h2>
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase">Add the course details and groups. A join code will be created when you save.</p>
            </div>

            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-mono uppercase text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Course Code *</label>
                  <input required value={code} onChange={e => setCode(e.target.value)} placeholder="CS101" className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Level</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors appearance-none cursor-pointer">
                    <option>Level 100</option>
                    <option>Level 200</option>
                    <option>Level 300</option>
                    <option>Level 400</option>
                    <option>Graduate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Course Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Introduction to Computer Science" className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Venue / Room</label>
                <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Building A, Room 101" className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Groups (comma separated)</label>
                <input value={groups} onChange={e => setGroups(e.target.value)} placeholder="Group A, Group B" className="w-full bg-slate-50 dark:bg-[#0B0D11] border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors" />
                <p className="text-[9px] font-mono text-slate-600 mt-1.5 uppercase">Leave empty for default "All" group</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white bg-blue-600 rounded border border-blue-500/50 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Creating...
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      Create Course
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#15181E] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl text-center p-8">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[32px] text-emerald-500">check_circle</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Course Created</h2>
            <p className="text-[10px] text-slate-500 font-mono uppercase mb-6">Share this join code with your students to enroll</p>

            <div className="p-6 bg-slate-50 dark:bg-[#0B0D11] rounded-lg border border-slate-300 dark:border-slate-700 mb-6">
              <p className="text-[10px] text-slate-500 font-mono uppercase mb-3 tracking-widest">Join Code</p>
              <div className="text-3xl font-bold font-mono tracking-[0.3em] text-slate-900 dark:text-white mb-4">{joinCode}</div>
              <button onClick={copyJoinCode} className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors">
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                Copy Code
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/courses')} className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-700 transition-colors">
                Back to Courses
              </button>
              <button onClick={() => { setJoinCode(null); setCode(''); setName(''); setVenue(''); setGroups(''); setLevel('Level 100'); setError(null); }} className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 rounded border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
