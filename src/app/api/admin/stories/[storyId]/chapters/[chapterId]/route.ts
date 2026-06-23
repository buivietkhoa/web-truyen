import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { notifyFavoriteReaders } from "@/lib/notifications";
import { sanitizeRichContent } from "@/lib/sanitize-content";

interface Props {
  params: Promise<{
    storyId: string;
    chapterId: string;
  }>;
}

export async function PATCH(request: Request, { params }: Props) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });
  }

  try {
    const { storyId, chapterId } = await params;
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : undefined;
    const content = typeof body.content === "string"
      ? sanitizeRichContent(body.content)
      : undefined;
    const number = typeof body.number === "number" ? body.number : undefined;
    const published = typeof body.published === "boolean" ? body.published : undefined;

    if (title !== undefined && !title) {
      return NextResponse.json({ message: "Tiêu đề chương không được để trống." }, { status: 400 });
    }
    if (content !== undefined && !content) {
      return NextResponse.json({ message: "Nội dung chương không được để trống." }, { status: 400 });
    }

    const existingChapter = await db.chapter.findFirst({
      where: { id: chapterId, storyId },
      include: {
        story: {
          select: { id: true, slug: true, title: true, published: true },
        },
      },
    });

    if (!existingChapter) {
      return NextResponse.json({ message: "Không tìm thấy chương." }, { status: 404 });
    }

    const chapter = await db.chapter.update({
      where: { id: chapterId, storyId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(number !== undefined && { number }),
        ...(published !== undefined && { published }),
      },
    });

    await db.story.update({
      where: { id: storyId },
      data: { updatedAt: new Date() },
    });

    if (!existingChapter.published && chapter.published && existingChapter.story.published) {
      await notifyFavoriteReaders({
        storyId: existingChapter.story.id,
        storySlug: existingChapter.story.slug,
        storyTitle: existingChapter.story.title,
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
      }).catch((notificationError) => {
        console.error("PUBLISH_CHAPTER_NOTIFICATION_ERROR", notificationError);
      });
    }

    return NextResponse.json({ message: "Cập nhật chương thành công.", chapter });
  } catch (error) {
    console.error("ADMIN_PATCH_CHAPTER_ERROR", error);
    return NextResponse.json({ message: "Lỗi server khi cập nhật chương." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });
  }

  try {
    const { storyId, chapterId } = await params;

    await db.chapter.delete({
      where: { id: chapterId, storyId },
    });

    return NextResponse.json({ message: "Đã xóa chương thành công." });
  } catch (error) {
    console.error("ADMIN_DELETE_CHAPTER_ERROR", error);
    return NextResponse.json({ message: "Lỗi server khi xóa chương." }, { status: 500 });
  }
}
