# GCTU Smart Attendance - Student Mobile App
## Functional Specification (UI-Agnostic)

**Version**: 1.0.0  
**Platform**: React Native (Expo)  
**Target**: iOS & Android  
**Purpose**: Student attendance marking via QR Code + GPS verification  

---

## 1. APPLICATION OVERVIEW

### 1.1 Core Purpose
The student mobile app allows Ghana Communication Technology University (GCTU) students to mark their attendance for lectures using a two-factor verification system:
1. **QR Code Scanning** - Student scans dynamic QR code displayed by lecturer
2. **GPS Geofencing** - Student's physical location is verified against lecture venue

### 1.2 Technology Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Backend Integration**: REST API + WebSocket (Socket.IO)
- **Authentication**: JWT tokens stored in secure storage
- **Real-time**: WebSocket connection for live session notifications
- **Location Services**: expo-location for GPS verification
- **Camera**: expo-camera for QR code scanning
- **Notifications**: expo-notifications for push notifications

### 1.3 User Roles
- **Student**: The only user role in this app
  - Must have a student ID number
  - Can enroll in courses using join codes
  - Can scan QR codes to mark attendance
  - Receives notifications when sessions start

---

## 2. AUTHENTICATION SYSTEM

### 2.1 Splash Screen (Entry Point)
**Route**: `/` (index)


**Functionality**:
- Shows GCTU branding (crest, name, tagline)
- Displays loading indicator
- Automatically checks for existing authentication token
- Routes user based on authentication state:
  - If authenticated → Navigate to Home (`/(student)/home`)
  - If not authenticated → Navigate to Login (`/login`)
- Waits minimum 1.5 seconds for branding visibility

**Data Requirements**:
- Check secure storage for JWT token
- Validate token with backend if exists

**Exit Conditions**:
- Authentication check complete
- Minimum display time elapsed

---

### 2.2 Login Screen
**Route**: `/login`

**Functionality**:
- Student enters email and password
- Form validation (email format, required fields)
- Password visibility toggle
- Submits credentials to backend API
- Stores JWT token on successful authentication
- Navigates to Home on success

**Form Fields**:
1. **Email** - Text input, email keyboard, lowercase
2. **Password** - Secure text input with show/hide toggle

**Actions**:
- **Sign In** button - Submits form, shows loading state
- **Forgot Password** link - Currently non-functional placeholder
- **Create Account** link - Navigates to Signup screen

**Error Handling**:
- Display API error messages
- Show validation errors (empty fields, invalid email)
- Clear errors when user types

**Information Display**:
- GPS location usage disclaimer
- GCTU branding elements

**API Integration**:
- **Endpoint**: `POST /api/auth/login`
- **Request**: `{ email: string, password: string }`
- **Response**: `{ accessToken: string, user: BackendUser }`
- **Success**: Store token, fetch user profile, navigate to home
- **Failure**: Display error message

---

### 2.3 Signup Screen
**Route**: `/signup`

**Functionality**:
- Two-step registration process
- Step 1: Personal information collection
- Step 2: Password creation with strength indicator
- Progress indicator shows current step
- Form validation at each step
- Creates student account on backend

**Step 1 Fields** (Personal Info):
1. **Full Name** - Text input, capitalized words
2. **Email Address** - Email input, lowercase
3. **Student ID** - Text input (format: 421XXXXXXX)

**Step 2 Fields** (Credentials):
1. **Password** - Secure input with visibility toggle
   - Minimum 6 characters required
   - Real-time strength indicator:
     - Too Short (< 6 chars) - Red, 25%
     - Weak (6+ chars, 1 complexity) - Red, 33%
     - Fair (2 complexity factors) - Amber, 50%
     - Good (3 complexity factors) - Blue, 75%
     - Strong (4 complexity factors) - Green, 100%
   - Complexity factors: uppercase, lowercase, number, special character
2. **Confirm Password** - Must match password exactly
   - Shows mismatch warning if different

**Step Navigation**:
- **Continue** button (Step 1) - Validates and moves to Step 2
- **Back** button (Step 2) - Returns to Step 1 without losing data
- **Create Account** button (Step 2) - Submits registration

**Step Indicator**:
- Visual progress: circles connected by line
- Step 1 shows "1", Step 2 shows "1" with checkmark when complete
- Labels: "Personal Info" and "Credentials"

**Validation**:
- Email format check (regex validation)
- Required fields check at each step
- Password length minimum (6 characters)
- Password match verification

**API Integration**:
- **Endpoint**: `POST /api/auth/signup`
- **Request**: `{ email, fullName, password, role: 'STUDENT', studentId }`
- **Response**: `{ accessToken: string, user: BackendUser }`
- **Success**: Store token, navigate to home
- **Failure**: Show error, stay on form

**Exit Points**:
- **Sign In** link - Navigate to Login screen
- **Successful registration** - Navigate to Home

---

## 3. MAIN APPLICATION (AUTHENTICATED SCREENS)

### 3.1 Home Screen (Dashboard)
**Route**: `/(student)/home`
**Tab Navigation**: Home tab selected

**Functionality**:
- Central hub showing student's courses and live sessions
- Pull-to-refresh to update data
- Real-time updates via WebSocket for live sessions
- Quick access to QR scanner
- Displays enrolled courses
- Shows live attendance sessions

**Data Displayed**:

1. **GCTU Badge** - Branding identifier at top
2. **Welcome Header** - "Welcome back, [Student Name]"
3. **Profile Avatar** - Student initials, tappable to go to Profile
4. **Quick Stats Card**:
   - Number of enrolled courses
