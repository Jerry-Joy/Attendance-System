# SmartAttend Backend — Development Plan

## Stack

| Technology | Purpose |
|------------|---------|
| NestJS | Backend framework (TypeScript-first, modular) |
| PostgreSQL | Relational database |
| Prisma | ORM & migrations |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Socket.io | Real-time WebSocket events |
| class-validator | Request validation |
| Passport | Auth strategy integration |

---

## Phase 1: Project Scaffolding & Database Design

### 1.1 — Initialize NestJS Project
- Create `backend/` folder alongside the two frontend projects
- Install NestJS CLI and scaffold the project
- Install core dependencies: Prisma, bcrypt, passport, jwt, class-validator, socket.io
- Configure environment variables (`.env` with `DATABASE_URL`, `JWT_SECRET`)
- Set up CORS for both frontends (localhost:5173 for web, Expo tunnel for mobile)

### 1.2 — Design Prisma Schema
**Models:**

| Model | Key Fields |
|-------|------------|
| **User** | id, email, fullName, passwordHash, role (STUDENT/LECTURER), studentId?, staffId?, createdAt |
| **Course** | id, courseCode, courseName, joinCode, lecturerId (FK → User), venue, dayOfWeek, startTime, endTime, createdAt |
| **Enrollment** | id, studentId (FK → User), courseId (FK → Course), enrolledAt |
| **Session** | id, courseId (FK → Course), lecturerId (FK → User), qrToken, latitude, longitude, geofenceRadius, duration, startedAt, endedAt, status (ACTIVE/ENDED) |
| **Attendance** | id, sessionId (FK → Session), studentId (FK → User), method (QR_GPS/QR_ONLY), distance, markedAt |

### 1.3 — Run Initial Migration
- Generate and apply Prisma migration
- Seed database with test data (the lecturer from mock data + a few students)

**Deliverable:** NestJS server starts, connects to PostgreSQL, tables exist.

---

## Phase 2: Authentication Module

### 2.1 — Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register student or lecturer |
| POST | `/auth/login` | Login, returns JWT access token |
| GET | `/auth/me` | Get current user profile from token |

### 2.2 — Implementation Details
- Password hashing with bcrypt (12 salt rounds)
- JWT access token (issued on login/signup, expires in 24h)
- Passport JWT strategy for extracting & validating tokens
- Role-based guard (`@Roles('LECTURER')`, `@Roles('STUDENT')`)
- Validation: email format, password min 6 chars, required fields

### 2.3 — Security
- Passwords never stored in plain text
- JWT secret from environment variable, not hardcoded
- Tokens validated on every protected route
- Rate limiting on auth endpoints (optional, recommended)

**Deliverable:** Students and lecturers can sign up, log in, and access protected routes.

---

## Phase 3: Courses Module

### 3.1 — Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/courses` | Create a new course | Lecturer |
| GET | `/courses` | List courses for current user | Both |
| GET | `/courses/:id` | Get course details | Both |
| PATCH | `/courses/:id` | Update course info | Lecturer (owner) |
| DELETE | `/courses/:id` | Delete a course | Lecturer (owner) |
| POST | `/courses/join` | Student joins via join code | Student |
| GET | `/courses/:id/students` | List enrolled students | Lecturer (owner) |
| DELETE | `/courses/:id/students/:studentId` | Remove a student | Lecturer (owner) |

### 3.2 — Join Code Logic
- Auto-generated on course creation: `{COURSECODE}-{4 random alphanumeric}`
- Character set: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous chars)
- Unique constraint in database
- Students use this code to enroll

### 3.3 — Business Rules
- Only the owning lecturer can edit/delete their courses
- Students see only courses they're enrolled in
- Lecturers see only courses they created
- Duplicate enrollment prevention

**Deliverable:** Full course CRUD, student enrollment via join codes.

---

## Phase 4: Sessions Module

