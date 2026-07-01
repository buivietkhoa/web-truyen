import { NextRequest, NextResponse } from "next/server";
import { getBangkokDateKey } from "@/lib/date";
import { db } from "@/lib/db";

const COOKIE_NAME = "sv";
const COOKIE_MAX_AGE = 60 * 60 * 4; // 4 tiếng / lần

export async function POST(request: NextRequest) {
  try {
    if (request.cookies.get(COOKIE_NAME)?.value === "1") {
      return NextResponse.json({ ok: true, counted: false });
    }

    const today = getBangkokDateKey();
    await db.dailyView.upsert({
      where: { date: today },
      update: { count: { increment: 1 } },
      create: { date: today, count: 1 },
    });

    const response = NextResponse.json({ ok: true, counted: true });
    response.cookies.set(COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
