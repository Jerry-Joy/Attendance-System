import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { api, mapCourse } from "../lib/api";

export default function CreateCourse() {
  const navigate = useNavigate();
  const { addCourse } = useData();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
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
      mapped.level = level || 'Level 100';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-700/50 backdrop-blur-sm">
      {!joinCode ? (
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border-t-4 border-t-[#F5B41C] animate-slide-up">
          {/* Header */}
          <div className="p-6 pb-4 flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <img src="/gctu-crest.png" alt="GCTU Logo" className="w-16 h-16 object-contain" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-1">CREATE NEW COURSE</h2>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Enter the details below to provision a new academic module within the system.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate(-1)} 
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-400">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleCreate} className="px-6 pb-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Section Title */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F5B41C" }}></div>
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Course Details</h3>
            </div>

            <div className="space-y-4">
              {/* Course Code and Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Course Code
                  </label>
                  <input 
                    required 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                    placeholder="e.g. CS101" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Level
                  </label>
                  <select 
                    value={level} 
                    onChange={e => setLevel(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F5B41C] focus:ring-2 focus:ring-[#F5B41C]/20 transition-all appearance-none cursor-pointer"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23F5B41C' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select Level</option>
                    <option value="Level 100">Level 100</option>
                    <option value="Level 200">Level 200</option>
                    <option value="Level 300">Level 300</option>
                    <option value="Level 400">Level 400</option>
                  </select>
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Course Name
                </label>
                <input 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Introduction to Computer Science" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all"
                />
              </div>

              {/* Venue / Room and Groups */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Venue / Room
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">location_on</span>
                    <input 
                      value={venue} 
                      onChange={e => setVenue(e.target.value)} 
                      placeholder="e.g. Block C, Room 302" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Groups (comma-separated)
                  </label>
                  <input 
                    value={groups} 
                    onChange={e => setGroups(e.target.value)} 
                    placeholder="e.g. Group A, Group B" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5B41C] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-6 py-2.5 text-sm font-bold text-slate-900 rounded-lg flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#F5B41C" }}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      CREATE COURSE
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Success Modal */
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border-t-4 border-t-emerald-500 animate-slide-up p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[32px] text-emerald-500">check_circle</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Course Created Successfully!</h2>
          <p className="text-sm text-slate-600 mb-6">Share this join code with your students to enroll</p>

          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 mb-6">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Join Code</p>
            <div className="text-3xl font-bold font-mono tracking-[0.3em] text-slate-900 mb-4">{joinCode}</div>
            <button 
              onClick={copyJoinCode} 
              className="flex items-center gap-2 mx-auto px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors"
              style={{ backgroundColor: "#F5B41C", color: "#081637" }}
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copy Code
            </button>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/courses')} 
              className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back to Courses
            </button>
            <button 
              onClick={() => { 
                setJoinCode(null); 
                setCode(''); 
                setName(''); 
                setVenue(''); 
                setGroups(''); 
                setLevel(''); 
                setError(null); 
              }} 
              className="flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors hover:shadow-lg"
              style={{ backgroundColor: "#F5B41C", color: "#081637" }}
            >
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
