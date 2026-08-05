# FORMATTING GUIDE FOR SUBMISSION (DO NOT INCLUDE IN FINAL DOCUMENT)
<!-- 
GCTU Thesis formatting requirements:
- Typeface: 12-point Times New Roman (in MS Word or LaTeX)
- Spacing: 1.5 Line Spacing

Instructions to transfer to MS Word:
1. Copy the text below (starting from "CHAPTER FOUR").
2. Paste into MS Word.
3. Select all text, set Font to "Times New Roman" and Font Size to "12".
4. Set paragraph Line Spacing to "1.5".

Replace image placeholders [Figure 4.x] with actual screenshots of your running application.
-->

---

## CHAPTER FOUR: SYSTEM IMPLEMENTATION

### 4.1 Introduction
This chapter details the system implementation phase of the Smart Attendance System designed for Ghana Communication Technology University (GCTU). It describes the translation of the system specification and architectural models defined in Chapter Three into fully functional modules. Specifically, this section outlines the development and deployment environments, the relational database instantiation using Prisma and PostgreSQL, the implementation of core program logic and algorithms (including dynamic QR code generation, GPS geofencing, and WebSocket real-time updates), the smart contract execution on the Sepolia Ethereum testnet, and the concrete implementation of the student mobile application and lecturer web dashboard. 

---

### 4.2 Development and Deployment Environment
The development environment was configured to sustain concurrent engineering across the three core tiers of the application: the mobile frontend, the web dashboard, and the database-supported NestJS backend. 

#### 4.2.1 Hardware and Software Specifications
To ensure system stability, build repeatability, and proper emulation, the development and testing nodes were aligned to the specifications described in Table 4.1:

**Table 4.1: Implementation Environment Specifications**

| Component | Specification / Version |
| :--- | :--- |
| **Development Machine OS** | Windows 11 Professional (64-bit) |
| **Runtime Environment** | Node.js v20.11.0 (LTS) / npm v10.2.4 |
| **Backend Framework** | NestJS v10.3.0 (TypeScript-first framework) |
| **Database Engine** | PostgreSQL v16.1 relational database server |
| **ORM & Schema Migrator** | Prisma ORM v5.10.2 |
| **Student App Framework** | React Native v0.73.4 / Expo SDK v50.0.0 |
| **Lecturer Dashboard Tool** | React v18.2.0 / Vite v5.1.0 |
| **Smart Contract Pipeline** | Hardhat v2.20.1 / Solidity v0.8.24 / Ethers.js v6.11.1 |
| **Network Node Provider** | Infura JSON-RPC Sepolia endpoint |

#### 4.2.2 Backend Environment Configuration (`.env`)
Security and environment separation were enforced using standard configuration patterns. Secrets, keys, and connection strings are excluded from the codebase and loaded at runtime via a root `.env` configuration file, structured as shown in Listing 4.1:

```ini
# Database configuration
DATABASE_URL="postgresql://postgres:user_password@localhost:5432/attendance_db?schema=public"

# Authentication config
JWT_SECRET="gctu_jwt_cryptographic_secure_secret_key_2026"

# Blockchain Sepolia network configuration
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/your_infura_project_id"
BLOCKCHAIN_WALLET_PRIVATE_KEY="0x_your_sepolia_wallet_private_key"
CONTRACT_ADDRESS="0x_deployed_ledger_smart_contract_address"
```
**Listing 4.1: Environment configuration properties**

---

### 4.3 Database Implementation
The system utilizes PostgreSQL as its primary relational store. Data modeling, migrations, and typed querying are managed programmatically via the Prisma Object-Relational Mapping (ORM) layer.

#### 4.3.1 Relational Schema Generation
The declarative database schema is defined in the `schema.prisma` file. It maps the conceptual entity model into physical PostgreSQL tables, specifying relationships, constraints, indices, and deletion rules. Listing 4.2 showcases the relational definitions for the `Attendance` and `Absence` entities, highlighting the unique database constraints that prevent double check-in states:

