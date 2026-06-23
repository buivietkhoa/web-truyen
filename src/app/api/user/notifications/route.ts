import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        message: true,
        href: true,
        readAt: true,
        createdAt: true,
      },
    }),
    db.notification.count({
      where: { userId: currentUser.id, readAt: null },
    }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const notificationId = typeof body?.notificationId === "string" ? body.notificationId : "";
  const markAll = body?.markAll === true;

  if (!notificationId && !markAll) {
    return NextResponse.json({ message: "Thiếu thông báo cần cập nhật." }, { status: 400 });
  }

  await db.notification.updateMany({
    where: {
      userId: currentUser.id,
      readAt: null,
      ...(markAll ? {} : { id: notificationId }),
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ message: "Đã đánh dấu thông báo là đã đọc." });
}
