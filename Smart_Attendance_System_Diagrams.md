# Smart Attendance System — Mermaid Diagrams
**Ghana Communication Technology University (GCTU)**
*Chapter 3 – System Specification and Design*

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph Clients["Presentation Tier — Clients"]
        direction TB
        subgraph MobileApp["React Native Mobile App (Expo SDK 54)"]
            MA1[QR Scanner Screen]
            MA2[GPS Verify Screen]
            MA3[Attendance Confirmed Screen]
        end
        subgraph WebApp["React Web Dashboard (Vite + React 19)"]
            WA1[Create Session Page]
            WA2[Active Session / Live QR Page]
            WA3[Live Monitor / Check-ins]
        end
    end

    subgraph Backend["Application Logic Tier — NestJS Backend (Node.js)"]
        direction TB
        AuthMod["Auth Module\n(Registration, Login, JWT)"]
        CourseMod["Courses Module\n(CRUD, Join Codes, Enrolments)"]
        SessionMod["Sessions Module\n(QR Generation, Rotation, Cron Expiry)"]
        AttMod["Attendance Module\n(Token Validation, Geofence, Recording)"]
        EventsMod["Events Module\n(WebSocket Gateway — Socket.IO)"]
    end

    subgraph DataTier["Data Tier"]
        PG[("PostgreSQL\n(via Prisma ORM)")]
        BC[("Blockchain Node\n[Planned — Future Phase]")]
    end

    GPS["GPS Satellite Network\n(External Infrastructure)"]

    MobileApp -->|"REST API  POST /api/attendance/mark"| Backend
    MobileApp <-->|"WebSocket  session:started / attendance:new"| EventsMod
    WebApp -->|"REST API  POST /api/sessions\nPATCH /api/sessions/:id/refresh-qr"| Backend
    WebApp <-->|"WebSocket  qr:refreshed / attendance:new"| EventsMod

    Backend --> PG
    Backend -.->|"Attendance Record Hash [Planned]"| BC
    BC -.->|"Transaction Confirmation [Planned]"| Backend

    GPS -.->|GPS Coords + Accuracy\nvia Device OS| MobileApp
    GPS -.->|GPS Coords + Accuracy\nvia Browser Geolocation API| WebApp
```

---

## 2. Use Case Diagram

```mermaid
graph LR
    Student(["👤 Student"])
    Lecturer(["👤 Lecturer"])
    System(["⚙️ System"])

    subgraph Boundary["Smart Attendance System"]
        %% Shared
        UC1(["Register Account"])
        UC2(["Login"])
        UC3(["Logout"])

        %% Student Use Cases
        UC4(["View Enrolled Courses"])
        UC5(["Join Course"])
        UC6(["Preview Course"])
        UC7(["Scan QR Code"])
        UC8(["GPS Verification"])
        UC9(["View Attendance Confirmation"])
        UC10(["View Attendance History"])
        UC11(["Manage Profile Settings"])

        %% Lecturer Use Cases
        UC12(["Create Course"])
        UC13(["View / Edit / Delete Course"])
        UC14(["Manage Enrolled Students"])
        UC15(["Create Attendance Session"])
        UC16(["Capture GPS Location"])
        UC17(["View Live QR Code"])
        UC18(["Monitor Real-Time Check-ins"])
        UC19(["End Session Manually"])
        UC20(["View Session Summary"])
        UC21(["View Session History"])
        UC22(["View Analytics Reports"])
        UC23(["Download CSV Report"])
        UC24(["View Blockchain Ledger"])

        %% System Use Cases
        UC25(["Auto-Rotate QR Token"])
        UC26(["Auto-Expire Session"])
        UC27(["Create Absence Records"])
        UC28(["Broadcast WebSocket Events"])
    end

    %% Student associations
    Student --- UC1
    Student --- UC2
    Student --- UC3
    Student --- UC4
    Student --- UC5
    Student --- UC7
    Student --- UC9
    Student --- UC10
    Student --- UC11

    %% Lecturer associations
    Lecturer --- UC1
    Lecturer --- UC2
    Lecturer --- UC3
    Lecturer --- UC12
    Lecturer --- UC13
    Lecturer --- UC14
    Lecturer --- UC15
    Lecturer --- UC17
    Lecturer --- UC18
    Lecturer --- UC19
    Lecturer --- UC20
    Lecturer --- UC21
    Lecturer --- UC22
    Lecturer --- UC23
    Lecturer --- UC24

    %% System associations
    System --- UC25
    System --- UC26
    System --- UC28

    %% Include / Extend relationships
    UC5 -->|"«include»"| UC6
    UC7 -->|"«include»"| UC8
    UC15 -->|"«include»"| UC16
    UC26 -->|"«include»"| UC27
    UC8 -.->|"«extend»"| UC7
