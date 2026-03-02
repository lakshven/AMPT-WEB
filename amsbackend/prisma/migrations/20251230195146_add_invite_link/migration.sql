-- CreateTable
CREATE TABLE "InviteLink" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "clientGroupId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteLink_code_key" ON "InviteLink"("code");

-- AddForeignKey
ALTER TABLE "InviteLink" ADD CONSTRAINT "InviteLink_clientGroupId_fkey" FOREIGN KEY ("clientGroupId") REFERENCES "ClientGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteLink" ADD CONSTRAINT "InviteLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
