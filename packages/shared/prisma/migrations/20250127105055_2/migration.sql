-- AlterTable
ALTER TABLE "company" ADD COLUMN     "logo_image_path" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "sessionVersion" SET DEFAULT 0;