```

---

## 3. Context Diagram — DFD Level 0

```mermaid
graph LR
    Student["🎓 Student"]
    Lecturer["👨‍🏫 Lecturer"]
    GPS["🛰️ GPS Satellite Network"]
    BlockchainNet["⛓️ Blockchain Network\n[Planned]"]

    subgraph System["Smart Attendance System"]
        Core((" "))
    end

    %% Student → System
    Student -->|"Registration Details\n(name, email, student ID, password)"| Core
    Student -->|"Login Credentials"| Core
    Student -->|"Course Join Code"| Core
    Student -->|"QR Code Scan Data\n(decoded JSON payload)"| Core
    Student -->|"GPS Location Data\n(lat, lng, accuracy)"| Core
    Student -->|"Attendance Submission Request"| Core

    %% System → Student
    Core -->|"Authentication Token (JWT)"| Student
    Core -->|"Session Started Notification"| Student
    Core -->|"Enrolled Course List"| Student
    Core -->|"Attendance Confirmation"| Student
    Core -->|"Attendance History Records"| Student
    Core -->|"Error Responses\n(outside geofence / expired token / duplicate)"| Student

    %% Lecturer → System
    Lecturer -->|"Registration Details"| Core
    Lecturer -->|"Login Credentials"| Core
    Lecturer -->|"Course Details\n(code, name, venue, schedule)"| Core
    Lecturer -->|"Session Parameters\n(course, duration, radius)"| Core
    Lecturer -->|"Lecturer GPS Location Data"| Core
    Lecturer -->|"QR Refresh Request"| Core
    Lecturer -->|"Session End Request"| Core

    %% System → Lecturer
    Core -->|"Authentication Token (JWT)"| Lecturer
    Core -->|"Generated Join Code"| Lecturer
    Core -->|"Live QR Code Data"| Lecturer
    Core -->|"Real-Time Check-in Events"| Lecturer
    Core -->|"Session Summary Data"| Lecturer
    Core -->|"Attendance History & Analytics"| Lecturer
    Core -->|"CSV Export File"| Lecturer

    %% GPS
    GPS -.->|"GPS Coordinates + Accuracy\n(via device OS / browser API)"| Core

    %% Blockchain (planned)
    Core -.->|"Finalised Attendance Record Hash\n[Planned]"| BlockchainNet
    BlockchainNet -.->|"Transaction Confirmation + Block Ref\n[Planned]"| Core
