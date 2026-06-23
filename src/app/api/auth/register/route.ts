import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isValidEmail, validatePassword } from "@/lib/auth-validation";
import { db } from "@/lib/db";
import { issueEmailVerification } from "@/lib/email-verification";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit({
      key: `register:${clientIp}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Bạn tạo tài khoản quá nhiều lần. Vui lòng thử lại sau." },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfter.toString(),
          },
        }
      );
    }

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin." },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { message: "Họ tên phải từ 2 đến 80 ký tự." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Email không hợp lệ." },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const existedUser = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, emailVerifiedAt: true },
    });

    if (existedUser?.emailVerifiedAt) {
      return NextResponse.json(
        { message: "Email đã được sử dụng." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = existedUser
      ? await db.user.update({
          where: { id: existedUser.id },
          data: { name, password: hashedPassword, authProvider: "EMAIL" },
          select: { id: true, name: true, email: true },
        })
      : await db.user.create({
          data: { name, email, password: hashedPassword, authProvider: "EMAIL" },
          select: { id: true, name: true, email: true },
        });

    const verification = await issueEmailVerification(user);
    if (!verification.sent && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { message: "Không thể gửi email xác minh lúc này. Vui lòng thử đăng ký lại sau." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        message: "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.",
        verificationUrl:
          process.env.NODE_ENV !== "production" ? verification.verificationUrl : undefined,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      { message: "Lỗi server khi đăng ký." },
      { status: 500 }
    );
  }
}
