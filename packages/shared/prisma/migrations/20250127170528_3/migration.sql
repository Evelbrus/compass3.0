-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_assigned_driver_id_fkey";

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
