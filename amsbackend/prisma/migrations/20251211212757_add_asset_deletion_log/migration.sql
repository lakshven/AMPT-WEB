-- CreateTable
CREATE TABLE "asset_deletion_log" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "deleted_by" TEXT NOT NULL,
    "asset_snapshot" JSONB NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_deletion_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "asset_deletion_log" ADD CONSTRAINT "asset_deletion_log_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
