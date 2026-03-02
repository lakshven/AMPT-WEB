-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_clientGroupId_fkey";

-- AlterTable
ALTER TABLE "assets" ALTER COLUMN "clientGroupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_clientGroupId_fkey" FOREIGN KEY ("clientGroupId") REFERENCES "ClientGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
