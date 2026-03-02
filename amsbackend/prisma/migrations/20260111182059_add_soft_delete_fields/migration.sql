-- AlterTable
ALTER TABLE "Audit" ALTER COLUMN "targetId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disabledAt" TIMESTAMP(3);
