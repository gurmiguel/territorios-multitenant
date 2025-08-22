-- DropForeignKey
ALTER TABLE "House" DROP CONSTRAINT "House_streetId_fkey";

-- DropForeignKey
ALTER TABLE "Street" DROP CONSTRAINT "Street_territoryId_fkey";

-- DropForeignKey
ALTER TABLE "Territory" DROP CONSTRAINT "Territory_congregationId_fkey";

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Street" ADD CONSTRAINT "Street_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "Street"("id") ON DELETE CASCADE ON UPDATE CASCADE;
