/*
  Warnings:

  - You are about to drop the column `status` on the `driver_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "driver_profile" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "sessionVersion" SET DEFAULT 1;
