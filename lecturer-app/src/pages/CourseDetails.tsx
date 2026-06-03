import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, pastSessions, enrolledStudents } = useData();

  const course = courses.find((c) => c.id === id) || courses[0];
  const sessions = pastSessions.filter((s) => s.courseCode === course?.code);
  const courseStudents = (enrolledStudents[course?.id || ''] || []).slice(0, 4);

  // Compute pie chart data from actual session stats
  const pieChartData = useMemo(() => {
    if (!sessions.length || !course) {
      return [
        { name: 'Present', value: 2.6, color: '#10b981' },
        { name: 'Absent', value: 1.4, color: '#fecdd3' },
      ];
    }
    const totalPresent = sessions.reduce((a, s) => a + s.presentCount, 0);
    const totalAbsent = sessions.reduce((a, s) => a + s.absentCount, 0);
    const avgPresent = totalPresent / sessions.length;
    const avgAbsent = totalAbsent / sessions.length;
    return [
      { name: 'Present', value: avgPresent, color: '#10b981' },
      { name: 'Absent', value: avgAbsent, color: '#fecdd3' },
    ];
  }, [sessions, course]);

  const overallRate = useMemo(() => {
    if (!sessions.length) return 66;
    const total = sessions.reduce((a, s) => a + (s.presentCount / s.totalStudents) * 100, 0);
    return Math.round(total / sessions.length);
  }, [sessions]);

  if (!course) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate(-1)} className="text-[10px] text-slate-500 hover:text-slate-800 uppercase font-mono tracking-widest flex items-center gap-1 w-fit cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Go Back
        </button>
        <div className="bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-[32px] text-red-400 mb-3">error</span>
          <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Course Not Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with back button and course title */}
      <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-600">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{course.name}</h1>
        </div>
        <button
          onClick={() => navigate(`/session/create?course=${course.id}`)}
          className="font-bold text-[11px] uppercase tracking-wide px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:shadow-md"
          style={{ backgroundColor: "#F5B41C", color: "#000" }}
        >
          START SESSION
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Course Details Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900">Course Details</h2>
              <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                <span className="material-symbols-outlined text-[20px] text-slate-600">edit</span>
              </button>
            </div>

            <div className="space-y-5">
              {/* Schedule */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Schedule</label>
                <div className="flex items-center gap-2 text-sm text-slate-900">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                  <span>{course.schedule || 'Not set'}</span>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Location</label>
                <div className="flex items-center gap-2 text-sm text-slate-900">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                  <span>{course.venueName || 'C4'}</span>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Capacity</label>
                <div className="flex items-center gap-2 text-sm text-slate-900">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">groups</span>
                  <span>{course.studentCount} Students</span>
                </div>
              </div>

              {/* Join Code */}
              <div className="pt-4 mt-4 border-t border-slate-200">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Join Code</label>
                <div className="bg-slate-100 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-3 tracking-wider font-mono">
                    {course.joinCode}
                  </div>
                  <button 
                    onClick={() => navigator.clipboard?.writeText(course.joinCode)}
                    className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity mx-auto"
                    style={{ color: "#F5B41C" }}
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    Copy Code
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Breakdown Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-base font-bold text-slate-900 mb-6">Attendance Breakdown</h2>

            {/* Donut Chart */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-56 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                      startAngle={90}
                      endAngle={450}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-slate-900">{overallRate}%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Overall</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
                  <span className="text-sm text-slate-900">Present</span>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">{pieChartData[0].value.toFixed(1)} Avg</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fecdd3" }}></div>
                  <span className="text-sm text-slate-900">Absent</span>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">{pieChartData[1].value.toFixed(1)} Avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Enrolled Students Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Enrolled Students</h2>
              <button 
                onClick={() => navigate(`/courses/${course.id}/roster`)}
                className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">{course.studentCount} Students currently registered.</p>

            {/* Student Avatars */}
            <div className="flex items-center gap-2">
              {courseStudents.slice(0, 3).map((student, i) => (
                <div 
                  key={student.id}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-white"
                  style={{ 
                    backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'][i % 3],
                    marginLeft: i > 0 ? '-8px' : '0'
                  }}
                >
                  {student.avatarInitials}
                </div>
              ))}
              {courseStudents.length > 3 && (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-slate-200 text-slate-600 border-2 border-white" style={{ marginLeft: '-8px' }}>
                  +{courseStudents.length - 3}
                </div>
              )}
              {courseStudents.length === 0 && (
                <div className="text-[11px] text-slate-500">No students enrolled yet</div>
              )}
            </div>
          </div>

          {/* Session Records Card */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Session Records</h2>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-slate-600">filter_list</span>
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-slate-600">download</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">Timestamp</th>
                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">State</th>
                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">Present / Total</th>
                    <th className="px-6 py-3 text-center text-[9px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sessions.slice(0, 4).map((session, i) => (
                    <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-[11px] text-slate-900 font-mono">{session.date}, {session.startTime}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{session.presentCount} / {session.totalStudents}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                          <span className="material-symbols-outlined text-[18px] text-slate-400 hover:text-slate-600">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-[32px] text-slate-300">calendar_today</span>
                          <p className="text-[11px] text-slate-500">No sessions recorded yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {sessions.length > 0 && (
              <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">
                  Showing 4 of {sessions.length} records
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-1.5 border border-slate-300 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    Prev
                  </button>
                  <button className="px-4 py-1.5 border border-slate-300 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
