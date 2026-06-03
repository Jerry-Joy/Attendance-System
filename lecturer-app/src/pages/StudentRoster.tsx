import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function StudentRoster() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { courses } = useData();

  const course = courses.find(c => c.id === id);
  const [copiedJoinCode, setCopiedJoinCode] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Course Not Found</h2>
          <button onClick={() => navigate('/courses')} className="text-sm text-blue-600 hover:underline">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Mock student data based on studentCount
  const students = Array.from({ length: course.studentCount }, (_, i) => {
    const names = [
      { first: 'Jerry Joy', last: 'Amehe', initials: 'JJ' },
      { first: 'Killian', last: '', initials: 'K' },
      { first: 'Cornel', last: 'Kelly', initials: 'CK' },
      { first: 'Selly', last: 'Morgan', initials: 'SM' },
    ];
    const student = names[i % names.length];
    const ids = ['4211231471', '4107578875', '4211231492', '4211231213'];
    return {
      id: `student-${i + 1}`,
      name: student.last ? `${student.first} ${student.last}` : student.first,
      initials: student.initials,
      studentId: ids[i % ids.length],
      attendanceRate: 0,
    };
  });

  const handleCopyJoinCode = () => {
    navigator.clipboard.writeText(course.joinCode);
    setCopiedJoinCode(true);
    setTimeout(() => setCopiedJoinCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Go Back Button */}
        <button 
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-900 transition-colors animate-slide-in"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="text-[11px] font-bold uppercase tracking-wider">GO BACK</span>
        </button>

        {/* Course Code Badge */}
        <div className="mb-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-block px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wide" style={{ backgroundColor: "#1a2332", color: "#F5B41C" }}>
            {course.code}
          </div>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-slate-900 mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          STUDENT ROSTER
        </h1>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Enrollment Access */}
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-6">
                Enrollment Access
              </h2>

              {/* Join Code */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Join Code
                </label>
                <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                  <div className="text-2xl font-bold text-slate-900 mb-3 tracking-wide">
                    {course.joinCode}
                  </div>
                  <button 
                    onClick={handleCopyJoinCode}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    {copiedJoinCode ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
              </div>

              {/* Schedule */}
              {course.schedule && (
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Schedule
                  </label>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                    <span className="font-semibold">{course.schedule}</span>
                  </div>
                </div>
              )}

              {/* Total Enrolled */}
              <div className="mb-4 pb-4 border-b border-slate-200">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Total Enrolled
                </label>
                <div className="text-3xl font-bold text-slate-900">{course.studentCount}</div>
              </div>

              {/* Course Level */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Course Level
                </label>
                <div className="text-sm font-semibold text-slate-700 uppercase">{course.level}</div>
              </div>
            </div>
          </div>

          {/* Right Column - Student Table */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Enrolled Students ({students.length})
                </h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#1a2332" }}>
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white">#</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white">Student</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white">Student ID</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white">Attendance Rate</th>
                      <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {students.map((student, index) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-900">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" 
                              style={{ backgroundColor: "#1a2332" }}
                            >
                              {student.initials}
                            </div>
                            <span className="text-sm font-semibold text-slate-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.studentId}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden" style={{ minWidth: '100px' }}>
                                <div 
                                  className="h-full rounded-full transition-all" 
                                  style={{ width: `${student.attendanceRate}%`, backgroundColor: "#1a2332" }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-bold text-slate-900 tabular-nums w-10 text-right">
                              {student.attendanceRate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {students.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[32px] text-slate-400">groups</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">No Students Enrolled</p>
                  <p className="text-[11px] text-slate-500">Students can join using the course code above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
