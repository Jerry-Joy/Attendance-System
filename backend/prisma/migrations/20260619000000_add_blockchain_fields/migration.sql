-- Migration: add blockchain audit fields to Attendance
-- Generated for: 20260619000000_add_blockchain_fields

-- Create the BlockchainStatus enum
CREATE TYPE "BlockchainStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- Add blockchain columns to Attendance
ALTER TABLE "Attendance"
  ADD COLUMN "attendanceHash"   TEXT,
  ADD COLUMN "transactionHash"  TEXT,
  ADD COLUMN "blockNumber"      INTEGER,
  ADD COLUMN "blockchainStatus" "BlockchainStatus" NOT NULL DEFAULT 'PENDING';
