-- CreateEnum
CREATE TYPE "DriverEventType" AS ENUM ('order_completed', 'fine_issued', 'bonus_received', 'other');

-- CreateEnum
CREATE TYPE "Citizenship" AS ENUM ('RU', 'KG', 'none');

-- CreateEnum
CREATE TYPE "IdentityDocument" AS ENUM ('Russian', 'Kyrgyzstan', 'none');

-- CreateEnum
CREATE TYPE "ChangingDriver" AS ENUM ('day', 'night', 'both', 'none');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('free', 'busy', 'none');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Client', 'ClientCorp', 'Driver', 'Operator', 'Admin', 'none');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'none');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('other', 'white', 'silver', 'gold', 'black', 'grey', 'blue', 'pink', 'red', 'orange', 'brown', 'green', 'none');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('sedan', 'minivan', 'sprinter', 'bus', 'none');

-- CreateEnum
CREATE TYPE "ServiceLevels" AS ENUM ('basic', 'premium', 'vip', 'none');

-- CreateTable
CREATE TABLE "driver_experience" (
    "uuid" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "position" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "driverProfileId" TEXT,

    CONSTRAINT "driver_experience_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "driver_history" (
    "uuid" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "event_type" "DriverEventType" NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" TEXT,
    "order_amount" DOUBLE PRECISION,
    "fine_amount" DOUBLE PRECISION,
    "fine_reason" TEXT,
    "total_orders" INTEGER,
    "total_fines" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_history_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "driver_profile" (
    "uuid" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "citizenship" "Citizenship" NOT NULL,
    "identity_document" "IdentityDocument" NOT NULL,
    "passport_id" TEXT NOT NULL,
    "passport_issue_date" TIMESTAMP(3),
    "passport_issued" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3),
    "birthplace" TEXT NOT NULL,
    "actual_address" TEXT NOT NULL,
    "permanent_address" TEXT NOT NULL,
    "changing_driver" "ChangingDriver" NOT NULL,
    "driver_type" TEXT NOT NULL,
    "yearsOfDriving" INTEGER NOT NULL,
    "passport_photo_path" TEXT,
    "profile_photo_path" TEXT,
    "license_photo_path" TEXT,
    "bank_name" TEXT,
    "bic" TEXT,
    "account_number" TEXT,
    "card_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "driver_profile_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "orders" (
    "uuid" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "tariff_id" TEXT NOT NULL,
    "departure_point_id" TEXT NOT NULL,
    "arrival_point_id" TEXT NOT NULL,
    "assigned_driver_id" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "base_price" DECIMAL(65,30) NOT NULL,
    "final_price" DECIMAL(65,30),
    "departure_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "intermediate_points" TEXT[],

    CONSTRAINT "orders_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "order_on_tariff_additional_service" (
    "uuid" TEXT NOT NULL,
    "order_uuid" TEXT NOT NULL,
    "tariff_on_service_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_on_tariff_additional_service_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "points" (
    "uuid" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "base_price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "points_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "additional_services" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "additional_services_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "tariffs" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT,
    "additional_point_price" INTEGER NOT NULL,
    "free_wait_time_bishkek" INTEGER NOT NULL,
    "price_per_minute_after_bishkek" INTEGER NOT NULL,
    "free_wait_time_airport" INTEGER NOT NULL,
    "price_per_minute_after_airport" INTEGER NOT NULL,
    "service_level" "ServiceLevels" NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariffs_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "tariff_on_service" (
    "uuid" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "tariff_uuid" TEXT NOT NULL,
    "service_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariff_on_service_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "company" (
    "uuid" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "company_pin" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "users" (
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT false,
    "driver_profile_id" TEXT,
    "companyProfileId" TEXT,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "address" TEXT,
    "profile_photo_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "uuid" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" TIMESTAMP(3),
    "color" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "photo_path" TEXT,
    "service_levels" "ServiceLevels" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "vehicle_drivers" (
    "uuid" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "assignment_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_drivers_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "driver_profile_user_id_key" ON "driver_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_on_tariff_additional_service_order_uuid_tariff_on_ser_key" ON "order_on_tariff_additional_service"("order_uuid", "tariff_on_service_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "points_address_key" ON "points"("address");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_on_service_tariff_uuid_service_uuid_key" ON "tariff_on_service"("tariff_uuid", "service_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "company_user_id_key" ON "company"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_driver_profile_id_key" ON "users"("driver_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_drivers_driver_id_key" ON "vehicle_drivers"("driver_id");

-- AddForeignKey
ALTER TABLE "driver_experience" ADD CONSTRAINT "driver_experience_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profile"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_history" ADD CONSTRAINT "driver_history_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profile"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profile" ADD CONSTRAINT "driver_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "order_on_tariff_additional_service" ADD CONSTRAINT "order_on_tariff_additional_service_order_uuid_fkey" FOREIGN KEY ("order_uuid") REFERENCES "orders"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_on_tariff_additional_service" ADD CONSTRAINT "order_on_tariff_additional_service_tariff_on_service_uuid_fkey" FOREIGN KEY ("tariff_on_service_uuid") REFERENCES "tariff_on_service"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_on_service" ADD CONSTRAINT "tariff_on_service_tariff_uuid_fkey" FOREIGN KEY ("tariff_uuid") REFERENCES "tariffs"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_on_service" ADD CONSTRAINT "tariff_on_service_service_uuid_fkey" FOREIGN KEY ("service_uuid") REFERENCES "additional_services"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profile"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
