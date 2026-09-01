import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { api } from "../lib/api";
import { Search, X } from "lucide-react";
import { exportExcelCsv, formatStudentIdForExcel } from "../lib/csvExport";

type StatusFilter = 'all' | 'eligible' | 'at_risk';

export default function StudentRoster() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { courses, enrolledStudents, fetchStudents, removeStudent } = useData();

  const course = courses.find(c => c.id === id);
  const [copiedJoinCode, setCopiedJoinCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [downloading, setDownloading] = useState(false);

  // Fetch students from API on mount
  useEffect(() => {
    if (id) fetchStudents(id);
  }, [id, fetchStudents]);

  const students = (id ? enrolledStudents[id] : []) || [];

  const eligibleCount = useMemo(() => students.filter(s => s.attendanceRate >= 75).length, [students]);
  const atRiskCount = useMemo(() => students.filter(s => s.attendanceRate < 75).length, [students]);
  const classAvgRate = useMemo(() => {
    if (!students.length) return 0;
    return Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = 
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'eligible') matchesStatus = s.attendanceRate >= 75;
      else if (statusFilter === 'at_risk') matchesStatus = s.attendanceRate < 75;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const handleCopyJoinCode = () => {
    if (!course?.joinCode) return;
    navigator.clipboard?.writeText(course.joinCode);
    setCopiedJoinCode(true);
    setTimeout(() => setCopiedJoinCode(false), 2000);
  };

  const handleExportCSV = () => {
    if (!course || students.length === 0) return;
    setDownloading(true);
    exportExcelCsv({
      title: 'Class Enrollment & Exam Eligibility Roster',
      courseCode: course.code,
      courseName: course.name,
      metaSummary: {
        'Total Enrolled': `${students.length} Students`,
        'Exam Eligible (≥75%)': `${eligibleCount} (${students.length > 0 ? Math.round((eligibleCount / students.length) * 100) : 0}%)`,
        'At-Risk (<75%)': `${atRiskCount}`,
        'Class Average Attendance': `${classAvgRate}%`,
      },
      headers: ['#', 'Student Full Name', 'Student ID / Index No.', 'Attendance Rate', 'GCTU Exam Standing'],
      rows: students.map((s, idx) => [
        idx + 1,
        s.name,
        formatStudentIdForExcel(s.indexNumber),
        `${s.attendanceRate}%`,
        s.attendanceRate >= 75 ? 'Good Standing (Eligible)' : s.attendanceRate >= 60 ? 'Warning (Below 75%)' : 'Critical (Barred from Exam)',
      ]),
      filename: `${course.code.replace(/\s/g, '_')}_Student_Roster`,
    });
    setTimeout(() => setDownloading(false), 800);
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-sm">
          <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">error</span>
          <h2 className="text-base font-bold text-slate-900 mb-2">Course Not Found</h2>
          <button 
            onClick={() => navigate('/courses')} 
            className="px-4 py-2 bg-[#081637] text-white rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans animate-fade-in">
      {/* Top Hero Banner */}
      <div className="bg-[#081637] rounded-2xl p-6 lg:p-8 text-white shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => navigate(`/courses/${course.id}`)} 
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
              title="Back to Course Details"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <span className="px-3 py-1 bg-secondary text-primary font-black text-xs uppercase tracking-wider rounded-md font-mono">
              {course.code}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {course.level || 'Level 300'} · {course.venueName || 'Main Auditorium'}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">Student Enrollment Roster</h1>
          <p className="text-xs text-slate-300 font-medium">
            Manage registered students, track attendance eligibility, and oversee class participation.
          </p>
        </div>

        {/* Action Pills in Header */}
        <div className="flex flex-wrap sm:flex-col lg:flex-row items-stretch gap-3 shrink-0">
          {/* Interactive Join Code Badge */}
          <button
            onClick={handleCopyJoinCode}
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-white transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Click to copy join code for students"
          >
            <span className="text-slate-400">Join Code:</span>
            <span className="text-secondary tracking-widest">{course.joinCode}</span>
            <span className="material-symbols-outlined text-[16px]" style={{ color: copiedJoinCode ? '#10b981' : '#F5B41C' }}>
              {copiedJoinCode ? 'check_circle' : 'content_copy'}
            </span>
            {copiedJoinCode && <span className="text-[10px] text-emerald-400 font-sans uppercase">Copied!</span>}
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={downloading || students.length === 0}
            className="px-4 py-2.5 bg-secondary text-primary font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">{downloading ? 'refresh' : 'download'}</span>
            <span>{downloading ? 'Exporting...' : 'Export Roster'}</span>
          </button>
        </div>
      </div>

      {/* 4-KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrolled */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Enrolled</p>
            <p className="text-3xl font-black text-slate-900">{students.length}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Active registered students</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined text-[24px]">groups</span>
          </div>
        </div>

        {/* Exam Eligible (>=75%) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Exam Eligible (≥75%)</p>
            <p className="text-3xl font-black text-emerald-700">{eligibleCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {students.length > 0 ? `${Math.round((eligibleCount / students.length) * 100)}% of class` : '0%'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
        </div>

        {/* At-Risk (<75%) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">At-Risk (<span className="normal-case">Below 75%</span>)</p>
            <p className={`text-3xl font-black ${atRiskCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{atRiskCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Action required</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${atRiskCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined text-[24px]">person_alert</span>
          </div>
        </div>

        {/* Class Average Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Class Avg Attendance</p>
            <p className="text-3xl font-black" style={{ color: classAvgRate >= 75 ? '#081637' : '#e11d48' }}>
              {classAvgRate}%
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Across all lectures</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]" style={{ color: classAvgRate >= 75 ? '#10b981' : '#e11d48' }}>
              trending_up
            </span>
          </div>
        </div>
      </div>

      {/* Full-Width Student Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header & Search Filter Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#081637] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Students ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('eligible')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'eligible'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eligible ({eligibleCount})
            </button>
            <button
              onClick={() => setStatusFilter('at_risk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'at_risk'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              At Risk ({atRiskCount})
            </button>
          </div>

          {/* Instant Search Bar */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus-within:border-[#081637] focus-within:ring-2 focus-within:ring-[#081637]/10 transition-all w-full md:w-80 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#081637] text-white">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">#</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Student Name</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Student ID</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Attendance Rate</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">Status</th>
                <th className="px-6 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, index) => {
                const isCritical = student.attendanceRate < 60;
                const isWarning = student.attendanceRate >= 60 && student.attendanceRate < 75;
                const isGood = student.attendanceRate >= 75;

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#081637] text-white flex items-center justify-center text-xs font-bold">
                          {student.avatarInitials}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-medium text-slate-600">{student.indexNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-[160px]">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isGood ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${student.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-900 w-10 text-right">
                          {student.attendanceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isGood ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Good Standing
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Warning (&lt;75%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Critical Risk
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={async () => {
                          if (!id) return;
                          if (window.confirm(`Are you sure you want to remove ${student.name} (${student.indexNumber}) from this course roster?`)) {
                            try {
                              await api.removeStudent(id, student.id);
                              removeStudent(id, student.id);
                            } catch (e) {
                              console.error("Failed to remove student", e);
                            }
                          }
                        }}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer border border-rose-200"
                        title="Remove student from course"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">person_off</span>
                    <p className="text-sm font-semibold text-slate-700">No students match your filter</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {students.length === 0
                        ? "No students have joined this course yet. Share the join code with your class."
                        : "Try clearing your search query or selecting 'All Students'."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
