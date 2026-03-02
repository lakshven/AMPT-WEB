/*
  Warnings:

  - You are about to alter the column `accessCode` on the `ClientGroup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "ClientGroup" ALTER COLUMN "accessCode" SET DATA TYPE VARCHAR(100);
