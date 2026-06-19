# Notifications System Guide

## Overview
The notifications system is now fully integrated into the GCTU Attendance App. It provides real-time alerts for sessions, attendance updates, and course information.

## Features Implemented

### 1. **Notification Types**
- ✅ `session_start` - When a lecturer starts a session
- ✅ `session_ending` - Warning when session is about to close
- ✅ `attendance_success` - Confirmation of successful attendance
- ✅ `attendance_missed` - Alert for missed attendance
- ✅ `course_joined` - Confirmation when joining a course
- ✅ `course_update` - Updates about course changes
- ✅ `announcement` - General system announcements

### 2. **UI Components**
- Bell icon with badge count on Home, History, and Profile pages
- Dedicated notifications page (`/notifications`)
- Color-coded notification cards
- Timestamp display (e.g., "5m ago", "2h ago")
- Mark as read/unread functionality
- Delete individual notifications
- Clear all notifications

### 3. **Notification Actions**
- Tap notification to mark as read
- Tap "session_start" notifications to go directly to scanner
- Delete unwanted notifications
- Mark all as read with one tap

## How to Use in Your Code

### Adding Notifications

```typescript
import { useNotifications } from '@/src/contexts/NotificationContext';

function YourComponent() {
  const { addNotification } = useNotifications();

  // Example: Session start notification
  addNotification({
    type: 'session_start',
    title: 'Session Started',
    message: 'Your lecturer has started an attendance session',
    courseCode: 'DCIT 101',
    courseName: 'Introduction to Computer Science',
    actionable: true,
    actionData: { sessionId: 'abc123' }
  });

  // Example: Attendance success
  addNotification({
    type: 'attendance_success',
    title: 'Attendance Marked!',
    message: 'Your attendance has been successfully recorded',
    courseCode: 'DCIT 202',
    courseName: 'Data Structures',
    actionable: false
  });

  // Example: Session ending warning
  addNotification({
    type: 'session_ending',
    title: 'Session Ending Soon',
    message: 'Only 5 minutes left to mark attendance for MATH 101',
    courseCode: 'MATH 101',
    courseName: 'Calculus I',
    actionable: true
  });
}
```

### Integration Points

1. **LiveSessionContext** - Add `session_start` notifications when new sessions appear
2. **GPS Verify Page** - Add `attendance_success` after successful verification
3. **Join Course Page** - Add `course_joined` after successful join
4. **Session Timer** - Add `session_ending` when 5 minutes remain

## Next Steps for Full Implementation

### 1. Integrate with Live Sessions
Update `src/contexts/LiveSessionContext.tsx` to automatically create notifications:

```typescript
// When a new session is detected
if (newSession) {
  addNotification({
    type: 'session_start',
    title: 'New Session Started',
    message: `${newSession.courseName} attendance is now open`,
    courseCode: newSession.courseCode,
    courseName: newSession.courseName,
    actionable: true,
    actionData: { sessionId: newSession.id }
  });
}
```

### 2. Add Session Timer Warnings
Create a timer to warn students 5 minutes before session ends:

```typescript
// In LiveSessionContext or a dedicated timer service
useEffect(() => {
  liveSessions.forEach(session => {
    const timeRemaining = calculateTimeRemaining(session);
    if (timeRemaining === 5 * 60 * 1000) { // 5 minutes
      addNotification({
        type: 'session_ending',
        title: 'Hurry! Session Ending Soon',
        message: `Only 5 minutes left for ${session.courseCode}`,
        courseCode: session.courseCode,
        courseName: session.courseName,
        actionable: true
      });
    }
  });
}, [liveSessions]);
```

### 3. Track Missed Attendance
After a session ends, check if student marked attendance:

```typescript
// When session ends
if (!attendanceMarked) {
  addNotification({
    type: 'attendance_missed',
    title: 'Attendance Missed',
    message: `You missed attendance for ${courseName}`,
    courseCode: courseCode,
    courseName: courseName,
    actionable: false
  });
}
```

### 4. Course Update Notifications
When course details change:

```typescript
addNotification({
  type: 'course_update',
  title: 'Course Venue Changed',
  message: `${courseName} venue changed to ${newVenue}`,
  courseCode: courseCode,
  courseName: courseName,
  actionable: false
});
```

## Notification Storage
- Notifications are stored in AsyncStorage
- Persists across app restarts
- Each notification has a unique ID
- Read/unread state is saved

## Testing the System

1. Open the app and go to any page with the bell icon
2. The bell icon should be visible in the header
3. Add test notifications using the `addNotification` function
4. Badge count should appear on the bell icon
5. Tap bell icon to open notifications page
6. Test marking as read, deleting, and clearing all

## Color Scheme

Each notification type has a unique color:
- Session Start: Green (#16A34A)
- Session Ending: Orange (#F59E0B)
- Attendance Success: Green (#16A34A)
- Attendance Missed: Red (#DC2626)
- Course Joined: Navy (#081637)
- Course Update: Gold (#F5B41C)
- Announcement: Blue (#3B82F6)

## Future Enhancements

- Push notifications (requires Expo Notifications setup)
- Notification preferences/settings
- Notification sounds
- Rich notifications with images
- Notification grouping by type
- Notification search/filter
