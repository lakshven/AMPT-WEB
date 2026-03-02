-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "companyId" INTEGER;

-- AlterTable
ALTER TABLE "UserActivity" ADD COLUMN     "companyId" INTEGER;

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "category" TEXT,
ADD COLUMN     "companyId" INTEGER;

-- AlterTable
ALTER TABLE "system_alerts" ADD COLUMN     "companyId" INTEGER;

-- CreateTable
CREATE TABLE "company_settings" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "companyInfo" JSONB,
    "branding" JSONB,
    "preferences" JSONB,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_settings_companyId_key" ON "company_settings"("companyId");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
