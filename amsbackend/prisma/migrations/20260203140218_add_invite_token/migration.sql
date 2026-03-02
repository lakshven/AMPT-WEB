-- DropIndex
DROP INDEX "ClientGroup_name_key";

-- CreateTable
CREATE TABLE "InviteToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteToken_token_key" ON "InviteToken"("token");

-- AddForeignKey
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ClientGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
