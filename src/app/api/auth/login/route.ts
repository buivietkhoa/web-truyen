import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidEmail } from "@/lib/auth-validation";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const invalidLoginMessage = "Email hoặc mật khẩu không đúng.";

export async function POST(request: Request) {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server chưa cấu hình JWT_SECRET." },
        { status: 500 }
      );
    }

    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit({
      key: `login:${clientIp}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Bạn thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút." },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfter.toString(),
          },
        }
      );
    }

    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password || !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Vui lòng nhập email và mật khẩu hợp lệ." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      await bcrypt.compare(password, "$2a$10$7EqJtq98hPqEX7fNZaFWoOhiMjS2P6uD5fPRkYq2r9ztcPjWQzTBa");
      return NextResponse.json({ message: invalidLoginMessage }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ message: "Tài khoản đã bị vô hiệu hóa." }, { status: 403 });
    }

    if (user.authProvider === "EMAIL" && !user.emailVerifiedAt) {
      return NextResponse.json(
        {
          code: "EMAIL_NOT_VERIFIED",
          message: "Email chưa được xác minh. Vui lòng kiểm tra hộp thư hoặc gửi lại email xác minh.",
        },
        { status: 403 },
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: invalidLoginMessage }, { status: 401 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), authProvider: "EMAIL" },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    const response = NextResponse.json({
      message: "Đăng nhập thành công.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR", error);

    return NextResponse.json(
      { message: "Lỗi server khi đăng nhập." },
      { status: 500 }
    );
  }
}
