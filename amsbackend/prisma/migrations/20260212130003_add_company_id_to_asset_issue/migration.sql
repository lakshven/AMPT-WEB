-- AlterTable
ALTER TABLE "AssetIssue" ADD COLUMN     "companyId" INTEGER;

-- AddForeignKey
ALTER TABLE "AssetIssue" ADD CONSTRAINT "AssetIssue_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
