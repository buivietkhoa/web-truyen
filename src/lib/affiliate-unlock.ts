import { createHmac, timingSafeEqual } from "node:crypto";

export const affiliateUnlockCookieName = "affiliate_unlock";
const unlockDurationSeconds = 60 * 60 * 12;

type UnlockPayload = { chapterId: string; expiresAt: number };

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createAffiliateUnlockToken(chapterId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Thiếu JWT_SECRET để tạo khóa affiliate.");

  const payload: UnlockPayload = {
    chapterId,
    expiresAt: Date.now() + unlockDurationSeconds * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyAffiliateUnlockToken(token: string | undefined, chapterId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) return false;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expectedSignature = sign(encodedPayload, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as UnlockPayload;
    return payload.chapterId === chapterId && payload.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export const affiliateUnlockCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: unlockDurationSeconds,
};
