import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{
    storyId: string;
  }>;
}

export async function DELETE(_request: Request, { params }: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json(
      { message: "Bạn không có quyền quản trị." },
      { status: 403 }
    );
  }

  try {
    const { storyId } = await params;

    await db.story.delete({
      where: {
        id: storyId,
      },
    });

    return NextResponse.json({
      message: "Đã xóa truyện thành công.",
    });
  } catch (error) {
    console.error("ADMIN_DELETE_STORY_ERROR", error);

    return NextResponse.json(
      { message: "Không thể xóa truyện. Truyện có thể đã bị xóa trước đó." },
      { status: 500 }
    );
  }
}