### 4.1 — Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/sessions` | Start a new attendance session | Lecturer |
| GET | `/sessions/:id` | Get session details | Both |
| PATCH | `/sessions/:id/end` | End an active session | Lecturer (owner) |
| GET | `/courses/:id/sessions` | List past sessions for a course | Lecturer |
| GET | `/sessions/:id/summary` | Get session summary (attendance stats) | Lecturer |

### 4.2 — Session Start Logic
- Lecturer provides: courseId, duration (minutes), latitude, longitude, geofenceRadius (30-100m)
- Server generates QR token: `SA-{timestamp}-{random6}`
- Session status set to `ACTIVE`
- Auto-end: session ends when duration expires (can be handled by a scheduled task or checked on each request)

### 4.3 — QR Token Refresh
- Endpoint: `PATCH /sessions/:id/refresh-qr`
- Generates a new token, invalidates the old one
- Frontend calls this every 30 seconds
- QR payload contains: `{ token, courseId, courseCode, lat, lng, radius, exp }`

### 4.4 — Business Rules
- Only one active session per course at a time
- Only the course's lecturer can start/end sessions
- Session stores the GPS coordinates of the lecturer's location at start time

**Deliverable:** Lecturers can start, monitor, and end attendance sessions with rotating QR codes.

---

## Phase 5: Attendance Module

### 5.1 — Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/attendance/mark` | Student marks attendance | Student |
| GET | `/attendance/history` | Student's attendance history | Student |
| GET | `/sessions/:id/attendance` | All attendance for a session | Lecturer |

### 5.2 — Mark Attendance Logic
The student's app sends:
```json
{
  "token": "SA-1709654321-a3f2b1",
  "courseId": "uuid",
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

**Server-side validation (in order):**
1. Token matches an active session's current QR token
2. Token has not expired (within 30 second window)
3. Student is enrolled in the course
4. Student has not already marked attendance for this session
5. GPS verification — Haversine distance between student's coordinates and session coordinates must be within `geofenceRadius + min(gpsAccuracy, 30)` meters
6. If GPS check fails but QR is valid → mark as `QR_ONLY`

### 5.3 — Haversine Formula (Server-Side)
- Same formula currently in the mobile app's `gps-verify.tsx`
- Moved to server for tamper-proof verification
- Earth radius: 6,371,000 meters

### 5.4 — Business Rules
- Duplicate attendance prevented (unique constraint on sessionId + studentId)
- Attendance cannot be marked after session ends
- Distance and method stored for audit trail

**Deliverable:** Students can mark attendance with QR + GPS verification, server validates everything.

---

## Phase 6: Real-Time WebSocket Gateway

### 6.1 — Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `session:join` | Client → Server | Lecturer joins a session room |
| `attendance:new` | Server → Client | New student marked attendance |
| `session:ended` | Server → Client | Session was ended |
| `session:qr-refreshed` | Server → Client | New QR token generated |

### 6.2 — Implementation
- NestJS WebSocket Gateway using Socket.io
- Room-based: each active session is a room (`session:{id}`)
- When a student marks attendance, server emits `attendance:new` to the session room
- Lecturer's live monitor subscribes to the room and gets real-time updates
- JWT authentication on WebSocket connection (token sent in handshake)

### 6.3 — What This Replaces
- Currently the lecturer app simulates random student arrivals with `setTimeout`
- This gives real arrivals as they happen

**Deliverable:** Lecturer sees students appear in real-time on the live monitor.

---

## Phase 7: Reports & Analytics Endpoints

### 7.1 — Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reports/weekly` | Weekly attendance trends | Lecturer |
| GET | `/reports/courses/:id` | Per-course attendance stats | Lecturer |
| GET | `/reports/verification-methods` | Breakdown of QR_GPS vs QR_ONLY | Lecturer |
| GET | `/reports/export/:sessionId` | CSV export of session attendance | Lecturer |

### 7.2 — Computed Data
- Attendance rate per course = (total marks / total enrolled × sessions)
- Weekly trends = attendance counts grouped by day for current/previous week
- Verification breakdown = count of each method across all sessions

**Deliverable:** Lecturer dashboard has real data for charts/stats on the Reports page.

