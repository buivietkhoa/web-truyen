import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addUtcDays } from "@/lib/date";
import { db } from "@/lib/db";

function parseDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ message: "Không có quyền truy cập." }, { status: 403 });
  }

  const from = parseDate(request.nextUrl.searchParams.get("from"));
  const to = parseDate(request.nextUrl.searchParams.get("to"));
  if (!from || !to || from > to) {
    return NextResponse.json({ message: "Khoảng ngày không hợp lệ." }, { status: 400 });
  }

  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  if (days > 366) {
    return NextResponse.json({ message: "Khoảng ngày tối đa là 366 ngày." }, { status: 400 });
  }

  const rows = await db.dailyView.findMany({
    where: { date: { gte: from, lt: addUtcDays(to, 1) } },
    orderBy: { date: "asc" },
    select: { date: true, count: true },
  });

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    data: rows.map((row) => ({ date: row.date.toISOString().slice(0, 10), count: row.count })),
  });
}
