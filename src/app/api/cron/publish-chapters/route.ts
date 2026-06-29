import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Endpoint này được Vercel Cron gọi tự động hàng ngày lúc 7AM giờ VN (0AM UTC)
// Cũng có thể gọi thủ công từ admin với header x-cron-secret

export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  const envSecret = process.env.CRON_SECRET;

  // Xác thực: phải có đúng secret hoặc là Vercel Cron
  const isVercelCron = request.headers.get("x-vercel-signature") !== null;
  const isManual = envSecret && secret === envSecret;

  if (!isVercelCron && !isManual && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Tìm tất cả chương đã đến giờ publish nhưng chưa published
  const chaptersToPublish = await db.chapter.findMany({
    where: {
      published: false,
      scheduledAt: { lte: now },
    },
    select: { id: true, number: true, title: true, storyId: true },
  });

  if (chaptersToPublish.length === 0) {
    return NextResponse.json({ published: 0, message: "Không có chương nào cần publish." });
  }

  // Publish tất cả các chương đã đến giờ
  await db.chapter.updateMany({
    where: {
      id: { in: chaptersToPublish.map((c) => c.id) },
    },
    data: {
      published: true,
      scheduledAt: null, // xóa lịch sau khi đã publish
    },
  });

  console.log(`[CRON] Published ${chaptersToPublish.length} chapters at ${now.toISOString()}`);

  return NextResponse.json({
    published: chaptersToPublish.length,
    chapters: chaptersToPublish.map((c) => ({
      id: c.id,
      number: c.number,
      title: c.title,
    })),
  });
}
