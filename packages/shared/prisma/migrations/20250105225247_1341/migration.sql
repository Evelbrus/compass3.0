/*
  Warnings:

  - Added the required column `departure_time` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "departure_time" TIMESTAMP(3) NOT NULL;
