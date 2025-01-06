/*
  Warnings:

  - You are about to drop the column `tariff_service_id` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_options" DROP CONSTRAINT "order_options_order_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_tariff_id_tariff_service_id_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "tariff_service_id";
