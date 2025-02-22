/*
  Warnings:

  - The values [offline] on the enum `DriverStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DriverStatus_new" AS ENUM ('free', 'busy', 'on_break');
ALTER TABLE "users" ALTER COLUMN "driver_status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "driver_status" TYPE "DriverStatus_new" USING ("driver_status"::text::"DriverStatus_new");
ALTER TYPE "DriverStatus" RENAME TO "DriverStatus_old";
ALTER TYPE "DriverStatus_new" RENAME TO "DriverStatus";
DROP TYPE "DriverStatus_old";
ALTER TABLE "users" ALTER COLUMN "driver_status" SET DEFAULT 'free';
COMMIT;

-- AlterTable
ALTER TABLE "notification" ALTER COLUMN "userId" DROP NOT NULL;
