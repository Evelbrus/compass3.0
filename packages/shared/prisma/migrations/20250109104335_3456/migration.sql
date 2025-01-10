/*
  Warnings:

  - You are about to drop the `options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_options` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_options" DROP CONSTRAINT "order_options_option_id_fkey";

-- DropTable
DROP TABLE "options";

-- DropTable
DROP TABLE "order_options";

-- CreateTable
CREATE TABLE "order_on_tariff_additional_service" (
    "uuid" TEXT NOT NULL,
    "order_uuid" TEXT NOT NULL,
    "tariff_on_service_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_on_tariff_additional_service_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_on_tariff_additional_service_order_uuid_tariff_on_ser_key" ON "order_on_tariff_additional_service"("order_uuid", "tariff_on_service_uuid");

-- AddForeignKey
ALTER TABLE "order_on_tariff_additional_service" ADD CONSTRAINT "order_on_tariff_additional_service_order_uuid_fkey" FOREIGN KEY ("order_uuid") REFERENCES "orders"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_on_tariff_additional_service" ADD CONSTRAINT "order_on_tariff_additional_service_tariff_on_service_uuid_fkey" FOREIGN KEY ("tariff_on_service_uuid") REFERENCES "tariff_on_service"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
