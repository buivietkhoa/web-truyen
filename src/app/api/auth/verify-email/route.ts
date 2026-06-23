import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashEmailVerificationToken } from "@/lib/email-verification";
import { getAppOrigin } from "@/lib/oauth-auth";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token) {
    return NextResponse.redirect(new URL("/dang-nhap?error=verification_invalid", getAppOrigin()));
  }

  const verificationToken = await db.emailVerificationToken.findUnique({
    where: { tokenHash: hashEmailVerificationToken(token) },
  });

  if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt <= new Date()) {
    return NextResponse.redirect(new URL("/dang-nhap?error=verification_invalid", getAppOrigin()));
  }

  await db.$transaction([
    db.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    db.emailVerificationToken.updateMany({
      where: { userId: verificationToken.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(new URL("/dang-nhap?verified=1", getAppOrigin()));
}
