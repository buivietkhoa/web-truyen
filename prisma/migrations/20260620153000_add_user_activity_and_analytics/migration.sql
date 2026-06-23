ALTER TABLE "User"
ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'EMAIL',
ADD COLUMN "lastLoginAt" TIMESTAMP(3),
ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "AffiliateClick" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "storyId" TEXT,
  "chapterId" TEXT,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReadingEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "storyId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "durationSeconds" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReadingEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SearchEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "query" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AffiliateClick_productId_createdAt_idx" ON "AffiliateClick"("productId", "createdAt");
CREATE INDEX "AffiliateClick_storyId_createdAt_idx" ON "AffiliateClick"("storyId", "createdAt");
CREATE INDEX "AffiliateClick_createdAt_idx" ON "AffiliateClick"("createdAt");
CREATE INDEX "ReadingEvent_eventType_createdAt_idx" ON "ReadingEvent"("eventType", "createdAt");
CREATE INDEX "ReadingEvent_storyId_createdAt_idx" ON "ReadingEvent"("storyId", "createdAt");
CREATE INDEX "ReadingEvent_chapterId_createdAt_idx" ON "ReadingEvent"("chapterId", "createdAt");
CREATE INDEX "ReadingEvent_userId_createdAt_idx" ON "ReadingEvent"("userId", "createdAt");
CREATE INDEX "SearchEvent_createdAt_idx" ON "SearchEvent"("createdAt");
CREATE INDEX "SearchEvent_query_idx" ON "SearchEvent"("query");
