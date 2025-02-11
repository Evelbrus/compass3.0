-- AlterTable
ALTER TABLE "users" ALTER COLUMN "refresh_tokens" SET DEFAULT ARRAY[]::TEXT[];
