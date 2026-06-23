import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { sanitizeRichContent } from "@/lib/sanitize-content";
import { createSlug } from "@/lib/slug";

const allowedStatuses = new Set(["Đang ra", "Hoàn thành", "Tạm ngưng"]);

function isUploadedCoverImage(value: string) {
  if (value.startsWith("/uploads/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json(
      { message: "Bạn không có quyền quản trị." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim() : "Đang ra";
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : "";
    const description = typeof body.description === "string"
      ? sanitizeRichContent(body.description)
      : "";
    const customSlug = typeof body.slug === "string" ? body.slug.trim() : "";
    const published = typeof body.published === "boolean" ? body.published : true;
    const slug = createSlug(customSlug || title);

    if (!title || !category || !coverImage || !description) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin truyện." },
        { status: 400 },
      );
    }

    if (!isUploadedCoverImage(coverImage)) {
      return NextResponse.json(
        { message: "Ảnh bìa phải được upload từ form quản trị." },
        { status: 400 },
      );
    }

    if (!slug) {
      return NextResponse.json(
        { message: "Không thể tạo đường dẫn truyện từ tên đã nhập." },
        { status: 400 },
      );
    }

    if (!allowedStatuses.has(status)) {
      return NextResponse.json(
        { message: "Trạng thái truyện không hợp lệ." },
        { status: 400 },
      );
    }

    const existedStory = await db.story.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existedStory) {
      return NextResponse.json(
        { message: "Đường dẫn truyện đã tồn tại. Hãy đổi tên hoặc nhập slug khác." },
        { status: 400 },
      );
    }

    const story = await db.story.create({
      data: {
        title,
        slug,
        category,
        status,
        coverImage,
        description,
        published,
      },
    });

    return NextResponse.json(
      {
        message: "Thêm truyện thành công.",
        story,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("ADMIN_CREATE_STORY_ERROR", error);

    return NextResponse.json(
      { message: "Lỗi server khi thêm truyện." },
      { status: 500 },
    );
  }
}
