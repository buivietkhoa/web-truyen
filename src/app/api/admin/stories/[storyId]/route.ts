import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { sanitizeRichContent } from "@/lib/sanitize-content";
import { categories } from "@/data/categories";

interface Props {
  params: Promise<{
    storyId: string;
  }>;
}

const allowedStatuses = new Set(["Đang ra", "Hoàn thành", "Tạm ngưng"]);
const allowedCategories = new Set(categories.map((category) => category.name));

function isValidCoverImage(value: string) {
  if (value.startsWith("/uploads/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(request: Request, { params }: Props) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });
  }

  try {
    const { storyId } = await params;
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : undefined;
    const category = typeof body.category === "string" ? body.category.trim() : undefined;
    const status = typeof body.status === "string" ? body.status.trim() : undefined;
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : undefined;
    const description = typeof body.description === "string"
      ? sanitizeRichContent(body.description)
      : undefined;
    const published = typeof body.published === "boolean" ? body.published : undefined;

    if (title !== undefined && !title) {
      return NextResponse.json({ message: "Tên truyện không được để trống." }, { status: 400 });
    }
    if (status !== undefined && !allowedStatuses.has(status)) {
      return NextResponse.json({ message: "Trạng thái không hợp lệ." }, { status: 400 });
    }
    if (category !== undefined && !allowedCategories.has(category)) {
      return NextResponse.json({ message: "Thể loại không hợp lệ." }, { status: 400 });
    }
    if (coverImage !== undefined && !isValidCoverImage(coverImage)) {
      return NextResponse.json({ message: "Ảnh bìa không hợp lệ." }, { status: 400 });
    }

    const story = await db.story.update({
      where: { id: storyId },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(status !== undefined && { status }),
        ...(coverImage !== undefined && { coverImage }),
        ...(description !== undefined && { description }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json({ message: "Cập nhật truyện thành công.", story });
  } catch (error) {
    console.error("ADMIN_PATCH_STORY_ERROR", error);
    return NextResponse.json({ message: "Lỗi server khi cập nhật truyện." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json(
      { message: "Bạn không có quyền quản trị." },
      { status: 403 },
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
      { status: 500 },
    );
  }
}
