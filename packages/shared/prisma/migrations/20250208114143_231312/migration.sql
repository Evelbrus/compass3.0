-- CreateEnum
CREATE TYPE "DriverAcceptanceStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'TIMEOUT');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "driver_acceptance_status" "DriverAcceptanceStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "driver_order_notifications" (
    "uuid" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_order_notifications_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "driver_order_notifications" ADD CONSTRAINT "driver_order_notifications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_order_notifications" ADD CONSTRAINT "driver_order_notifications_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
