import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{
    userId: string;
  }>;
}

const allowedRoles = new Set(["USER", "ADMIN"]);

export async function PATCH(request: Request, { params }: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json(
      { message: "Bạn không có quyền quản trị." },
      { status: 403 }
    );
  }

  try {
    const { userId } = await params;
    const body = await request.json();
    const role = typeof body.role === "string" ? body.role.trim() : "";

    if (!allowedRoles.has(role)) {
      return NextResponse.json(
        { message: "Vai trò không hợp lệ." },
        { status: 400 }
      );
    }

    if (admin.id === userId && role !== "ADMIN") {
      return NextResponse.json(
        { message: "Bạn không thể tự hạ quyền admin của chính mình." },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        role: role as "USER" | "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Đã cập nhật quyền người dùng.",
      user,
    });
  } catch (error) {
    console.error("ADMIN_UPDATE_USER_ROLE_ERROR", error);

    return NextResponse.json(
      { message: "Không thể cập nhật quyền người dùng." },
      { status: 500 }
    );
  }
}
