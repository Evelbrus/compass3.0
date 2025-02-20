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
CREATE TYPE "Action" AS ENUM ('info', 'noted', 'inProgress', 'success', 'warning', 'cancelled');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "DriverAcceptanceStatus" AS ENUM ('pending', 'taken', 'accepted', 'on_the_way', 'arrived', 'picked_up', 'timeout', 'completed');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('client', 'client_corp', 'driver', 'operator', 'admin', 'none');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'none');

-- CreateEnum
CREATE TYPE "PartnerCompany" AS ENUM ('transfer', 'yandex', 'uber', 'none');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('free', 'busy', 'offline', 'on_break');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('other', 'white', 'silver', 'gold', 'black', 'grey', 'blue', 'pink', 'red', 'orange', 'brown', 'green', 'none');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('sedan', 'minivan', 'sprinter', 'bus', 'none');

-- CreateEnum
CREATE TYPE "ServiceLevels" AS ENUM ('basic', 'premium', 'vip', 'none');

-- CreateEnum
CREATE TYPE "Ownership" AS ENUM ('personal', 'fleet');

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
    "citizenship" "Citizenship" NOT NULL,
    "identity_document" "IdentityDocument" NOT NULL,
    "passport_id" BIGINT NOT NULL,
    "passport_issue_date" TIMESTAMP(3),
    "passport_issued" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3),
    "birthplace" TEXT NOT NULL,
    "actual_address" TEXT NOT NULL,
    "permanent_address" TEXT NOT NULL,
    "changing_driver" "ChangingDriver" NOT NULL,
    "yearsOfDriving" INTEGER NOT NULL,
    "passport_photo_path" TEXT,
    "profile_photo_path" TEXT,
    "license_photo_path" TEXT,
    "bank_name" TEXT,
    "bic" TEXT,
    "account_number" BIGINT,
    "card_number" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "driver_profile_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "partner_salaries" (
    "uuid" TEXT NOT NULL,
    "partner_company" "PartnerCompany" NOT NULL,
    "salary_rate" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_salaries_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "notification" (
    "uuid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action" "Action" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("uuid")
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
    "driver_acceptance_status" "DriverAcceptanceStatus" DEFAULT 'pending',
    "base_price" DECIMAL(65,30) NOT NULL,
    "final_price" DECIMAL(65,30),
    "departure_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "intermediate_points" TEXT[],
    "description" TEXT,
    "flight_number" TEXT,
    "waiting_time_minutes" INTEGER NOT NULL DEFAULT 0,

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
    "price_per_km" DECIMAL(65,30) NOT NULL,
    "airport" BOOLEAN,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "terrain_difficulty" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

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
    "logo_image_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT,
    "email_attempt" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "driver_status" "DriverStatus" NOT NULL DEFAULT 'free',
    "partner_company" "PartnerCompany" NOT NULL DEFAULT 'none',
    "partnerSalaryId" TEXT,
    "default_salary_id" TEXT,
    "individual_salary_rate" DOUBLE PRECISION,
    "individual_currency" TEXT DEFAULT 'RUB',
    "driver_profile_id" TEXT,
    "company_profile_id" TEXT,
    "LoginAttemptId" TEXT,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "address" TEXT,
    "profile_photo_path" TEXT,
    "vehicle_driver_id" TEXT,
    "availability" BOOLEAN NOT NULL DEFAULT false,
    "last_active" TIMESTAMP(3),
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "refresh_tokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
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
    "photo_registration_certificate" TEXT,
    "service_levels" "ServiceLevels" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ownership" "Ownership" NOT NULL DEFAULT 'personal',

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
CREATE UNIQUE INDEX "login_attempts_user_id_key" ON "login_attempts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_driver_profile_id_key" ON "users"("driver_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_company_profile_id_key" ON "users"("company_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_drivers_driver_id_key" ON "vehicle_drivers"("driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_drivers_vehicle_id_driver_id_key" ON "vehicle_drivers"("vehicle_id", "driver_id");

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
ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_partnerSalaryId_fkey" FOREIGN KEY ("partnerSalaryId") REFERENCES "partner_salaries"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_default_salary_id_fkey" FOREIGN KEY ("default_salary_id") REFERENCES "partner_salaries"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
