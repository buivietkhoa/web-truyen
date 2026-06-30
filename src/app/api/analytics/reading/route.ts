import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const allowedEvents = new Set(["VIEW", "NEXT_CHAPTER", "DURATION"]);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit({ key: `reading_event:${ip}`, limit: 120, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ message: "Quá nhiều yêu cầu." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const storyId = typeof body?.storyId === "string" ? body.storyId : "";
  const chapterId = typeof body?.chapterId === "string" ? body.chapterId : "";
  const eventType = typeof body?.eventType === "string" ? body.eventType : "";
  const durationSeconds = Math.max(0, Math.min(86400, Number(body?.durationSeconds) || 0));

  if (!storyId || !chapterId || !allowedEvents.has(eventType)) {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const user = await getCurrentUser();
  await db.readingEvent.create({
    data: { storyId, chapterId, eventType, durationSeconds: Math.round(durationSeconds), userId: user?.id || null },
  });
  return NextResponse.json({ ok: true });
}