```prisma
model Attendance {
  id               String            @id @default(uuid())
  method           VerificationMethod
  distance         Float?             // distance from lecturer coordinates
  markedAt         DateTime          @default(now())

  // Blockchain audit fields
  attendanceHash   String?
  transactionHash  String?
  blockNumber      Int?
  blockchainStatus BlockchainStatus  @default(PENDING)

  // Relations
  session   Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId String
  student   User    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  studentId String

  @@unique([sessionId, studentId]) // Enforces singular attendance entry per student-session
}

model Absence {
  id        String   @id @default(uuid())
  markedAt  DateTime @default(now())

  // Relations
  session   Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId String
  student   User    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  studentId String

  @@unique([sessionId, studentId]) // Prevents duplicate absence records
}
```
**Listing 4.2: Prisma implementation of the Attendance and Absence relational models**

To preserve relational integrity under record updates, a `Cascade` deletion policy (`onDelete: Cascade`) is applied. Consequently, deleting a `Session` record automatically purges all child `Attendance` and `Absence` rows, preventing orphan database entries. Database queries are executed with indexes automatically assigned to unique constraint columns, yielding efficient index-scans for validation lookups.

---

### 4.4 Core Program Logic & Algorithms

#### 4.4.1 Dynamic QR Code Token Generation & Rotation
To mitigate proxy attendance fraud (where a student shares a photo of a code), the lecturer application rotates the active QR token every 30 seconds. The token encodes the current timestamp and a random hash component: `SA-[timestamp]-[random_hash]`.

The backend implementation accepts a scan request if the token matches the current database token, the immediately preceding token (to account for network latency in the final seconds of a rotation), or if the token was generated within the last 90 seconds. Listing 4.3 shows the verification code implemented in the `AttendanceService`:

```typescript
// Validate QR token: check current, previous, or timestamp drift within 90 seconds
const tokenMatchesCurrent = session.qrToken === dto.token;
const tokenMatchesPrevious = session.previousQrToken != null && session.previousQrToken === dto.token;

let tokenRecent = false;
const tokenTimestampMatch = dto.token.match(/^SA-(\d+)-[0-9a-f]{6}$/);
if (tokenTimestampMatch) {
  const tokenIssuedAt = parseInt(tokenTimestampMatch[1], 10) * 1000;
  tokenRecent = Date.now() - tokenIssuedAt <= 90_000;
}

const tokenValid = tokenMatchesCurrent || tokenMatchesPrevious || tokenRecent;
if (!tokenValid) {
  throw new BadRequestException('Invalid or expired QR token');
}
```
**Listing 4.3: Multi-window token validation algorithm**

---

#### 4.4.2 GPS Geofencing and Distance Calculation
Proximity verification relies on the Great-Circle distance formula, implemented via the Haversine algorithm, using an Earth radius constant of 6,371,000 meters. The calculation determines the physical distance between the student's mobile device and the coordinates captured from the lecturer's device during session initialization. Listing 4.4 shows the execution structure:

```typescript
const EARTH_RADIUS = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}
```
**Listing 4.4: Haversine distance calculation logic**

To accommodate hardware-level GPS inaccuracies, the server calculates an effective geofence radius. The configured base radius is augmented by a dynamic accuracy buffer, constrained between 20 meters and 100 meters:
$$\text{Buffer} = \min(\max(\text{Lecturer Accuracy} + \text{Student Accuracy}, 20), 100)$$
$$\text{Effective Radius} = \text{Base Radius} + \text{Buffer}$$

---

#### 4.4.3 Real-Time WebSocket Synchronization Gateway
Real-time state distribution is built on WebSockets using Socket.IO. The implementation establishes two separate communication channels:
1. **Course Rooms (`course:${courseId}`):** Students register to receive alerts when a lecturer begins a session.
2. **Session Rooms (`session:${sessionId}`):** Lecturers join these to listen for live check-in events (`attendance:new`) and emit rotated QR tokens (`session:qr-refreshed`) to active client scanners.

Handshake authorization is verified via `JwtService` using the shared backend secret token. Clients lacking valid authentication parameters are disconnected.

---

