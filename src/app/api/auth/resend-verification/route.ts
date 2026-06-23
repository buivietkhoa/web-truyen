import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth-validation";
import { db } from "@/lib/db";
import { issueEmailVerification } from "@/lib/email-verification";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const genericMessage = "Nếu tài khoản cần xác minh, email mới đã được gửi.";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit({
    key: `resend-verification:${clientIp}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Bạn yêu cầu quá nhiều lần. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": rateLimit.retryAfter.toString() } },
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Email không hợp lệ." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, emailVerifiedAt: true, active: true },
  });

  if (user?.active && !user.emailVerifiedAt) {
    await issueEmailVerification(user);
  }

  return NextResponse.json({ message: genericMessage });
}
