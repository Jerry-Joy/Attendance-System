I have already built a Smart Attendance System and I need help implementing
the blockchain component.

CURRENT ARCHITECTURE
- Lecturer Web App: React (Vite)
- Student Mobile App: React Native (Expo)
- Backend: NestJS
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT
- Real-time communication: Socket.IO

The attendance workflow is already fully implemented and working:
1. Lecturer creates a course.
2. Students join using a join code.
3. Lecturer starts an attendance session.
4. Lecturer GPS coordinates are captured.
5. A dynamic QR code is generated and refreshes every 30 seconds.
6. Students receive a session notification.
7. Students scan the QR code.
8. Student GPS location is verified against the lecturer's location via geofencing.
9. Backend performs final verification: active session check, QR token
   validation, enrollment verification, duplicate attendance check,
   server-side GPS verification.
10. Attendance is stored in PostgreSQL.

The system currently works without blockchain. I now want to add blockchain
as an immutable audit layer for tamper detection — NOT as a replacement for
the existing logic.

HARD CONSTRAINTS
- Use Solidity smart contracts.
- Use Ethereum Sepolia Testnet only. Never deploy to or interact with mainnet.
  If any script could touch mainnet, ask for explicit confirmation first.
- Use MetaMask for wallet creation/management during development.
- Use Ethers.js for all backend-to-blockchain interaction.
- The backend is the ONLY component that talks to the blockchain. The
  lecturer app and student app must never call the contract or hold a wallet.
- Blockchain is an audit layer only — it never gates whether attendance is
  accepted. PostgreSQL remains the single source of truth for attendance.
- Attendance must be recorded successfully even if the blockchain is down,
  slow, or the transaction fails. Blockchain anchoring must never block,
  delay, or fail the student-facing attendance response.
- Anchoring must happen ASYNCHRONOUSLY, after the success response has
  already been sent to the student.
- The backend's wallet private key must be loaded from environment
  variables only — never hardcoded, never logged, never committed.
- Do not modify the existing GPS, QR, or session logic. Only add new
  blockchain-related files and the specific integration point in
  attendance.service.ts.
- If anything below is ambiguous, ask me before generating code rather than
  guessing.

DESIRED FLOW
1. Student successfully marks attendance (existing flow, unchanged).
2. Attendance record is stored in PostgreSQL as it is today; the student
   immediately receives their success response.
3. In the background, the backend builds a canonical, deterministic string
   from fixed fields in a fixed order — e.g.
   `${attendanceId}|${sessionId}|${studentId}|${timestamp}|${distance}` —
   and computes a SHA-256 hash of that string. Document the exact format
   used, since verification later depends on reproducing it exactly.
4. Backend sends the hash to the AttendanceLedger smart contract on Sepolia.
5. Smart contract stores the proof and emits an event.
6. Backend receives the transaction hash and block number.
7. These, plus a blockchainStatus, are saved back onto the PostgreSQL record.
8. If the transaction fails or times out, the record is marked FAILED (not
   left in limbo), and a scheduled retry job (same pattern as an existing
   cron-based scheduler in this codebase) periodically retries any record
   that is PENDING or FAILED.
9. Later, an admin/lecturer can request verification of any record: the
   backend recomputes the hash from current Postgres data using the same
   canonical format and compares it to what's stored on-chain.

CONCURRENCY HANDLING
Multiple students may mark attendance within seconds of each other, all
using the same backend wallet. Handle nonce management explicitly — e.g. a
queue that serializes outgoing transactions — so simultaneous anchoring
attempts don't collide or silently fail.

ATTENDANCE TABLE CHANGES (Prisma)
Add to the Attendance model:
- attendanceHash    (string)
- transactionHash   (string, nullable)
- blockNumber       (int, nullable)
- blockchainStatus  (enum: PENDING, CONFIRMED, FAILED)
Provide the actual Prisma migration, not just the schema diff.

SMART CONTRACT REQUIREMENTS
Contract name: AttendanceLedger
- Store attendance proofs on-chain, keyed by attendanceId.
- Record per entry: attendanceId, sessionId, attendanceHash, timestamp.
- Reject any attempt to overwrite an existing entry for the same attendanceId.
- Restrict write access to the contract owner (the backend's wallet) only.
- Emit an AttendanceRecorded event on every successful write.
- Include: recordAttendance(), getAttendanceProof(), and a verify-style view
  function that checks a given hash against what's stored.
- Include a Hardhat test suite covering: normal anchoring, duplicate
  rejection, non-owner rejection, and hash verification (match + mismatch).

PROJECT STRUCTURE
smart-attendance-system/
├── lecturer-app/
├── student-app/
├── backend/
└── contracts/
    ├── AttendanceLedger.sol
    ├── hardhat.config.js
    ├── scripts/deploy.js
    └── test/

WHAT I NEED FROM YOU
1. The complete blockchain architecture, including how async anchoring and
   retries fit around the existing system.
2. The Solidity smart contract, with tests.
3. The Prisma schema + migration changes.
4. A clear explanation of the database-to-blockchain workflow, including
   exactly what gets hashed and how.
5. Hardhat setup and deployment scripts for Sepolia.
6. A NestJS BlockchainModule/BlockchainService, including nonce/queue
   handling for concurrent transactions and secure key loading from env vars.
7. The scheduled retry job for PENDING/FAILED records.
8. The exact change to attendance.service.ts that triggers anchoring after
   attendance is created, without delaying the student's response.
9. A verification endpoint (e.g. GET /api/attendance/:id/verify) and an
   explanation of how it detects tampering.
10. Notes on security, scalability, and clean architecture trade-offs you made.

The blockchain module must be isolated from the attendance module through a service interface.

AttendanceService should not contain Ethers.js logic directly.

Instead:

AttendanceService
   ↓
BlockchainService
   ↓
Ethers.js
   ↓
Smart Contract