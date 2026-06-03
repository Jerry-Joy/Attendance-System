import { Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses, pastSessions, activeSession } = useData();

  const totalStudents = courses.reduce((a, c) => a + c.studentCount, 0);

  // Helper function to parse schedule and calculate time until class
  const getTimeUntilClass = (schedule?: string) => {
    if (!schedule) return null;
    
    try {
      // Parse schedule format: "Monday, 09:00 - 10:30"
      const parts = schedule.split(',');
      if (parts.length < 2) return null;
      
      const dayName = parts[0].trim();
      const timeRange = parts[1].trim();
      const [startTimePart, endTimePart] = timeRange.split('-').map(t => t.trim());
      
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      // Parse scheduled start and end times (HH:MM format)
      const [startHours, startMinutes] = startTimePart.split(':').map(Number);
      const scheduledStartTime = startHours * 60 + startMinutes;
      
      const [endHours, endMinutes] = endTimePart.split(':').map(Number);
      const scheduledEndTime = endHours * 60 + endMinutes;
      
      // Check if it's today
      if (dayName === currentDay) {
        const minutesUntil = scheduledStartTime - currentTime;
        
        // Class is currently in session (between start and end time)
        if (currentTime >= scheduledStartTime && currentTime < scheduledEndTime) {
          const minutesRemaining = scheduledEndTime - currentTime;
          return {
            minutes: 0, // Already started
            label: `In Progress (${minutesRemaining}m left)`,
            priority: 0, // Highest priority
            canSetup: false, // Can't setup, already started
            isToday: true,
            isPast: false,
            isLive: true
          };
        }
        
        // Class is upcoming (in the future)
        if (minutesUntil > 0) {
          if (minutesUntil < 60) {
            return { 
              minutes: minutesUntil, 
              label: `In ${minutesUntil} min`, 
              priority: 1,
              canSetup: minutesUntil <= 5, // Only allow setup 5 minutes before class
              isToday: true,
              isPast: false,
              isLive: false
            };
          } else {
            const hrs = Math.floor(minutesUntil / 60);
            const mins = minutesUntil % 60;
            return { 
              minutes: minutesUntil, 
              label: mins > 0 ? `In ${hrs}h ${mins}m` : `In ${hrs}h`, 
              priority: 2,
              canSetup: false,
              isToday: true,
              isPast: false,
              isLive: false
            };
          }
        } 
        // Class has already ended today
        else {
          return {
            minutes: minutesUntil,
            label: 'Completed',
            priority: 999,
            canSetup: false,
            isToday: true,
            isPast: true,
            isLive: false
          };
        }
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Get all today's courses (including past ones for context)
  const todaysCourses = [...courses]
    .filter(c => c.id !== activeSession?.courseId) // Exclude active session
    .map(course => ({
      ...course,
      timeInfo: getTimeUntilClass(course.schedule)
    }))
    .filter(c => c.timeInfo?.isToday) // Only today's classes
    .sort((a, b) => {
      // Sort by time: upcoming classes first (by minutes), then past classes
      if (a.timeInfo && b.timeInfo) {
        return a.timeInfo.minutes - b.timeInfo.minutes;
      }
      return 0;
    });

  // Find the "next class" - only upcoming classes (exclude in-progress and past)
  const nextClass = todaysCourses.find(c => c.timeInfo && !c.timeInfo.isPast && !c.timeInfo.isLive) || courses[0];

  // Find if there's a class currently in progress
  const currentClass = todaysCourses.find(c => c.timeInfo?.isLive);

  // Recent activity: last 5 completed sessions
  const recentSessions = pastSessions.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-slate-900">Dashboard</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Status & Schedule</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Live Status */}
        <div className={`rounded-2xl p-6 flex flex-col relative overflow-hidden border animate-slide-up ${activeSession ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`} style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Status</span>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-slate-600">sensors</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${activeSession ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">{activeSession ? 'Active' : 'Standby'}</h2>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{activeSession ? activeSession.courseCode : 'No active session'}</p>
        </div>

        {/* Active Courses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Courses</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-slate-600">school</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tabular-nums mb-1">{String(courses.length).padStart(2, '0')}</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">F26 Term</p>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-slate-600">groups</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-extrabold text-slate-900 tabular-nums">{totalStudents}</h2>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide mb-1.5" style={{ backgroundColor: "#FFF3CD", color: "#856404" }}>Enrolled</span>
          </div>
        </div>

        {/* Next Class / Current Class */}
        <div className={`rounded-2xl p-6 border-2 flex flex-col relative overflow-hidden animate-slide-up ${currentClass ? 'bg-emerald-50' : 'bg-white'}`} style={{ borderColor: currentClass ? "#10B981" : "#F5B41C", animationDelay: '0.4s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {currentClass ? 'Current Class' : 'Next Class'}
              </span>
              {currentClass && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentClass ? "#D1FAE5" : "#FFF9E6" }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color: currentClass ? "#059669" : "#F5B41C" }}>
                {currentClass ? 'pending' : 'event'}
              </span>
            </div>
          </div>
          
          {currentClass ? (
            // Show current in-progress class
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{currentClass.code}</h2>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-600 font-semibold">{currentClass.venueName || 'TBA'}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    {currentClass.timeInfo?.label || 'In Progress'}
                  </span>
                  {nextClass && (
                    <span className="text-[9px] text-slate-500 font-semibold">
                      Next: {nextClass.code} {nextClass.timeInfo?.label ? `(${nextClass.timeInfo.label})` : ''}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Show next upcoming class
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{nextClass?.code || '—'}</h2>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600 font-semibold">{nextClass?.venueName || 'TBA'}</span>
                <span className="text-[9px] text-slate-500 font-semibold uppercase">
                  {nextClass?.timeInfo?.label || (nextClass?.schedule || 'TBA')}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content: Recent Activity + Active Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-2 flex flex-col animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">Recent Activity</h2>
            <Link to="/history" className="text-[10px] uppercase font-bold hover:opacity-70 transition-opacity tracking-wide" style={{ color: "#F5B41C" }}>View All</Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-300">
                  <span className="material-symbols-outlined text-[20px] text-slate-500">history</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono uppercase">No completed sessions yet</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {recentSessions.map((session, idx) => {
                const rate = Math.round((session.presentCount / session.totalStudents) * 100);
                return (
                  <button
                    key={session.id}
                    onClick={() => navigate('/session/summary', { state: { session } })}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors cursor-pointer rounded-lg group relative"
                  >
                    {/* Timeline dot */}
                    <div className={`w-10 h-10 rounded-full border-2 shrink-0 flex items-center justify-center ${idx === 0 ? 'bg-amber-50 border-amber-400' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: idx === 0 ? "#F5B41C" : "#64748b" }}>
                        {idx === 0 ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide" style={{ backgroundColor: "#F5F5F5", color: "#1a2332" }}>{session.courseCode}</span>
                        <span className="text-xs font-semibold text-slate-900 truncate">{session.courseName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                          {session.date}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{session.startTime}</span>
                      </div>
                    </div>

                    {/* Rate badge */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-extrabold text-slate-900 tabular-nums">{session.presentCount}/{session.totalStudents}</p>
                      <p className="text-[10px] font-bold text-slate-500">{rate}%</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">Active Schedule</h2>
            <Link to="/courses" className="text-[10px] uppercase font-bold hover:opacity-70 transition-opacity tracking-wide" style={{ color: "#F5B41C" }}>View All</Link>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto">
            {todaysCourses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[20px] text-slate-500">event</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono uppercase">No classes scheduled for today</p>
              </div>
            ) : (
              todaysCourses.map((course, idx) => {
                const isLive = activeSession?.courseId === course.id;
                const timeInfo = course.timeInfo;
                const isPast = timeInfo?.isPast;
                const isInProgress = timeInfo?.isLive; // Class is currently happening
                const isUpcoming = timeInfo && !isPast && !isInProgress;
                
                return (
                  <div key={course.id} className={`border rounded-xl overflow-hidden transition-colors ${
                    isInProgress ? 'bg-emerald-50/50 border-emerald-200' : 
                    isPast ? 'bg-slate-100/50 border-slate-200/50 opacity-60' : 
                    'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                  }`}>
                    {/* Course Header */}
                    <div className="p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide" style={{ 
                            backgroundColor: isInProgress ? "#D1FAE5" : isUpcoming && !isPast ? "#FFF9E6" : "#F5F5F5", 
                            color: isInProgress ? "#059669" : isUpcoming && !isPast ? "#F5B41C" : "#1a2332" 
                          }}>{course.code}</span>
                          {timeInfo && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                              isInProgress ? 'bg-emerald-100 text-emerald-700' :
                              isPast ? 'bg-slate-200 text-slate-500' : 
                              timeInfo.priority === 1 ? 'bg-amber-100 text-amber-700' : 
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {isInProgress && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                              {timeInfo.label}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 mb-1">{course.name}</h3>
                        <div className="flex flex-col gap-1">
                          {course.schedule && (
                            <p className="text-[10px] text-slate-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">schedule</span>
                              {course.schedule}
                            </p>
                          )}
                          {course.venueName && (
                            <p className="text-[10px] text-slate-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">meeting_room</span>
                              {course.venueName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Action Button - Only show for upcoming classes when within setup window */}
                    {isUpcoming && timeInfo?.canSetup && !isPast && (
                      <div className="px-4 pb-4">
                        <button 
                          onClick={() => navigate(`/session/create?course=${course.id}`)} 
                          className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all hover:shadow-md" 
                          style={{ backgroundColor: "#F5B41C", color: "#000" }}
                        >
                          <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                          Set Up Session
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
