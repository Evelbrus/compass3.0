-- CreateEnum
CREATE TYPE "Ownership" AS ENUM ('personal', 'fleet');

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "ownership" "Ownership" NOT NULL DEFAULT 'personal';
