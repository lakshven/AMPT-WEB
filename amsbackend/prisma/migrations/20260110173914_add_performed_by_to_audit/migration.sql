/*
  Warnings:

  - Added the required column `performedBy` to the `Audit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "clientGroupId" INTEGER,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "performedBy" TEXT NOT NULL;
