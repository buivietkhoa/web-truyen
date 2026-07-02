import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface OAuthUserInput {
  email: string;
  name: string;
  avatar?: string;
  provider: "GOOGLE" | "FACEBOOK";
}

export async function signInOAuthUser({ email, name, avatar, provider }: OAuthUserInput) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      emailVerifiedAt: true,
    },
  });

  if (existingUser) {
    if (!existingUser.active) throw new Error("Account disabled");
    return db.user.update({
      where: { id: existingUser.id },
      data: {
        lastLoginAt: new Date(),
        authProvider: provider,
        emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
      },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  const randomPassword = await bcrypt.hash(crypto.randomUUID(), 12);

  return db.user.create({
    data: {
      name: name.trim() || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: randomPassword,
      avatar: avatar || null,
      authProvider: provider,
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    },
    select: { id: true, name: true, email: true, role: true },
  });
}

export function createOAuthLoginResponse(user: { id: string; email: string; role: string }) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: "7d" }
  );

  const response = NextResponse.redirect(new URL("/profile", getAppOrigin()));
  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export function getAppOrigin() {
  const rawOrigin =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  const origin = rawOrigin.startsWith("http") ? rawOrigin : `https://${rawOrigin}`;
  return origin.replace(/\/$/, "");
}

export function createOAuthStateCookie(response: NextResponse, cookieName: string, state: string) {
  response.cookies.set(cookieName, state, {
    httpOnly: true,
    path: "/",
    maxAge: 10 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearOAuthStateCookie(response: NextResponse, cookieName: string) {
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
