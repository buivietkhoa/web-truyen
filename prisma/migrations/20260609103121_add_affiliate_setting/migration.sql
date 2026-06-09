-- CreateTable
CREATE TABLE "AffiliateSetting" (
    "id" TEXT NOT NULL,
    "affiliateUrl" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerImage" TEXT,
    "buttonColor" TEXT NOT NULL DEFAULT '#0b2fa3',
    "waitSeconds" INTEGER NOT NULL DEFAULT 3,
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "effect" TEXT NOT NULL DEFAULT 'fade',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateSetting_pkey" PRIMARY KEY ("id")
);
