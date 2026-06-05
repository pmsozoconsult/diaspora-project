-- Migrate legacy POA status before enum change
UPDATE "PoaCase" SET status = 'REGISTERED_IN_ETHIOPIA' WHERE status::text = 'IN_PROGRESS';

-- PostgreSQL: add new enum values (Prisma db push may handle this; run if needed)
ALTER TYPE "PoaStatus" ADD VALUE IF NOT EXISTS 'MOFA_SUBMITTED';
ALTER TYPE "PoaStatus" ADD VALUE IF NOT EXISTS 'REGISTERED_IN_ETHIOPIA';
