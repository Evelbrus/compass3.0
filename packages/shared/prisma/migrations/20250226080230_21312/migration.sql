/*
  Warnings:

  - You are about to alter the column `price_per_km` on the `points` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "points" ALTER COLUMN "price_per_km" SET DATA TYPE INTEGER;
