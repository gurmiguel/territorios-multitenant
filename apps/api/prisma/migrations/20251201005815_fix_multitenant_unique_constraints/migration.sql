/*
  Warnings:

  - A unique constraint covering the columns `[streetId,type,number,complement]` on the table `House` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[congregationId,number]` on the table `Territory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "House_type_number_complement_key";

-- DropIndex
DROP INDEX "Territory_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "House_streetId_type_number_complement_key" ON "House"("streetId", "type", "number", "complement");

-- CreateIndex
CREATE UNIQUE INDEX "Territory_congregationId_number_key" ON "Territory"("congregationId", "number");
