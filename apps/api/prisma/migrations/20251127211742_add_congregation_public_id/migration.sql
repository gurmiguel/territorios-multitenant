-- AlterTable
ALTER TABLE "Congregation" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Congregation_publicId_key" ON "Congregation"("publicId");