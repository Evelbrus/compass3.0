/*
  Warnings:

  - The values [taken] on the enum `DriverAcceptanceStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DriverAcceptanceStatus_new" AS ENUM ('pending', 'notified', 'accepted', 'on_the_way', 'arrived', 'picked_up', 'timeout', 'completed', 'rejected', 'cancelled');
ALTER TABLE "orders" ALTER COLUMN "driver_acceptance_status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "driver_acceptance_status" TYPE "DriverAcceptanceStatus_new" USING ("driver_acceptance_status"::text::"DriverAcceptanceStatus_new");
ALTER TYPE "DriverAcceptanceStatus" RENAME TO "DriverAcceptanceStatus_old";
ALTER TYPE "DriverAcceptanceStatus_new" RENAME TO "DriverAcceptanceStatus";
DROP TYPE "DriverAcceptanceStatus_old";
ALTER TABLE "orders" ALTER COLUMN "driver_acceptance_status" SET DEFAULT 'pending';
COMMIT;
