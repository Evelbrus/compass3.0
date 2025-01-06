-- DropForeignKey
ALTER TABLE "company" DROP CONSTRAINT "company_user_id_fkey";

-- DropForeignKey
ALTER TABLE "driver_history" DROP CONSTRAINT "driver_history_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "driver_profile" DROP CONSTRAINT "driver_profile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_drivers" DROP CONSTRAINT "vehicle_drivers_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_drivers" DROP CONSTRAINT "vehicle_drivers_vehicle_id_fkey";

-- AddForeignKey
ALTER TABLE "driver_history" ADD CONSTRAINT "driver_history_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profile"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profile" ADD CONSTRAINT "driver_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profile"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
