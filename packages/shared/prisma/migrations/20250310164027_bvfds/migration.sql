/*
  Warnings:

  - You are about to drop the column `clientById` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `driverById` on the `notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification" DROP COLUMN "clientById",
DROP COLUMN "driverById",
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "driverId" TEXT;
