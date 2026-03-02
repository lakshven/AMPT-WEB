/*
  Warnings:

  - A unique constraint covering the columns `[accessCode]` on the table `ClientGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'single';

-- CreateIndex
CREATE UNIQUE INDEX "ClientGroup_accessCode_key" ON "ClientGroup"("accessCode");
