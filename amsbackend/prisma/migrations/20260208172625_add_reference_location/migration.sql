-- CreateTable
CREATE TABLE "ReferenceLocation" (
    "id" SERIAL NOT NULL,
    "rawInput" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referenceCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "easting" DOUBLE PRECISION,
    "northing" DOUBLE PRECISION,
    "osgb36" TEXT,
    "uprn" TEXT,
    "description" TEXT,
    "sourceSystem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceLocation_pkey" PRIMARY KEY ("id")
);
