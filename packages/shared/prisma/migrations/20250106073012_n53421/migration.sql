-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_id_fkey";

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE CASCADE;
