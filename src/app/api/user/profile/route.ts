import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "Chưa đăng nhập" },
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

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "Chưa đăng nhập" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { name, phone, gender } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { message: "Họ tên không được để trống" },
      { status: 400 }
    );
  }

  const user = await db.user.update({
    where: {
      id: currentUser.id,
    },
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
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
    message: "Cập nhật hồ sơ thành công",
    user,
  });
}
