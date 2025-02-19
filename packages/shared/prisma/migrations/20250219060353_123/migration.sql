/*
  Warnings:

  - You are about to drop the column `partnerSalaryUuid` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_partnerSalaryUuid_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "partnerSalaryUuid",
ADD COLUMN     "partnerSalaryId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_partnerSalaryId_fkey" FOREIGN KEY ("partnerSalaryId") REFERENCES "partner_salaries"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
