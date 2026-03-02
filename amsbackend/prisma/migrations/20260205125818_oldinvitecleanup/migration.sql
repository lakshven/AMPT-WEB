/*
  Warnings:

  - You are about to drop the `InviteLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InviteLink" DROP CONSTRAINT "InviteLink_clientGroupId_fkey";

-- DropForeignKey
ALTER TABLE "InviteLink" DROP CONSTRAINT "InviteLink_createdById_fkey";

-- DropTable
DROP TABLE "InviteLink";
