-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_clientGroupId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "clientGroupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clientGroupId_fkey" FOREIGN KEY ("clientGroupId") REFERENCES "ClientGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
