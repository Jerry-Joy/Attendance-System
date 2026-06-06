# 🔔 Notification System Documentation

## Overview
The Smart Attendance System now includes a comprehensive notification system for lecturers with three key features:

1. **Session Reminders** - Alerts 5 minutes before scheduled classes
2. **Low Attendance Alerts** - Warnings when session ends with <70% attendance
3. **Session End Summary** - Confirmation when sessions complete successfully

---

## Features

### 1. 📅 Session Reminders
**Trigger:** 5 minutes before scheduled class time
**Content:** 
- Title: "⏰ Session Starting Soon"
- Message: "{Course Code} - {Course Name} starts in 5 minutes"
- Priority: Medium (Yellow)

**How it works:**
- Checks course schedules every minute
- Parses schedule format: "Monday, 09:00 - 10:30"
- Sends reminder once per day per course
- Uses sessionStorage to prevent duplicate reminders

### 2. ⚠️ Low Attendance Alerts
**Trigger:** Session ends with attendance rate below 70%
**Content:**
- Title: "⚠️ Low Attendance Alert"
- Message: "{Course Code} session ended with low attendance"
- Shows: Attendance rate, present count, total students
- Priority: High (Red)

**How it works:**
- Calculates attendance rate when session ends
- Compares against 70% threshold
- Triggers high-priority notification if below threshold

### 3. ✅ Session End Summary
**Trigger:** Session ends with attendance rate ≥70%
**Content:**
- Title: "✅ Session Completed"
- Message: "{Course Code} - {Course Name} ended successfully"
- Shows: Attendance rate, present count, total students
- Priority: Low (Blue)

**How it works:**
- Triggers when session ends normally
- Provides quick summary without navigating to History

---

## User Interface

### Notification Button (Top Bar)
- **Location:** Top right navigation bar
- **Badge:** Shows unread count (e.g., "3")
- **Indicator:** Yellow pulsing dot when unread notifications exist
- **Animations:** 
  - Button scales on hover
  - Badge animates in when new notification arrives
  - Icon scales on hover

### Notification Panel
- **Trigger:** Click notification button
- **Layout:** Dropdown panel (right-aligned)
- **Max Height:** Scrollable list
- **Actions:**
  - Click notification → Navigate to relevant page
  - Mark all as read
  - Clear all notifications
  - Delete individual notification

### Notification Items
**Visual Elements:**
- Unread indicator (blue dot)
- Priority color-coded icon (Red/Yellow/Blue)
- Title & message
- Metadata (course code, attendance stats)
- Timestamp (relative time: "5 minutes ago")
- Hover delete button

**Clickable Actions:**
- Session Reminder → Navigate to Create Session
- Low Attendance/Summary → Navigate to Course Details or Session Summary

---

## Settings Integration

### Toggle Control
**Location:** Settings > Session Configuration
**Setting:** "Check-in Notifications"
**Default:** Enabled

**When Disabled:**
- No new notifications are created
- Existing notifications remain visible
- User can still view/manage past notifications

---

## Data Management

### Storage
- **Location:** localStorage (`corescan_notifications`)
- **Max Notifications:** 50 (keeps most recent)
- **Retention:** 7 days (auto-cleanup on load)

### State Management
- **Context:** `NotificationContext`
- **Hook:** `useNotifications()`
- **Provider:** Wraps entire app in `App.tsx`

---

## Technical Implementation

### File Structure
```
src/
├── types/index.ts                    # Notification types
├── context/
│   └── NotificationContext.tsx       # State management
├── components/
│   ├── Topnav.tsx                    # Notification button
│   └── NotificationPanel.tsx         # Dropdown panel
└── pages/
    └── ActiveSession.tsx             # Session end notifications
```

### Key Functions

**NotificationContext:**
- `addNotification()` - Create new notification
- `markAsRead()` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `clearAll()` - Delete all notifications
- `removeNotification()` - Delete single notification

**Session Reminder Logic:**
- Runs every 60 seconds via `setInterval`
- Compares current time with course schedules
- Checks for 5-minute window before class start
- Uses sessionStorage to prevent duplicates