#### 4.4.4 Concurrency Control & Blockchain Serialization Queue
A major technical challenge in decentralized ledger synchronization is the prevention of Ethereum transaction nonce collisions. When multiple students mark attendance simultaneously, concurrent backend transactions dispatched using the same wallet address will fail if the system does not serialize transaction nonces. 

To resolve this, the system implements a serialized transaction queue with a locking state within `BlockchainService`, as shown in Listing 4.5:

```typescript
@Injectable()
export class BlockchainService implements OnModuleInit {
  private queue: QueueItem[] = [];
  private processing = false;

  enqueueAnchor(
    attendanceId: string,
    sessionId: string,
    studentId: string,
    markedAt: Date,
    distance: number | null,
  ): Promise<AnchorResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ attendanceId, sessionId, studentId, markedAt, distance, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      try {
        const result = await this.sendTransaction(item);
        item.resolve(result);
      } catch (err) {
        item.reject(err);
      }
    }
    this.processing = false;
  }
}
```
**Listing 4.5: Queue serialization mechanism preventing transaction nonce collision**

This design decouples the user-facing database save from the blockchain write. The student receives an immediate HTTP 201 response after the PostgreSQL record is confirmed. The blockchain anchoring runs asynchronously, preserving web server responsiveness.

---

### 4.5 Smart Contract Deployment on Sepolia Testnet
The security layer anchors attendance logs on the Ethereum Sepolia Testnet, securing records against local database manipulation.

#### 4.5.1 Solidity Smart Contract Specification
The smart contract `AttendanceLedger.sol` stores attendance proof structures. It utilizes a mapping where keys are the attendance UUIDs from PostgreSQL. Listing 4.6 presents the contract implementation:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AttendanceLedger {
    address public immutable owner;

    struct AttendanceProof {
        string  attendanceId;
        string  sessionId;
        bytes32 attendanceHash; // SHA-256 canonical digest stored as bytes32
        uint256 timestamp;      // block.timestamp at recording time
        bool    exists;
    }

    mapping(string => AttendanceProof) private proofs;

    event AttendanceRecorded(
        string  indexed attendanceId,
        string  indexed sessionId,
        bytes32         attendanceHash,
        uint256         timestamp
    );

    error NotOwner();
    error AlreadyRecorded(string attendanceId);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function recordAttendance(
        string  calldata attendanceId,
        string  calldata sessionId,
        bytes32          attendanceHash
    ) external onlyOwner {
        if (proofs[attendanceId].exists) revert AlreadyRecorded(attendanceId);

        proofs[attendanceId] = AttendanceProof({
            attendanceId:   attendanceId,
            sessionId:      sessionId,
            attendanceHash: attendanceHash,
            timestamp:      block.timestamp,
            exists:         true
        });

        emit AttendanceRecorded(attendanceId, sessionId, attendanceHash, block.timestamp);
    }
}
```
**Listing 4.6: AttendanceLedger smart contract implementation**

#### 4.5.2 Contract Hashing Architecture
The backend calculates the SHA-256 cryptographic digest of the attendance properties using a pipe-delimited format:
$$\text{Hash} = \text{SHA256}(\text{attendanceId} \parallel "|" \parallel \text{sessionId} \parallel "|" \parallel \text{studentId} \parallel "|" \parallel \text{markedAt} \parallel "|" \parallel \text{distance})$$
This digest is submitted as `bytes32`, yielding compact gas costs during write execution.

#### 4.5.3 Sepolia Network Deployment Setup
Deployment was coordinated through Hardhat. Compilation artifacts (ABI and bytecode) were compiled with optimizer configurations (200 runs). Listing 4.7 details the network configurations:

```javascript
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.BLOCKCHAIN_WALLET_PRIVATE_KEY ? [process.env.BLOCKCHAIN_WALLET_PRIVATE_KEY] : [],
      chainId: 11155111
    }
  }
};
```
**Listing 4.7: Hardhat configuration for Sepolia Testnet**

The deployment transaction on Sepolia confirmed the contract creation, exposing the public address for transaction routing.

---

### 4.6 User Interface Realization & Flow
The system presentation tier was built utilizing React Native (Expo) for students and Vite React for lecturers, using consistent components.

#### 4.6.1 System Architectural Deployment
The runtime mapping is illustrated in the deployment model in Figure 4.1:

```mermaid
graph TD
    subgraph Client Tier
        studentApp[Expo Student App]
        lecturerApp[React Web Dashboard]
    end
    
    subgraph Application Tier
        apiServer[NestJS API Server]
        wsGateway[Events WebSocket Gateway]
    end
    
    subgraph Data & Audit Tier
        postgres[(PostgreSQL Database)]
        sepolia[Sepolia Ethereum Testnet]
    end
    
    studentApp -->|HTTP REST / JWT| apiServer
    studentApp <-->|WebSockets Socket.IO| wsGateway
    lecturerApp -->|HTTP REST / JWT| apiServer
    lecturerApp <-->|WebSockets Socket.IO| wsGateway
    
    apiServer -->|Prisma Client| postgres
    apiServer -->|Ethers.js JSON-RPC| sepolia
