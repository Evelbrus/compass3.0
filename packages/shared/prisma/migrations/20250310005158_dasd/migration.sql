/*
  Warnings:

  - You are about to drop the column `action` on the `notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification" DROP COLUMN "action";

-- DropEnum
DROP TYPE "Action";
