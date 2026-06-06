import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications();

  if (!isOpen) return null;

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.courseId) {
      if (notification.type === 'session_reminder') {
        navigate('/session/create', { state: { courseId: notification.courseId } });
      } else if (notification.sessionId) {
        navigate('/session/summary', { state: { sessionId: notification.sessionId } });
      } else {
        navigate(`/courses/${notification.courseId}`);
      }
    }
    
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'notifications';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-14 right-6 w-96 max-h-[calc(100vh-5rem)] bg-white rounded-lg border border-slate-200 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-[10px] text-slate-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                title="Clear all"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-400">delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-slate-400">notifications_off</span>
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">No notifications</p>
              <p className="text-[11px] text-slate-500 text-center">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                  )}

                  <div className="flex gap-3 pl-2">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getPriorityColor(notification.priority)}`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {getPriorityIcon(notification.priority)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-slate-900">{notification.title}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px] text-slate-400">close</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-2">{notification.message}</p>
                      
                      {/* Metadata */}
                      {notification.metadata && (
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          {notification.courseCode && (
                            <span className="font-mono font-bold">{notification.courseCode}</span>
                          )}
                          {notification.metadata.attendanceRate !== undefined && (
                            <span className={`font-bold ${
                              notification.metadata.attendanceRate >= 70 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {notification.metadata.attendanceRate}%
                            </span>
                          )}
                          {notification.metadata.presentCount !== undefined && notification.metadata.totalStudents !== undefined && (
                            <span>{notification.metadata.presentCount}/{notification.metadata.totalStudents} students</span>
                          )}
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <p className="text-[10px] text-slate-400 mt-2">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
