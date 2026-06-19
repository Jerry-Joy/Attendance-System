// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * AttendanceLedger — immutable audit layer for the Smart Attendance System.
 *
 * Only the contract owner (the backend wallet) may write records.
 * Records are keyed by attendanceId (a UUID string from PostgreSQL).
 * Once written, a record can never be overwritten.
 *
 * Hash format (SHA-256 of the canonical pipe-delimited string):
 *   "${attendanceId}|${sessionId}|${studentId}|${markedAt.toISOString()}|${distance ?? 'null'}"
 */
contract AttendanceLedger {
    address public immutable owner;

    struct AttendanceProof {
        string  attendanceId;
        string  sessionId;
        bytes32 attendanceHash; // SHA-256 digest stored as bytes32
        uint256 timestamp;      // block.timestamp at recording time
        bool    exists;
    }

    // attendanceId (UUID) => proof
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

    /**
     * Record an attendance proof on-chain.
     * @param attendanceId  UUID of the Postgres Attendance row
     * @param sessionId     UUID of the Postgres Session row
     * @param attendanceHash SHA-256 hash of the canonical attendance string (bytes32)
     */
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

    /**
     * Retrieve a stored proof. Reverts if the record does not exist.
     */
    function getAttendanceProof(string calldata attendanceId)
        external
        view
        returns (
            string  memory retAttendanceId,
            string  memory retSessionId,
            bytes32        retHash,
            uint256        retTimestamp
        )
    {
        AttendanceProof storage proof = proofs[attendanceId];
        require(proof.exists, "AttendanceLedger: record not found");
        return (proof.attendanceId, proof.sessionId, proof.attendanceHash, proof.timestamp);
    }

    /**
     * Verify that a given hash matches the stored on-chain proof.
     * Returns false (not reverts) when the record does not exist, so callers
     * can distinguish "not anchored yet" from "tampered".
     */
    function verifyAttendance(string calldata attendanceId, bytes32 hashToCheck)
        external
        view
        returns (bool matches, bool exists_)
    {
        AttendanceProof storage proof = proofs[attendanceId];
        if (!proof.exists) return (false, false);
        return (proof.attendanceHash == hashToCheck, true);
    }
}