```

---

## 4. DFD Level 1 (Diagram 0 — Major Processes)

```mermaid
graph TB
    Student["🎓 Student"]
    Lecturer["👨‍🏫 Lecturer"]
    GPS["🛰️ GPS Satellite Network"]
    BC["⛓️ Blockchain Network\n[Planned]"]

    D1[("D1: Users")]
    D2[("D2: Courses")]
    D3[("D3: Enrolments")]
    D4[("D4: Sessions")]
    D5[("D5: Attendance Records")]
    D6[("D6: Absence Records")]

    P1["1\nUser Authentication\n& Account Management"]
    P2["2\nCourse & Enrolment\nManagement"]
    P3["3\nSession & QR Code\nManagement"]
    P4["4\nAttendance Verification\n& Recording"]
    P5["5\nReporting & History"]
    P6["6\nReal-Time Event Distribution\n(WebSocket Gateway)"]
    P7["7\nAutomated Session Lifecycle\nManagement (Scheduler)"]

    %% Auth flows
    Student -->|"Registration Details / Login Credentials"| P1
    Lecturer -->|"Registration Details / Login Credentials"| P1
    P1 <-->|"Read / Write User Records"| D1
    P1 -->|"Authentication Token"| Student
    P1 -->|"Authentication Token"| Lecturer

    %% Course flows
    Lecturer -->|"Course Details"| P2
    Student -->|"Course Join Code"| P2
    P2 <-->|"Read / Write Courses"| D2
    P2 <-->|"Read / Write Enrolments"| D3
    P2 -->|"Generated Join Code"| Lecturer
    P2 -->|"Course Preview / Enrolment Confirmation"| Student

    %% Session / QR flows
    Lecturer -->|"GPS Location Data + Session Parameters"| P3
    Lecturer -->|"QR Refresh Request / Session End Request"| P3
    P3 <-->|"Read / Write Session Records"| D4
    P3 -->|"Live QR Code Data"| Lecturer
    P3 -->|"Session Lifecycle Events"| P6

    %% Attendance flows
    Student -->|"QR Scan Data + GPS Location Data"| P4
    P4 -->|"Read Session (tokens, geofence)"| D4
    P4 -->|"Read Enrolment"| D3
    P4 -->|"Read / Write Attendance Records"| D5
    P4 -->|"Attendance Confirmation / Error Response"| Student
    P4 -->|"Attendance-New Event"| P6

    %% Reporting flows
    Lecturer -->|"History / Report Requests"| P5
    Student -->|"Attendance History Request"| P5
    P5 -->|"Read Sessions"| D4
    P5 -->|"Read Attendance"| D5
    P5 -->|"Read Absences"| D6
    P5 -->|"History, Analytics, CSV Export"| Lecturer
    P5 -->|"Personal Attendance History"| Student

    %% WebSocket gateway
    P6 -->|"session:started / qr:refreshed / attendance:new / session:ended"| Student
    P6 -->|"attendance:new / qr:refreshed / session:ended"| Lecturer

    %% Scheduler
    P7 -->|"Read Active Sessions (by duration)"| D4
    P7 -->|"Update Session Status → ENDED"| D4
    P7 -->|"Read Enrolments"| D3
    P7 -->|"Read Attendance (to find absentees)"| D5
    P7 -->|"Write Absence Records"| D6
    P7 -->|"Session-Ended Event"| P6

    %% GPS
    GPS -.->|"Coordinates + Accuracy"| P3
    GPS -.->|"Coordinates + Accuracy"| P4

    %% Blockchain (planned)
    P4 -.->|"Finalised Record Hash [Planned]"| BC
```

---

## 5. DFD Level 2 — QR Code Generation & Validation (Process 3 Expansion)

```mermaid
graph TD
    Lecturer["👨‍🏫 Lecturer"]
    D4[("D4: Sessions")]
    P6["Process 6\n(WebSocket Gateway)"]

    SP31["3.1\nGPS Validation\n(accuracy ≤ 200m,\ntimestamp ≤ 2 min old)"]
    SP32["3.2\nSession Existence Check\n(no active session\nfor this course)"]
    SP33["3.3\nQR Token Generation\nSA-{timestamp}-{6 hex chars}\n+ JSON payload encoding"]
    SP34["3.4\nSession Persistence\n(write to D4)"]
    SP35["3.5\nQR Rotation\n(store prev token,\ngenerate new token,\nwrite back to D4)"]
    SP36["3.6\nEvent Emission\n(session:started,\nqr:refreshed,\nsession:ended)"]

    ERR1["❌ Reject:\nGPS accuracy / staleness\nfailure"]
    ERR2["❌ Reject:\nActive session\nalready exists"]

    Lecturer -->|"GPS Location Data\n+ Session Parameters"| SP31
    SP31 -->|"GPS invalid"| ERR1
    ERR1 -->|"Error Response"| Lecturer
    SP31 -->|"Validated location data"| SP32
    SP32 -->|"Active session found"| ERR2
    ERR2 -->|"Error Response"| Lecturer
    SP32 -->|"No conflict — proceed"| SP33
    SP33 -->|"Token + full session payload"| SP34
    SP34 -->|"Write new session record"| D4
    SP34 -->|"Session created"| SP36

    Lecturer -->|"QR Refresh Request\n(every 30 s)"| SP35
    SP35 -->|"Read current token"| D4
    SP35 -->|"Write updated token pair"| D4
    SP35 -->|"qr:refreshed event"| SP36
    SP35 -->|"Updated QR Code"| Lecturer

    SP36 -->|"Lifecycle events"| P6
