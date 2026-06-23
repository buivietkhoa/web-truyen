import { NextRequest, NextResponse } from "next/server";
import { getBangkokDateKey } from "@/lib/date";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { storyId } = await request.json();

    if (!storyId || typeof storyId !== "string") {
      return NextResponse.json({ error: "Missing storyId" }, { status: 400 });
    }

    const viewCookieName = `story_view_${storyId}`;
    if (request.cookies.get(viewCookieName)?.value === "1") {
      return NextResponse.json({ ok: true, counted: false });
    }

    const story = await db.story.findFirst({
      where: { id: storyId, published: true },
      select: { id: true },
    });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const today = getBangkokDateKey();

    await db.$transaction([
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

    const response = NextResponse.json({ ok: true, counted: true });
    response.cookies.set(viewCookieName, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 6,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
