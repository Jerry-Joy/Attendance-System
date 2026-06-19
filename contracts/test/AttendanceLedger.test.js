const { expect } = require("chai");
const { ethers } = require("hardhat");

// Mirrors the backend's canonical hash format exactly:
// "${attendanceId}|${sessionId}|${studentId}|${markedAt.toISOString()}|${distance ?? 'null'}"
function makeHash(attendanceId, sessionId, studentId, markedAt, distance) {
  const distStr = distance === null || distance === undefined ? "null" : String(distance);
  const canonical = `${attendanceId}|${sessionId}|${studentId}|${markedAt}|${distStr}`;
  return ethers.id(canonical); // ethers.id = keccak256 of UTF-8, used here as stand-in; see note below
}

// NOTE: The backend uses SHA-256 (Node crypto), not keccak256. For the unit tests
// we test the contract's storage and comparison logic — the hash value itself is an
// opaque bytes32, so the test helper just needs to produce a consistent bytes32.
// Integration tests against a live node should use the exact SHA-256 from the backend.

describe("AttendanceLedger", function () {
  let contract;
  let owner;
  let nonOwner;

  const ATTENDANCE_ID = "aaa-111-bbb-222";
  const SESSION_ID    = "sess-abc-123";
  const STUDENT_ID    = "student-xyz-456";
  const MARKED_AT     = "2026-06-19T10:00:00.000Z";
  const DISTANCE      = "42.5";

  let HASH;

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("AttendanceLedger");
    contract = await Factory.deploy();
    HASH = makeHash(ATTENDANCE_ID, SESSION_ID, STUDENT_ID, MARKED_AT, DISTANCE);
  });

  // ── Normal anchoring ──────────────────────────────────────────────────────

  it("owner can record an attendance proof", async function () {
    const tx = await contract.recordAttendance(ATTENDANCE_ID, SESSION_ID, HASH);
    const receipt = await tx.wait();

    // Event emitted
    const event = receipt.logs.find(
      (l) => l.fragment && l.fragment.name === "AttendanceRecorded"
    );
    expect(event).to.not.be.undefined;
  });

  it("getAttendanceProof returns the stored data", async function () {
    await contract.recordAttendance(ATTENDANCE_ID, SESSION_ID, HASH);
    const [retId, retSession, retHash] = await contract.getAttendanceProof(ATTENDANCE_ID);
    expect(retId).to.equal(ATTENDANCE_ID);
    expect(retSession).to.equal(SESSION_ID);
    expect(retHash).to.equal(HASH);
  });

  // ── Duplicate rejection ───────────────────────────────────────────────────

  it("reverts on duplicate attendanceId", async function () {
    await contract.recordAttendance(ATTENDANCE_ID, SESSION_ID, HASH);
    await expect(
      contract.recordAttendance(ATTENDANCE_ID, SESSION_ID, HASH)
    ).to.be.revertedWithCustomError(contract, "AlreadyRecorded");
  });

  // ── Non-owner rejection ───────────────────────────────────────────────────

  it("reverts when a non-owner tries to record", async function () {
    await expect(
      contract.connect(nonOwner).recordAttendance(ATTENDANCE_ID, SESSION_ID, HASH)
    ).to.be.revertedWithCustomError(contract, "NotOwner");
  });

  // ── Hash verification ─────────────────────────────────────────────────────

  it("verifyAttendance returns (true, true) for a matching hash", async function () {
    await contract.recordAttendance(ATTENDANCE_ID, SESSION_ID, HASH);
    const [matches, exists] = await contract.verifyAttendance(ATTENDANCE_ID, HASH);
    expect(matches).to.be.true;
    expect(exists).to.be.true;
  });

  it("verifyAttendance returns (false, true) for a mismatched hash", async function () {
    await contract.recordAttendance(ATTENDANCE_ID, SESSION_ID, HASH);
    const wrongHash = ethers.id("completely-wrong-data");
    const [matches, exists] = await contract.verifyAttendance(ATTENDANCE_ID, wrongHash);
    expect(matches).to.be.false;
    expect(exists).to.be.true;
  });

  it("verifyAttendance returns (false, false) when no record exists", async function () {
    const [matches, exists] = await contract.verifyAttendance("nonexistent-id", HASH);
    expect(matches).to.be.false;
    expect(exists).to.be.false;
  });

  it("getAttendanceProof reverts when record does not exist", async function () {
    await expect(
      contract.getAttendanceProof("nonexistent-id")
    ).to.be.revertedWith("AttendanceLedger: record not found");
  });

  // ── Owner immutability ────────────────────────────────────────────────────

  it("owner is set to deployer address", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });
});
