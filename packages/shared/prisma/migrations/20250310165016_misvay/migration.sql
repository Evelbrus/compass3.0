/*
  Warnings:

  - You are about to drop the column `userId` on the `notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification" DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT;
