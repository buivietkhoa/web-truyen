-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Mọt Chạm',
    "siteDesc" TEXT NOT NULL DEFAULT 'Website đọc truyện online',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "footerText" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
