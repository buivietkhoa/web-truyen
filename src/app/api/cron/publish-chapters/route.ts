import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  const envSecret = process.env.CRON_SECRET;

  if (!envSecret || envSecret.length < 16) {
    return NextResponse.json(
      { error: "Server chưa cấu hình CRON_SECRET hợp lệ." },
      { status: 500 }
    );
  }

  const isVercelCron = request.headers.get("authorization") === `Bearer ${envSecret}`;
  const isManual = envSecret && secret === envSecret;

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1. Tìm tất cả chương đã đến giờ publish
  const chaptersToPublish = await db.chapter.findMany({
    where: { published: false, scheduledAt: { lte: now } },
    select: { id: true, number: true, title: true, storyId: true },
  });

  if (chaptersToPublish.length === 0) {
    return NextResponse.json({ published: 0, message: "Không có chương nào cần publish." });
  }

  // 2. Publish các chương đã đến giờ
  await db.chapter.updateMany({
    where: { id: { in: chaptersToPublish.map((c) => c.id) } },
    data: { published: true, scheduledAt: null },
  });

  // 3. Kiểm tra từng truyện — nếu hết chương nháp thì chuyển "Hoàn thành"
  const affectedStoryIds = [...new Set(chaptersToPublish.map((c) => c.storyId))];

  const completedStories: string[] = [];
  for (const storyId of affectedStoryIds) {
    const remainingDrafts = await db.chapter.count({
      where: { storyId, published: false },
    });

    if (remainingDrafts === 0) {
      await db.story.update({
        where: { id: storyId },
        data: { status: "Hoàn thành" },
      });
      completedStories.push(storyId);
    }
  }

  console.log(`[CRON] ${now.toISOString()} — Published ${chaptersToPublish.length} chapters, ${completedStories.length} stories completed`);

  return NextResponse.json({
    published: chaptersToPublish.length,
    completedStories: completedStories.length,
    chapters: chaptersToPublish.map((c) => ({ id: c.id, number: c.number, title: c.title })),
  });
}
