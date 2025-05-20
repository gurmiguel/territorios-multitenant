/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `Territory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Territory" ADD COLUMN     "imageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Territory_imageId_key" ON "Territory"("imageId");

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
