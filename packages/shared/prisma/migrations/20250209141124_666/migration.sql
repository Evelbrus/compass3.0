-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DriverAcceptanceStatus" ADD VALUE 'TAKEN';
ALTER TYPE "DriverAcceptanceStatus" ADD VALUE 'ON_THE_WAY';
ALTER TYPE "DriverAcceptanceStatus" ADD VALUE 'ARRIVED';
ALTER TYPE "DriverAcceptanceStatus" ADD VALUE 'PICKED_UP';
ALTER TYPE "DriverAcceptanceStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "DriverAcceptanceStatus" ADD VALUE 'CANCELED';

-- AlterTable
ALTER TABLE "driver_order_notifications" ADD COLUMN     "status" "DriverAcceptanceStatus" NOT NULL DEFAULT 'PENDING';
