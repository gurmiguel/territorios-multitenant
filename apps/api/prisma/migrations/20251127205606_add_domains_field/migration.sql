-- AlterTable
ALTER TABLE "Congregation" ADD COLUMN     "domains" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate slug to domains array
UPDATE "Congregation"
SET "domains" = ARRAY[CONCAT("slug", '.territorios.app')]
WHERE "slug" IS NOT NULL;

ALTER TABLE "Congregation" DROP COLUMN "slug";