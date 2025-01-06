-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_arrival_point_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_assigned_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_departure_point_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_tariff_id_fkey";

-- DropForeignKey
ALTER TABLE "tariff_on_service" DROP CONSTRAINT "tariff_on_service_service_uuid_fkey";

-- DropForeignKey
ALTER TABLE "tariff_on_service" DROP CONSTRAINT "tariff_on_service_tariff_uuid_fkey";

-- DropForeignKey
ALTER TABLE "tariff_on_service_levels" DROP CONSTRAINT "tariff_on_service_levels_service_uuid_fkey";

-- DropForeignKey
ALTER TABLE "tariff_on_service_levels" DROP CONSTRAINT "tariff_on_service_levels_tariff_uuid_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_drivers" DROP CONSTRAINT "vehicle_drivers_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_drivers" DROP CONSTRAINT "vehicle_drivers_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_on_service_levels" DROP CONSTRAINT "vehicle_on_service_levels_serviceUuid_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_on_service_levels" DROP CONSTRAINT "vehicle_on_service_levels_vehicleUuid_fkey";

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tariff_id_fkey" FOREIGN KEY ("tariff_id") REFERENCES "tariffs"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_departure_point_id_fkey" FOREIGN KEY ("departure_point_id") REFERENCES "points"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_arrival_point_id_fkey" FOREIGN KEY ("arrival_point_id") REFERENCES "points"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "driver_profile"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_on_service" ADD CONSTRAINT "tariff_on_service_tariff_uuid_fkey" FOREIGN KEY ("tariff_uuid") REFERENCES "tariffs"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_on_service" ADD CONSTRAINT "tariff_on_service_service_uuid_fkey" FOREIGN KEY ("service_uuid") REFERENCES "additional_services"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_on_service_levels" ADD CONSTRAINT "tariff_on_service_levels_tariff_uuid_fkey" FOREIGN KEY ("tariff_uuid") REFERENCES "tariffs"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_on_service_levels" ADD CONSTRAINT "tariff_on_service_levels_service_uuid_fkey" FOREIGN KEY ("service_uuid") REFERENCES "service_levels"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profile"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_on_service_levels" ADD CONSTRAINT "vehicle_on_service_levels_vehicleUuid_fkey" FOREIGN KEY ("vehicleUuid") REFERENCES "vehicles"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_on_service_levels" ADD CONSTRAINT "vehicle_on_service_levels_serviceUuid_fkey" FOREIGN KEY ("serviceUuid") REFERENCES "service_levels"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