```

---

## 6. DFD Level 2 — GPS Geofence Verification (Process 4 — GPS Sub-flow)

```mermaid
graph TD
    Student["🎓 Student"]
    D4[("D4: Sessions")]

    SP41["4.1\nStudent Location Capture\n(expo-location,\nBalanced accuracy)"]
    SP42["4.2\nQR Payload Extraction\n(venue lat/lng,\nlecturer accuracy,\ngeofence radius)"]
    SP43["4.3\nDynamic Buffer Calculation\nmin(max(lecAccuracy + stuAccuracy, 20), 100)\n→ effectiveRadius = base + buffer"]
    SP44["4.4\nHaversine Distance Calculation\n(great-circle distance\nbetween student & venue)"]
    SP45["4.5\nProximity Decision\ndistance ≤ effectiveRadius?"]
    SP46["4.6\nServer-Side Re-Validation\n(backend independently repeats\n4.3 and 4.4 using D4 data)"]

    ERR_GEO["❌ Outside Geofence\nError Response"]
    OK["✅ Proceed to\nAttendance Recording"]

    Student -->|"QR Scan Data"| SP42
    Student -->|"Request GPS"| SP41
    SP41 -->|"lat, lng, accuracy"| SP43
    SP42 -->|"venue coords,\nlecturer accuracy,\nbase radius"| SP43
    SP43 -->|"effectiveRadius"| SP44
    SP43 -->|"effectiveRadius"| SP45
    SP41 -->|"student coords"| SP44
    SP42 -->|"venue coords"| SP44
    SP44 -->|"distance (metres)"| SP45
    SP45 -->|"Outside boundary"| ERR_GEO
    ERR_GEO -->|"Failure screen"| Student
    SP45 -->|"Within boundary"| SP46
    SP46 -->|"Read session geofence params"| D4
    SP46 -->|"Server-side check passed"| OK
    SP46 -->|"Server-side check failed"| ERR_GEO
```

---

## 7. DFD Level 2 — Attendance Recording (Process 4 — Recording Sub-flow)

```mermaid
graph TD
    Student["🎓 Student"]
    D3[("D3: Enrolments")]
    D4[("D4: Sessions")]
    D5[("D5: Attendance Records")]
    P6["Process 6\n(WebSocket Gateway)"]

    SP47["4.7\nToken Format Check\n(begins with 'SA-' prefix)"]
    SP48["4.8\nActive Session Lookup\n(retrieve session by courseId\nfrom D4)"]
    SP49["4.9\nExpiry Check\n(startedAt + duration\n> current time?)"]
    SP410["4.10\nToken Validity Check\n(current token OR\nprevious token OR\ntimestamp within 90 s)"]
    SP411["4.11\nEnrolment Check\n(student enrolled\nin this course?)"]
    SP412["4.12\nDuplicate Check\n(attendance record\nalready exists?)"]
    SP413["4.13\nAttendance Persistence\n(write to D5:\nsessionId, studentId,\nmethod=QR_GPS,\ndistance, coords, timestamp)"]
    SP414["4.14\nEvent Emission\n(attendance:new\nwith student details)"]

    ERR_FMT["❌ Invalid token format"]
    ERR_SES["❌ No active session found"]
    ERR_EXP["❌ Session expired"]
    ERR_TOK["❌ Token expired or invalid"]
    ERR_ENR["❌ Not enrolled in course"]
    ERR_DUP["❌ Attendance already recorded"]
    OK["✅ Attendance Confirmed\n→ Return success to student"]

    Student -->|"Attendance Submission Request\n(token, courseId, GPS data)"| SP47
    SP47 -->|"Invalid prefix"| ERR_FMT
    SP47 -->|"Prefix valid"| SP48
    SP48 -->|"Read session"| D4
    SP48 -->|"No active session"| ERR_SES
    SP48 -->|"Session found"| SP49
    SP49 -->|"Duration elapsed"| ERR_EXP
    SP49 -->|"Within window"| SP410
    SP410 -->|"None match"| ERR_TOK
    SP410 -->|"Token accepted"| SP411
    SP411 -->|"Read enrolments"| D3
    SP411 -->|"Not enrolled"| ERR_ENR
    SP411 -->|"Enrolled"| SP412
    SP412 -->|"Check D5"| D5
    SP412 -->|"Duplicate found"| ERR_DUP
    SP412 -->|"No duplicate"| SP413
    SP413 -->|"Write record"| D5
    SP413 -->|"Record saved"| SP414
    SP414 -->|"attendance:new event"| P6
    SP414 --> OK
    OK -->|"Success Response"| Student
    ERR_FMT -->|"Error Response"| Student
    ERR_SES -->|"Error Response"| Student
    ERR_EXP -->|"Error Response"| Student
    ERR_TOK -->|"Error Response"| Student
    ERR_ENR -->|"Error Response"| Student
    ERR_DUP -->|"Error Response"| Student
