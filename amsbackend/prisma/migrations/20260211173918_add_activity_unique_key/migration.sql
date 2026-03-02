/*
  Warnings:

  - A unique constraint covering the columns `[hour,dayOfWeek,category]` on the table `UserActivity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserActivity_hour_dayOfWeek_category_key" ON "UserActivity"("hour", "dayOfWeek", "category");