**Session End Logic:**
- Calculates attendance rate on session end
- Triggers appropriate notification (low attendance vs summary)
- Includes metadata for display

---

## User Flow

### Example: Session Reminder
1. Course scheduled: "Monday, 09:00 - 10:30"
2. Current time: Monday, 08:55
3. System sends notification: "CS 201 starts in 5 minutes"
4. User clicks notification → Navigate to Create Session page
5. User starts session on time

### Example: Low Attendance Alert
1. Lecturer ends session
2. System calculates: 18/40 students = 45%
3. Since 45% < 70%, triggers low attendance alert
4. Notification shows: "⚠️ Low Attendance Alert - CS 201"
5. User clicks → Navigate to session summary to review

### Example: Session Summary
1. Lecturer ends session
2. System calculates: 35/40 students = 88%
3. Since 88% ≥ 70%, triggers success summary
4. Notification shows: "✅ Session Completed - CS 201 (88%)"
5. User clicks → Navigate to course details

---

## Animations

### Notification Button
- Scale up on hover (1.1x)
- Active press effect (0.95x)
- Badge pop-in animation
- Icon scale on hover

### Notification Panel
- Slide in from right
- Smooth opacity fade
- Staggered list animations

### Individual Notifications
- Unread indicator pulse
- Hover background change
- Delete button fade-in

---

## Future Enhancements (Optional)

1. **Real-time Check-in Notifications**
   - Alert when students check in during active session
   - Group multiple check-ins: "5 students just checked in"

2. **Student Enrollment Notifications**
   - Alert when new student joins via course code

3. **GPS Verification Failures**
   - Warn when students fail GPS verification

4. **Weekly Summary**
   - End of week attendance report

5. **Browser Notifications**
   - Use Web Notifications API for system-level alerts

6. **Sound Alerts**
   - Optional audio notification for important alerts

---

## Testing Checklist

### Session Reminders
- [ ] Create course with schedule (e.g., "Monday, 09:00")
- [ ] Set system time to 08:55 on Monday
- [ ] Wait for notification to appear
- [ ] Click notification → Should navigate to Create Session
- [ ] Verify no duplicate reminders

### Low Attendance Alert
- [ ] Start session with enrolled students
- [ ] End session with <70% attendance
- [ ] Verify high-priority (red) notification appears
- [ ] Click notification → Should navigate to summary

### Session End Summary
- [ ] Start session with enrolled students
- [ ] End session with ≥70% attendance
- [ ] Verify low-priority (blue) notification appears
- [ ] Click notification → Should show summary

### Settings Toggle
- [ ] Disable notifications in Settings
- [ ] End a session → No notification should appear
- [ ] Enable notifications again
- [ ] End a session → Notification should appear

### Panel UI
- [ ] Click notification button → Panel opens
- [ ] Click outside panel → Panel closes
- [ ] Click "Mark all as read" → Unread count = 0
- [ ] Click individual delete → Notification removed
- [ ] Click "Clear all" → All notifications removed

---

## Browser Compatibility

- ✅ Chrome/Edge (Tested)
- ✅ Firefox (Tested)
- ✅ Safari (Compatible)
- ✅ Opera (Compatible)

**Requirements:**
- localStorage support
- Modern JavaScript (ES6+)
- date-fns library

---

## Dependencies

```json
{
  "date-fns": "^3.x.x"  // For timestamp formatting
}
```

---

## Troubleshooting

### Notifications Not Appearing
1. Check Settings → "Check-in Notifications" is enabled
2. Verify course has schedule set
3. Check browser console for errors
4. Clear localStorage and refresh

### Session Reminders Not Working
1. Verify course schedule format: "Day, HH:MM - HH:MM"
2. Check current day matches schedule day
3. Ensure time is exactly 5 minutes before start
4. Check sessionStorage for duplicate prevention key

### Panel Not Opening
1. Check browser console for errors
2. Verify NotificationProvider is wrapping app
3. Check z-index conflicts with other elements

---

## Support

For issues or questions about the notification system:
1. Check browser console for error messages
2. Verify all files are properly imported
3. Ensure NotificationProvider is in App.tsx
4. Test with notifications enabled in Settings
