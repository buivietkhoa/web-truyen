import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

interface Params { params: Promise<{ storyId: string }> }

// GET: lấy thông tin lịch đăng chương của truyện
export async function GET(_req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { storyId } = await params;

  const chapters = await db.chapter.findMany({
    where: { storyId },
    select: { id: true, number: true, title: true, published: true, scheduledAt: true },
    orderBy: { number: "asc" },
  });

  return NextResponse.json({ chapters });
}

// POST: đặt lịch đăng chương tự động
// body: { startDate: "2026-06-30", hourVN: 7, intervalDays: 1, enabled: true }
export async function POST(request: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { storyId } = await params;
  const body = await request.json();

  const { startDate, hourVN = 7, intervalDays = 1, enabled } = body as {
    startDate: string;
    hourVN: number;
    intervalDays: number;
    enabled: boolean;
  };

  // Lấy tất cả chương chưa publish của truyện, sắp xếp theo số chương
  const unpublishedChapters = await db.chapter.findMany({
    where: { storyId, published: false },
    select: { id: true, number: true },
    orderBy: { number: "asc" },
  });

  if (!enabled) {
    // Tắt lịch: xóa scheduledAt của tất cả chương
    await db.chapter.updateMany({
      where: { storyId, published: false },
      data: { scheduledAt: null },
    });
    return NextResponse.json({ message: "Đã tắt lịch đăng chương.", updated: unpublishedChapters.length });
  }

  if (!startDate || !unpublishedChapters.length) {
    return NextResponse.json({ error: "Cần chọn ngày bắt đầu và có chương chưa đăng." }, { status: 400 });
  }

  // Đặt lịch cho từng chương: mỗi chương cách nhau intervalDays ngày
  // hourVN là giờ theo giờ VN (UTC+7) → convert sang UTC
  const hourUTC = ((hourVN - 7) + 24) % 24;

  const updates = unpublishedChapters.map((chapter, index) => {
    const releaseDate = new Date(startDate);
    releaseDate.setDate(releaseDate.getDate() + index * intervalDays);
    releaseDate.setUTCHours(hourUTC, 0, 0, 0);

    return db.chapter.update({
      where: { id: chapter.id },
      data: { scheduledAt: releaseDate },
    });
  });

  await db.$transaction(updates);

  return NextResponse.json({
    message: `Đã đặt lịch cho ${unpublishedChapters.length} chương.`,
    scheduled: unpublishedChapters.length,
    firstRelease: new Date(startDate),
    hourVN,
    intervalDays,
  });
}
