/*
  Warnings:

  - Changed the type of `passport_id` on the `driver_profile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "driver_profile" DROP COLUMN "passport_id",
ADD COLUMN     "passport_id" BIGINT NOT NULL;
