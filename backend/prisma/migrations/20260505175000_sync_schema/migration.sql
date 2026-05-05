-- Baseline sync migration for existing production drift.
-- This migration reflects changes already present in the database.

-- Remove QR_ONLY from VerificationMethod enum.
ALTER TYPE "VerificationMethod" RENAME TO "VerificationMethod_old";
CREATE TYPE "VerificationMethod" AS ENUM ('QR_GPS');
ALTER TABLE "Attendance"
  ALTER COLUMN "method" TYPE "VerificationMethod"
  USING ("method"::text::"VerificationMethod");
DROP TYPE "VerificationMethod_old";

-- Add previousQrToken column to Session.
ALTER TABLE "Session" ADD COLUMN "previousQrToken" TEXT;
