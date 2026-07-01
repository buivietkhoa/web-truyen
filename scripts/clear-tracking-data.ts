import { config } from "dotenv";
config({ path: ".env" });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Bắt đầu xóa dữ liệu tracking ===\n");

  const [
    readingHistory,
    readingEvent,
    dailyView,
    notification,
    searchEvent,
    affiliateClick,
    rateLimitBucket,
    favorite,
  ] = await Promise.all([
    prisma.readingHistory.deleteMany(),
    prisma.readingEvent.deleteMany(),
    prisma.dailyView.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.searchEvent.deleteMany(),
    prisma.affiliateClick.deleteMany(),
    prisma.rateLimitBucket.deleteMany(),
    prisma.favorite.deleteMany(),
  ]);

  const storyUpdate = await prisma.story.updateMany({ data: { views: 0 } });

  console.log(`✓ ReadingHistory xóa: ${readingHistory.count}`);
  console.log(`✓ ReadingEvent xóa:   ${readingEvent.count}`);
  console.log(`✓ DailyView xóa:      ${dailyView.count}`);
  console.log(`✓ Notification xóa:   ${notification.count}`);
  console.log(`✓ SearchEvent xóa:    ${searchEvent.count}`);
  console.log(`✓ AffiliateClick xóa: ${affiliateClick.count}`);
  console.log(`✓ RateLimitBucket xóa:${rateLimitBucket.count}`);
  console.log(`✓ Favorite xóa:       ${favorite.count}`);
  console.log(`✓ Story.views reset:  ${storyUpdate.count} truyện → 0`);

  console.log("\n=== Hoàn thành ===");
}

main()
  .catch((e) => { console.error("Lỗi:", e); process.exit(1); })
  .finally(() => Promise.all([prisma.$disconnect(), pool.end()]));
