/*
  Warnings:

  - You are about to drop the column `base_price` on the `points` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `points` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `points` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_km` to the `points` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "points" DROP COLUMN "base_price",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price_per_km" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "terrain_difficulty" DOUBLE PRECISION NOT NULL DEFAULT 1.0;
