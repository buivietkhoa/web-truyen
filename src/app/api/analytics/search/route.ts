import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim().toLowerCase().slice(0, 100) : "";
  if (query.length < 2) return NextResponse.json({ message: "Từ khóa không hợp lệ." }, { status: 400 });

  const user = await getCurrentUser();
  await db.searchEvent.create({ data: { query, userId: user?.id || null } });
  return NextResponse.json({ ok: true });
}
