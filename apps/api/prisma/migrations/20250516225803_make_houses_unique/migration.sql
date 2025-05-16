/*
  Warnings:

  - A unique constraint covering the columns `[type,number,complement]` on the table `House` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "House_type_number_complement_key" ON "House"("type", "number", "complement");
