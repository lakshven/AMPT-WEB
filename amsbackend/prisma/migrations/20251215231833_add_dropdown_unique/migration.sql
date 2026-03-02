/*
  Warnings:

  - A unique constraint covering the columns `[value,categoryId]` on the table `DropdownValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DropdownValue_value_categoryId_key" ON "DropdownValue"("value", "categoryId");
