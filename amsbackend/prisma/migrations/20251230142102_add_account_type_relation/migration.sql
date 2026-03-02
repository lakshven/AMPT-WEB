/*
  Warnings:

  - You are about to drop the column `accountType` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "accountType",
ADD COLUMN     "accountTypeId" INTEGER;

-- DropEnum
DROP TYPE "AccountType";

-- CreateTable
CREATE TABLE "AccountTypeOption" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "AccountTypeOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountTypeOption_value_key" ON "AccountTypeOption"("value");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_accountTypeId_fkey" FOREIGN KEY ("accountTypeId") REFERENCES "AccountTypeOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