```

---

## 8. Flowchart 1 — Student Attendance Registration

```mermaid
flowchart TD
    A([Start:\nPush notification received\n'Session has started']) --> B{Camera permission\ngranted?}
    B -- No --> C[Prompt user to enable\ncamera in device settings]
    C --> B
    B -- Yes --> D[Open QR Scanner Screen\nActivate device camera]
    D --> E[Point camera at\nlecturer's QR code]
    E --> F[Barcode scanner detects\nand decodes QR frame]
    F --> G{Decoded string begins\nwith 'SA-' prefix?}
    G -- No --> H[Show error:\n'Invalid QR Code'\nScanner remains active]
    H --> E
    G -- Yes --> I[Parse JSON payload:\ntoken, courseId,\nlecturer coords, accuracy,\ngeofence radius]
    I --> J[Call backend:\ncheck-attendance endpoint\nfor this session]
    J --> K{Already marked\nattendance?}
    K -- Yes --> L[Show: 'Attendance\nalready recorded']
    L --> Z2([End])
    K -- No --> M{Location permission\ngranted?}
    M -- No --> N[Show permission\nrequest dialog]
    N --> O{User grants\npermission?}
    O -- No --> P[Show: 'Location\naccess denied']
    P --> Z3([End])
    O -- Yes --> Q
    M -- Yes --> Q[Capture GPS position\nlat, lng, accuracy]
    Q --> R[Compute dynamic buffer:\nmin max lecAcc + stuAcc 20 100\neffectiveRadius = base + buffer]
    R --> S[Apply Haversine formula:\ncalculate distance to\nlecturer coordinates]
    S --> T{distance ≤\neffectiveRadius?}
    T -- No --> U[Show animated\n'Outside the venue'\nfailure screen]
    U --> Z4([End])
    T -- Yes --> V[Submit attendance request\nto backend:\ntoken, courseId, GPS data]
    V --> W{All server-side checks\npassed?\ntoken / enrolment /\nduplicate / geofence}
    W -- No --> X[Display server\nerror message]
    X --> Z5([End])
    W -- Yes --> Y[Backend creates\nattendance record\nin D5]
    Y --> AA[Display animated\nAttendance Confirmed screen:\ncourse name, date/time,\n'QR + GPS Verified' badge]
    AA --> Z([End])
```

---

## 9. Flowchart 2 — Lecturer Session Creation & QR Code Generation

```mermaid
flowchart TD
    A([Start:\nLecturer navigates to\n'Create Session' page]) --> B[Page initiates automatic GPS capture\n3 samples averaged via\nbrowser Geolocation API]
    B --> C{GPS capture succeeded\nwithin 30 seconds?}
    C -- No --> D[Show error:\nRetry or check\nlocation permissions]
    D --> B
    C -- Yes --> E{GPS accuracy\n≤ 200 metres?}
    E -- No --> F[Show warning:\n'Accuracy too low —\nwait or move location']
    F --> B
    E -- Yes --> G[System check panel confirms:\nbackend reachable ✓\nGPS ready ✓]
    G --> H[Lecturer selects course,\nsets duration,\nadjusts geofence radius]
    H --> I[Lecturer clicks\n'Start Session']
    I --> J[POST /api/sessions:\ncourseId, duration, radius,\nGPS coords, accuracy]
    J --> K{Backend: GPS coords\nstale? timestamp > 2 min?}
    K -- Yes --> L[Reject:\n'GPS data stale —\nplease recapture']
    L --> B
    K -- No --> M{Active session\nalready exists\nfor this course?}
    M -- Yes --> N[Reject:\n'Session already active']
    N --> H
    M -- No --> O[Backend generates QR token:\nSA-{timestamp}-{6 hex}\nPersist session in D4]
    O --> P[Broadcast\n'session:started'\nWebSocket event\nto course room]
    P --> Q[Dashboard navigates to\nActive Session Page\nQR code rendered via qrcode.react]
    Q --> R[Start 30-second\ncountdown timer]
    R --> S{Timer reaches zero?}
    S -- No --> T{Lecturer clicks\n'End Session'?}
    T -- No --> S
    S -- Yes --> U[Call PATCH\n/api/sessions/:id/refresh-qr]
    U --> V[Backend generates new token\nstores previous token in D4]
    V --> W[QR code on screen updates\nCountdown resets to 30 s]
    W --> R
    T -- Yes --> X[Show confirmation dialog:\n'End this session?']
    X --> Y{Lecturer confirms?}
    Y -- No --> R
    Y -- Yes --> Z[PATCH /api/sessions/:id/end]
    Z --> AA[Backend transitions\nsession → ENDED\nGenerates absence records\nfor non-attending students]
    AA --> AB[Broadcast\n'session:ended'\nWebSocket event]
    AB --> AC[Dashboard navigates to\nSession Summary Page]
    AC --> AD([End])
```

---

## 10. Flowchart 3 — User Login & Authentication

```mermaid
flowchart TD
    A([Start:\nUser opens Login screen\nStudent Mobile App or\nLecturer Web Dashboard]) --> B[Enter email address\nand password]
    B --> C{Client-side validation:\nAre both fields\nnon-empty?}
    C -- No --> D[Show inline validation message\nForm not submitted]
    D --> B
    C -- Yes --> E[POST /api/auth/login:\nemail + password]
    E --> F[Backend: look up user\nby email in D1]
    F --> G{User record\nfound?}
    G -- No --> H[Return: 'Invalid credentials'\nerror response]
    H --> B
    G -- Yes --> I[Backend: compare submitted\npassword vs stored hash\nusing bcrypt]
    I --> J{Password\nmatches?}
    J -- No --> H
    J -- Yes --> K[Backend generates JWT:\nsigned with server secret\ncontains userId + role\nexpires in 24 hours]
    K --> L[Return JWT\nin response body]
    L --> M{Which client?}
    M -- Student Mobile App --> N[Store JWT in\nexpo-secure-store\nhardware-backed secure enclave]
    M -- Lecturer Web Dashboard --> O[Store JWT in\nbrowser localStorage]
    N --> P[Call GET /api/auth/me\nto retrieve full user profile]
    O --> P
    P --> Q[Store user profile\nin authentication context]
    Q --> R{User role?}
    R -- STUDENT --> S[Navigate to\nHome Tab:\nEnrolled courses view]
    R -- LECTURER --> T[Navigate to\nDashboard Overview Page]
    S --> Z([End])
    T --> Z
```

---

## 11. Flowchart 4 — Report Generation

```mermaid
flowchart TD
    A([Start:\nLecturer navigates to\nReports Page]) --> B[Fetch all session records\nfor lecturer's courses\nfrom backend]
    B --> C[Compute aggregate KPI statistics:\n• Average attendance rate\n• Total sessions conducted\n• GPS verification percentage]
    C --> D[Display KPI cards\nat top of page]
    D --> E[Build attendance trend dataset:\ngroup sessions by date,\ncompute avg attendance rate\nper date]
    E --> F[Render recharts AreaChart:\ndate on X-axis,\navg attendance rate on Y-axis]
    F --> G{Lecturer applies\na filter?}
    G -- Yes --> H{Filter type?}
    H -- Course filter --> I[Re-query fetched data\nfor selected course]
    H -- Time period filter --> J[Re-query for:\nlast 7 days / 30 days /\nfull semester]
    I --> K[Recompute aggregate stats\nRe-render charts and tables\nwithout new network request]
    J --> K
    K --> G
    G -- No --> L[Build course performance table:\nper-course avg attendance rate,\ntotal sessions,\ntrend direction,\nminiature sparkline chart]
    L --> M[Compute flagged students list:\nstudents with attendance rate\n< 75% across all sessions]
    M --> N[Display flagged students:\nname, student ID,\ncourse code, attendance %]
    N --> O{Lecturer wants\nto export a session?}
    O -- Yes --> P[Lecturer navigates to\nHistory Page]
    P --> Q[Locate session row,\nclick download icon]
    Q --> R[Call session summary endpoint:\nreceive full attendance list]
    R --> S[Serialise data as\ncomma-separated values]
    S --> T[Trigger browser\nfile download]
    T --> Z([End])
    O -- No --> Z
```

---

## 12. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER {
        UUID id PK
        string email UK
        string fullName
        string passwordHash
        enum role "STUDENT | LECTURER"
        string studentId UK "nullable"
        string staffId "nullable"
        timestamp createdAt
        timestamp updatedAt
    }

    COURSE {
        UUID id PK
        string courseCode
        string courseName
        string joinCode UK
        string venue "nullable"
        string dayOfWeek "nullable"
        string startTime "nullable"
        string endTime "nullable"
        UUID lecturerId FK
        timestamp createdAt
        timestamp updatedAt
    }

    ENROLLMENT {
        UUID id PK
        UUID studentId FK
        UUID courseId FK
        timestamp enrolledAt
    }

    SESSION {
        UUID id PK
        UUID courseId FK
        string qrToken
        string previousQrToken "nullable"
        float lat "nullable"
        float lng "nullable"
        float lecturerAccuracy "nullable"
        int geofenceRadius "default 50"
        int duration "minutes"
        timestamp startedAt
        timestamp endedAt "nullable"
        enum status "ACTIVE | ENDED"
        timestamp createdAt
    }

    ATTENDANCE {
        UUID id PK
        UUID sessionId FK
        UUID studentId FK
        enum method "QR_GPS"
        float distance "nullable"
        float latitude "nullable"
        float longitude "nullable"
        float accuracy "nullable"
        timestamp markedAt
    }

    ABSENCE {
        UUID id PK
        UUID sessionId FK
        UUID studentId FK
        timestamp createdAt
    }

    USER ||--o{ COURSE : "creates (Lecturer)"
    USER ||--o{ ENROLLMENT : "enrolled via (Student)"
    COURSE ||--o{ ENROLLMENT : "has"
    COURSE ||--o{ SESSION : "has"
    SESSION ||--o{ ATTENDANCE : "generates"
    SESSION ||--o{ ABSENCE : "generates"
    USER ||--o{ ATTENDANCE : "recorded for (Student)"
    USER ||--o{ ABSENCE : "recorded for (Student)"
```

---

*End of Diagrams — Smart Attendance System*


Here are the three parts:

**Part 1 — QR Code Scanning**
```mermaid
flowchart LR
    A([Start:\nPush notification received\n'Session has started']) --> B{Camera permission\ngranted?}
    B -- No --> C[Prompt user to enable\ncamera in device settings]
    C --> B
    B -- Yes --> D[Open QR Scanner Screen\nActivate device camera]
    D --> E[Point camera at\nlecturer's QR code]
    E --> F[Barcode scanner detects\nand decodes QR frame]
    F --> G{Decoded string begins\nwith 'SA-' prefix?}
    G -- No --> H[Show error: 'Invalid QR Code'\nScanner remains active]
    H --> E
    G -- Yes --> I[Parse JSON payload:\ntoken, courseId,\nlecturer coords, accuracy,\ngeofence radius]
    I --> J[Call backend:\ncheck-attendance endpoint]
    J --> K{Already marked\nattendance?}
    K -- Yes --> L[Show: 'Attendance\nalready recorded']
    L --> Z1([End])
    K -- No --> CONT1(["▶ Continued in Part 2"])
```

---

**Part 2 — GPS Verification**
```mermaid
flowchart TD
    CONT1(["◀ Continued from Part 1"]) --> M{Location permission\ngranted?}
    M -- No --> N[Show permission\nrequest dialog]
    N --> O{User grants\npermission?}
    O -- No --> P[Show: 'Location access denied']
    P --> Z3([End])
    O -- Yes --> Q
    M -- Yes --> Q[Capture GPS position\nlat, lng, accuracy]
    Q --> R[Compute dynamic buffer:\nmin max lecAcc + stuAcc 20 100\neffectiveRadius = base + buffer]
    R --> S[Apply Haversine formula:\ncalculate distance to\nlecturer coordinates]
    S --> T{distance ≤\neffectiveRadius?}
    T -- No --> U[Show animated\n'Outside the venue'\nfailure screen]
    U --> Z4([End])
    T -- Yes --> CONT2(["▶ Continued in Part 3"])
```

---

**Part 3 — Server Validation & Confirmation**
```mermaid
flowchart TD
    CONT2(["◀ Continued from Part 2"]) --> V[Submit attendance request\nto backend:\ntoken, courseId, GPS data]
    V --> W{All server-side checks\npassed?\ntoken / enrolment /\nduplicate / geofence}
    W -- No --> X[Display server\nerror message]
    X --> Z5([End])
    W -- Yes --> Y[Backend creates\nattendance record in D5]
    Y --> AA[Display animated\nAttendance Confirmed screen:\ncourse name, date/time,\n'QR + GPS Verified' badge]
    AA --> Z([End])
```