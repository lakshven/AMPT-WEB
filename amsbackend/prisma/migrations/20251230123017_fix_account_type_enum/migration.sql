/*
  Warnings:

  - The `accountType` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('single', 'company');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "accountType",
ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'single';
