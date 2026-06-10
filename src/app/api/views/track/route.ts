import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { storyId } = await request.json();

    if (!storyId || typeof storyId !== "string") {
      return NextResponse.json({ error: "Missing storyId" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Promise.all([
      db.story.update({
        where: { id: storyId },
        data: { views: { increment: 1 } },
      }),
      db.dailyView.upsert({
        where: { date: today },
        update: { count: { increment: 1 } },
        create: { date: today, count: 1 },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
