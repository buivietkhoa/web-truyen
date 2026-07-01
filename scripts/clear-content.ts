import { config } from "dotenv";
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Xóa truyện và sản phẩm affiliate ===\n");

  // Xóa chapter trước (cascade sẽ tự xóa ReadingHistory, Notification liên quan)
  const chapters = await prisma.chapter.deleteMany();
  const stories = await prisma.story.deleteMany();
  const products = await prisma.affiliateProduct.deleteMany();

  console.log(`✓ Chapter xóa:           ${chapters.count}`);
  console.log(`✓ Story xóa:             ${stories.count}`);
  console.log(`✓ AffiliateProduct xóa:  ${products.count}`);
  console.log("\n=== Hoàn thành ===");
}

main()
  .catch((e) => { console.error("Lỗi:", e); process.exit(1); })
  .finally(() => Promise.all([prisma.$disconnect(), pool.end()]));
