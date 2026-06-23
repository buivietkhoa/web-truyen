import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ favorite: false }, { status: 401 });

  const storyId = new URL(request.url).searchParams.get("storyId") ?? "";
  const favorite = storyId
    ? await db.favorite.findUnique({
        where: { userId_storyId: { userId: currentUser.id, storyId } },
        select: { id: true },
      })
    : null;
  return NextResponse.json({ favorite: Boolean(favorite) });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ message: "Vui lòng đăng nhập." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const storyId = typeof body?.storyId === "string" ? body.storyId : "";
  if (!storyId) return NextResponse.json({ message: "Thiếu mã truyện." }, { status: 400 });

  const story = await db.story.findFirst({
    where: { id: storyId, published: true },
    select: { id: true },
  });
  if (!story) return NextResponse.json({ message: "Truyện không tồn tại." }, { status: 404 });

  await db.favorite.upsert({
    where: { userId_storyId: { userId: currentUser.id, storyId } },
    update: {},
    create: { userId: currentUser.id, storyId },
  });
  return NextResponse.json({ favorite: true });
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ message: "Vui lòng đăng nhập." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const storyId = typeof body?.storyId === "string" ? body.storyId : "";
  if (!storyId) return NextResponse.json({ message: "Thiếu mã truyện." }, { status: 400 });

  await db.favorite.deleteMany({ where: { userId: currentUser.id, storyId } });
  return NextResponse.json({ favorite: false });
}
