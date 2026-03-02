-- CreateTable
CREATE TABLE "AssetIssue" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "mitigation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedTo" INTEGER,
    "assignedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedBy" INTEGER,

    CONSTRAINT "AssetIssue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetIssue" ADD CONSTRAINT "AssetIssue_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetIssue" ADD CONSTRAINT "AssetIssue_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetIssue" ADD CONSTRAINT "AssetIssue_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
