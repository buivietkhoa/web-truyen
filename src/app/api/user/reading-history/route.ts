import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });

  const histories = await db.readingHistory.findMany({
    where: {
      userId: currentUser.id,
      story: {
        published: true,
      },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      story: { select: { id: true, slug: true, title: true, coverImage: true } },
      chapter: { select: { id: true, number: true, title: true, published: true } },
    },
  });
  return NextResponse.json({ histories: histories.filter((item) => !item.chapter || item.chapter.published) });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const storyId = typeof body?.storyId === "string" ? body.storyId : "";
  const chapterId = typeof body?.chapterId === "string" ? body.chapterId : "";
  const progressValue = Number(body?.progress);
  const progress = Number.isFinite(progressValue)
    ? Math.max(0, Math.min(100, Math.round(progressValue)))
    : 0;

  if (!storyId || !chapterId) {
    return NextResponse.json({ message: "Thiếu thông tin truyện hoặc chương." }, { status: 400 });
  }

  const chapter = await db.chapter.findFirst({
    where: {
      id: chapterId,
      storyId,
      published: true,
      story: {
        published: true,
      },
    },
    select: { id: true },
  });
  if (!chapter) return NextResponse.json({ message: "Chương không tồn tại." }, { status: 404 });

  const history = await db.readingHistory.upsert({
    where: { userId_storyId: { userId: currentUser.id, storyId } },
    update: { chapterId, progress },
    create: { userId: currentUser.id, storyId, chapterId, progress },
  });
  return NextResponse.json({ history });
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const storyId = typeof body?.storyId === "string" ? body.storyId : "";
  if (!storyId) return NextResponse.json({ message: "Thiếu mã truyện." }, { status: 400 });

  await db.readingHistory.deleteMany({ where: { userId: currentUser.id, storyId } });
  return NextResponse.json({ success: true });
}
