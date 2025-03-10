/*
  Warnings:

  - You are about to drop the column `createdById` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `orders` table. All the data in the column will be lost.
  - Added the required column `client_by_od` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_orderId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_id_fkey";

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "createdById",
ADD COLUMN     "clientById" TEXT,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "message" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "created_by_id",
ADD COLUMN     "client_by_od" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_by_od_fkey" FOREIGN KEY ("client_by_od") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
