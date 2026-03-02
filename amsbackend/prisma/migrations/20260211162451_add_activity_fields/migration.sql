/*
  Warnings:

  - Added the required column `category` to the `UserActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dayOfWeek` to the `UserActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserActivity" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "dayOfWeek" INTEGER NOT NULL;
