/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `password_reset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "password_reset_userId_key" ON "password_reset"("userId");
