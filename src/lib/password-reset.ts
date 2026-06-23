import crypto from "crypto";

export const passwordResetExpiresMs = 30 * 60 * 1000;

export function createPasswordResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetUrl(origin: string, token: string) {
  return `${origin}/dat-lai-mat-khau?token=${encodeURIComponent(token)}`;
}
