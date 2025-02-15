/*
  Warnings:

  - The `account_number` column on the `driver_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `card_number` column on the `driver_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "driver_profile" DROP COLUMN "account_number",
ADD COLUMN     "account_number" BIGINT,
DROP COLUMN "card_number",
ADD COLUMN     "card_number" BIGINT;
