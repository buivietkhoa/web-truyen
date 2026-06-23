import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  await db.user.update({
    where: { id: currentUser.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ online: true });
}
