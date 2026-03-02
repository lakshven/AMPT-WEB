/*
  Warnings:

  - Added the required column `accessCode` to the `ClientGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClientGroup" ADD COLUMN "accessCode" TEXT NOT NULL DEFAULT 'TEMP-CODE';
ALTER TABLE "ClientGroup" ALTER COLUMN "accessCode" DROP DEFAULT;
