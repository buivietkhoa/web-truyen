import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeRichContent } from "@/lib/sanitize-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId, published: true },
    select: { content: true, storyId: true },
  });

  if (!chapter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify story is published
  const story = await db.story.findUnique({
    where: { id: chapter.storyId, published: true },
    select: { id: true },
  });

  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    { content: sanitizeRichContent(chapter.content) },
    {
      headers: {
        // Không cache — mỗi lần đọc phải fetch mới
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}
