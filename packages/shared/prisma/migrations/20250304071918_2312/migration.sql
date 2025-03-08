/*
  Warnings:

  - The values [sprinter] on the enum `VehicleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VehicleType_new" AS ENUM ('sedan', 'minivan', 'microbus', 'bus', 'suv', 'none');
ALTER TABLE "tariffs" ALTER COLUMN "vehicle_type" TYPE "VehicleType_new" USING ("vehicle_type"::text::"VehicleType_new");
ALTER TABLE "vehicles" ALTER COLUMN "vehicle_type" TYPE "VehicleType_new" USING ("vehicle_type"::text::"VehicleType_new");
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "VehicleType_old";
COMMIT;
