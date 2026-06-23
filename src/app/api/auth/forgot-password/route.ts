import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth-validation";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import {
  createPasswordResetToken,
  getPasswordResetUrl,
  hashPasswordResetToken,
  passwordResetExpiresMs,
} from "@/lib/password-reset";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const genericMessage = "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit({
      key: `forgot-password:${clientIp}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Bạn yêu cầu quá nhiều lần. Vui lòng thử lại sau." },
        { status: 429, headers: { "Retry-After": rateLimit.retryAfter.toString() } }
      );
    }

    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "Email không hợp lệ." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ message: genericMessage });
    }

    await db.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    });

    const token = createPasswordResetToken();
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashPasswordResetToken(token),
        expiresAt: new Date(Date.now() + passwordResetExpiresMs),
      },
    });

    const resetUrl = getPasswordResetUrl(new URL(request.url).origin, token);
    const mailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    const payload: { message: string; resetUrl?: string } = { message: genericMessage };
    if (!mailResult.sent && process.env.NODE_ENV !== "production") {
      payload.resetUrl = resetUrl;
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return NextResponse.json(
      { message: "Lỗi server khi tạo yêu cầu đặt lại mật khẩu." },
      { status: 500 }
    );
  }
}
