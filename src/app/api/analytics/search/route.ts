import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit({ key: `search_event:${ip}`, limit: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ message: "Quá nhiều yêu cầu." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim().toLowerCase().slice(0, 100) : "";
  if (query.length < 2) return NextResponse.json({ message: "Từ khóa không hợp lệ." }, { status: 400 });

  const user = await getCurrentUser();
  await db.searchEvent.create({ data: { query, userId: user?.id || null } });
  return NextResponse.json({ ok: true });
}
