-- DropForeignKey
ALTER TABLE "company" DROP CONSTRAINT "company_user_id_fkey";

-- DropForeignKey
ALTER TABLE "driver_profile" DROP CONSTRAINT "driver_profile_user_id_fkey";

-- AddForeignKey
ALTER TABLE "driver_profile" ADD CONSTRAINT "driver_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
