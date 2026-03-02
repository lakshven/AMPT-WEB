-- CreateTable
CREATE TABLE "DropdownCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DropdownCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropdownValue" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "DropdownValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DropdownCategory_name_key" ON "DropdownCategory"("name");

-- AddForeignKey
ALTER TABLE "DropdownValue" ADD CONSTRAINT "DropdownValue_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DropdownCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