```
**Figure 4.1: System Architecture Deployment Flow**
*(Use standard flowchart diagram block matching this topology in your final documentation submission)*

---

#### 4.6.2 Student Mobile Application UI flow
The student mobile application screen transitions proceed as follows:
1. **Camera Scanner View:** Uses the camera sensor to locate, lock on, and decode the lecturer's rotated QR token.
2. **GPS Verification Loader:** Triggers a radar-pulse interface while calling geolocation APIs to capture coordinates and calculate the Haversine distance.
3. **Attendance Confirmation Panel:** Displays check-in metadata, the computed distance, and a success checkmark.

```
+-------------------------------------------------------------+
|                                                             |
|           [ Insert Student Mobile Application UI ]          |
|                                                             |
|   Include screenshots of:                                    |
|   1. Camera QR Scanner Screen (scanning the QR code)        |
|   2. GPS Verification Screen (radar animation loading)       |
|   3. Attendance Confirmed Screen (success checkmark state)   |
|                                                             |
|   Figure 4.2: Student Mobile Interface Flow                 |
+-------------------------------------------------------------+
```

---

#### 4.6.3 Lecturer Web Portal Dashboard UI flow
The lecturer dashboard coordinates administrative actions:
1. **Create Session Setup:** Captures lecturer geolocation coordinates, allowing the user to select courses and session duration.
2. **Live Session Monitor:** Shows the live, dynamic QR code (updating every 30 seconds) alongside a real-time list of present students.
3. **Blockchain Ledger Review:** Displays check-ins, listing transaction hashes and blocks on Etherscan.

```
+-------------------------------------------------------------+
|                                                             |
|             [ Insert Lecturer Web Portal UI ]               |
|                                                             |
|   Include screenshots of:                                    |
|   1. Session Creation Screen (selecting class and geofence)  |
|   2. Live Session Screen (showing rotating QR code)          |
|   3. Blockchain Ledger view (with transaction hashes)        |
|                                                             |
|   Figure 4.3: Lecturer Dashboard Interfaces                 |
+-------------------------------------------------------------+
```

```
+-------------------------------------------------------------+
|                                                             |
|             [ Insert Sepolia Etherscan Proof ]              |
|                                                             |
|   Include screenshot of:                                    |
|   - An Etherscan transaction view showing a successful write|
|     transaction to your deployed smart contract.            |
|                                                             |
|   Figure 4.4: Etherscan Transaction Verification            |
+-------------------------------------------------------------+
```

---

### 4.7 Chapter Summary
This chapter detailed the physical implementation of the GCTU Smart Attendance System. PostgreSQL database models were successfully realized through the Prisma ORM. Crucial operations—such as dynamic token rotation to block proxy check-ins, Haversine computations for geofence validation, and Socket.IO configurations for live tracking—were detailed with code representations. To ensure transaction reliability, a custom serialized database queue was implemented to address Ethereum nonce conflicts. Finally, the chapter analyzed the Solidity smart contract configurations deployed to the Sepolia Ethereum testnet, concluding with user interface flows for the web and mobile portals. The next chapter presents the project conclusions and recommendations for GCTU.
