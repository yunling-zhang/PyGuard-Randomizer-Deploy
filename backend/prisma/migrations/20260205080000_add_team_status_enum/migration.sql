-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('UNPRESENTED', 'CURRENTLY_SELECTED', 'PRESENTED');

-- Add new status column with default value
ALTER TABLE "teams" ADD COLUMN "status" "TeamStatus" NOT NULL DEFAULT 'UNPRESENTED';

-- Migrate existing data: if presented=true, set status='PRESENTED', else 'UNPRESENTED'
UPDATE "teams" SET "status" = 'PRESENTED' WHERE "presented" = true;
UPDATE "teams" SET "status" = 'UNPRESENTED' WHERE "presented" = false;

-- Drop the old presented column
ALTER TABLE "teams" DROP COLUMN "presented";
