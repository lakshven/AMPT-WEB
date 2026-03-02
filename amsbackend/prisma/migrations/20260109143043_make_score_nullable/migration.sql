-- DropForeignKey
ALTER TABLE "AssetIssue" DROP CONSTRAINT "AssetIssue_clientGroupId_fkey";

-- AlterTable
ALTER TABLE "AssetIssue" ALTER COLUMN "score" DROP NOT NULL,
ALTER COLUMN "clientGroupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AssetIssue" ADD CONSTRAINT "AssetIssue_clientGroupId_fkey" FOREIGN KEY ("clientGroupId") REFERENCES "ClientGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
