/*
  Warnings:

  - You are about to drop the column `type` on the `driver_order_notifications` table. All the data in the column will be lost.
  - The `status` column on the `driver_order_notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "driver_order_notifications" DROP COLUMN "type",
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';
