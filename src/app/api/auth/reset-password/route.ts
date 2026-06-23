import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/auth-validation";
import { db } from "@/lib/db";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit({
      key: `reset-password:${clientIp}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Bạn thử quá nhiều lần. Vui lòng thử lại sau." },
        { status: 429, headers: { "Retry-After": rateLimit.retryAfter.toString() } }
      );
    }

    const body = await request.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ message: "Liên kết đặt lại mật khẩu không hợp lệ." }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: { tokenHash: hashPasswordResetToken(token) },
      include: { user: { select: { id: true } } },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      return NextResponse.json(
        { message: "Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.$transaction([
      db.user.update({
        where: { id: resetToken.user.id },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      db.passwordResetToken.updateMany({
        where: {
          userId: resetToken.user.id,
          id: { not: resetToken.id },
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
    ]);

    const response = NextResponse.json({ message: "Đặt lại mật khẩu thành công." });
    response.cookies.delete("token");
    return response;
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return NextResponse.json(
      { message: "Lỗi server khi đặt lại mật khẩu." },
      { status: 500 }
    );
  }
}
