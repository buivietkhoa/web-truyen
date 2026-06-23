import crypto from "node:crypto";
import { db } from "@/lib/db";
import { sendEmailVerification } from "@/lib/mail";
import { getAppOrigin } from "@/lib/oauth-auth";

const emailVerificationExpiresMs = 24 * 60 * 60 * 1000;

function createToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashEmailVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function issueEmailVerification(user: { id: string; email: string; name: string }) {
  await db.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = createToken();
  await db.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashEmailVerificationToken(token),
      expiresAt: new Date(Date.now() + emailVerificationExpiresMs),
    },
  });

  const verificationUrl = `${getAppOrigin()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const mailResult = await sendEmailVerification({
    to: user.email,
    name: user.name,
    verificationUrl,
  });

  return { ...mailResult, verificationUrl };
}
