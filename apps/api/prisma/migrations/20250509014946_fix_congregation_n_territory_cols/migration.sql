/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Congregation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Congregation" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Territory" ALTER COLUMN "map" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Congregation_slug_key" ON "Congregation"("slug");
