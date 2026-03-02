/* STEP 1 — Create ClientGroup table FIRST */
CREATE TABLE "ClientGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientGroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientGroup_name_key" ON "ClientGroup"("name");

/* STEP 2 — Insert default client group */
INSERT INTO "ClientGroup" ("id", "name", "createdAt")
VALUES (1, 'Default Client Group', NOW());

/* STEP 3 — Add nullable columns */
ALTER TABLE "users" ADD COLUMN "clientGroupId" INTEGER;
ALTER TABLE "assets" ADD COLUMN "clientGroupId" INTEGER;
ALTER TABLE "AssetIssue" ADD COLUMN "clientGroupId" INTEGER;

/* STEP 4 — Backfill existing rows */
UPDATE "users" SET "clientGroupId" = 1 WHERE "clientGroupId" IS NULL;
UPDATE "assets" SET "clientGroupId" = 1 WHERE "clientGroupId" IS NULL;
UPDATE "AssetIssue" SET "clientGroupId" = 1 WHERE "clientGroupId" IS NULL;

/* STEP 5 — Make columns required */
ALTER TABLE "users" ALTER COLUMN "clientGroupId" SET NOT NULL;
ALTER TABLE "assets" ALTER COLUMN "clientGroupId" SET NOT NULL;
ALTER TABLE "AssetIssue" ALTER COLUMN "clientGroupId" SET NOT NULL;

/* STEP 6 — Add foreign keys LAST */
ALTER TABLE "users"
ADD CONSTRAINT "users_clientGroupId_fkey"
FOREIGN KEY ("clientGroupId") REFERENCES "ClientGroup"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "assets"
ADD CONSTRAINT "assets_clientGroupId_fkey"
FOREIGN KEY ("clientGroupId") REFERENCES "ClientGroup"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AssetIssue"
ADD CONSTRAINT "AssetIssue_clientGroupId_fkey"
FOREIGN KEY ("clientGroupId") REFERENCES "ClientGroup"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;