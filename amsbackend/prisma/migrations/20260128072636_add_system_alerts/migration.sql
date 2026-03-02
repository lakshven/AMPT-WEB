-- CreateTable
CREATE TABLE "system_alerts" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id")
);
