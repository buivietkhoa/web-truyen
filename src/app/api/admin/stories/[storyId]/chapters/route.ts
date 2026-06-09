import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{
    storyId: string;
  }>;
}

export async function POST(request: Request, { params }: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json(
      { message: "Bạn không có quyền quản trị." },
      { status: 403 }
    );
  }

  try {
    const { storyId } = await params;
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const requestedNumber = Number(body.number);

    if (!title || !content) {
      return NextResponse.json(
        { message: "Vui lòng nhập tiêu đề và nội dung chương." },
        { status: 400 }
      );
    }

    const story = await db.story.findUnique({
      where: {
        id: storyId,
      },
      include: {
        chapters: {
          orderBy: {
            number: "desc",
          },
          take: 1,
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { message: "Không tìm thấy truyện." },
        { status: 404 }
      );
    }

    const number = Number.isInteger(requestedNumber) && requestedNumber > 0
      ? requestedNumber
      : (story.chapters[0]?.number || 0) + 1;

    const chapter = await db.chapter.create({
      data: {
        storyId: story.id,
        title,
        number,
        content,
      },
    });

    await db.story.update({
      where: {
        id: story.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Thêm chương thành công.",
        chapter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN_CREATE_CHAPTER_ERROR", error);

    return NextResponse.json(
      { message: "Lỗi server khi thêm chương. Kiểm tra số chương có bị trùng không." },
      { status: 500 }
    );
  }
}