---

## Phase 8: Connect Lecturer Web App

### 8.1 — Changes to Lecturer Web App
| Current (Mock) | Becomes (Real) |
|----------------|----------------|
| `AuthContext` login with hardcoded user | JWT login/signup via API |
| `DataContext` in-memory courses | API calls to `/courses` |
| `DataContext` active session simulation | API calls to `/sessions` |
| Simulated student arrivals | WebSocket `attendance:new` events |
| Mock past sessions & reports | API calls to `/sessions`, `/reports` |
| Mock enrolled students | API calls to `/courses/:id/students` |

### 8.2 — API Client Setup
- Create an API service with Axios/fetch
- Attach JWT token to all requests via interceptor
- Handle 401 responses (redirect to login)
- Environment variable for API base URL

**Deliverable:** Lecturer web app uses real data from the backend.

---

## Phase 9: Connect Student Mobile App

### 9.1 — Changes to Student Mobile App
| Current (Mock) | Becomes (Real) |
|----------------|----------------|
| `AuthContext` — no real auth | JWT login/signup via API |
| `AttendanceContext` — in-memory only | API calls + AsyncStorage persistence |
| Mock student data & courses | API calls to `/courses`, `/attendance/history` |
| Mock schedule | Derived from enrolled courses |
| Scanner → local GPS verify | Scanner → API call to `/attendance/mark` |
| Join course — mock lookup | API call to `/courses/join` |

### 9.2 — API Client Setup
- Create an API service with fetch (React Native)
- Store JWT in AsyncStorage (secure)
- Attach token to all requests
- Handle 401 responses (redirect to login)
- Environment variable for API base URL (works with Expo tunnel)

### 9.3 — Flow Change
Current: QR scan → client GPS check → save to context  
New: QR scan → send token + GPS to server → server validates → returns result → save to local state + shows confirmation

**Deliverable:** Student mobile app uses real data, attendance is persisted in the database.

---

## Phase 10: Testing & Polish

### 10.1 — End-to-End Testing
- Lecturer creates account → creates course → starts session
- Student creates account → joins course → scans QR → GPS verified → attendance marked
- Lecturer sees student appear in real-time on live monitor
- Session ends → summary shows correct stats
- Student sees attendance in history

### 10.2 — Edge Cases to Test
- Expired QR token
- Student outside geofence
- Duplicate attendance attempt
- Session already ended
- Invalid join code
- Concurrent sessions (should be blocked)

### 10.3 — Polish
- Error messages for all failure cases
- Loading states during API calls
- Offline handling (graceful error when no connection)
- Token refresh or re-login on expiry

**Deliverable:** Complete working system — both apps connected to the backend with real data.

---

## Folder Structure (Target)

```
Attendance system/
├── backend/                  ← NestJS backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── dto/
│   │   ├── courses/
│   │   │   ├── courses.module.ts
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   └── dto/
│   │   ├── sessions/
│   │   │   ├── sessions.module.ts
│   │   │   ├── sessions.controller.ts
│   │   │   ├── sessions.service.ts
│   │   │   └── dto/
│   │   ├── attendance/
│   │   │   ├── attendance.module.ts
│   │   │   ├── attendance.controller.ts
│   │   │   ├── attendance.service.ts
│   │   │   └── dto/
│   │   ├── websocket/
│   │   │   ├── websocket.module.ts
│   │   │   └── websocket.gateway.ts
│   │   ├── reports/
│   │   │   ├── reports.module.ts
│   │   │   ├── reports.controller.ts
│   │   │   └── reports.service.ts
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── lecturer webapp/          ← React + Vite
├── student app/              ← Expo + React Native
└── BACKEND_PLAN.md           ← This file
```

---

## Prerequisites Before Starting

- [ ] Node.js installed (already have this)
- [ ] PostgreSQL installed and running (or Docker)
- [ ] A database created (e.g., `smartattend`)
- [ ] Connection string ready: `postgresql://user:password@localhost:5432/smartattend`
