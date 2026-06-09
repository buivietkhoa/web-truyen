import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const allowedGenders = new Set(["", "Nam", "Nữ", "Khác"]);

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "Chưa đăng nhập." },
      { status: 401 }
    );
  }

  const user = await db.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      gender: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Tài khoản không còn tồn tại." },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "Chưa đăng nhập." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = normalizeOptionalText(body.phone);
    const gender = typeof body.gender === "string" ? body.gender.trim() : "";

    if (!name) {
      return NextResponse.json(
        { message: "Họ tên không được để trống." },
        { status: 400 }
      );
    }

    if (phone && !/^[0-9+\-\s().]{8,20}$/.test(phone)) {
      return NextResponse.json(
        { message: "Số điện thoại không hợp lệ." },
        { status: 400 }
      );
    }

    if (!allowedGenders.has(gender)) {
      return NextResponse.json(
        { message: "Giới tính không hợp lệ." },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
        phone,
        gender: gender || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Cập nhật hồ sơ thành công.",
      user,
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR", error);

    return NextResponse.json(
      { message: "Lỗi server khi cập nhật hồ sơ." },
      { status: 500 }
    );
  }
}
