import { createHash } from "node:crypto";
import { db } from "@/lib/db";

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

type BucketResult = {
  count: number;
  resetAt: Date;
};

export async function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const bucketKey = createHash("sha256").update(key).digest("hex");
  const resetAt = new Date(Date.now() + windowMs);
  const [bucket] = await db.$queryRaw<BucketResult[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
    VALUES (${bucketKey}, 1, ${resetAt}, NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= NOW() THEN ${resetAt}
        ELSE "RateLimitBucket"."resetAt"
      END,
      "updatedAt" = NOW()
    RETURNING "count", "resetAt"
  `;

  const count = bucket?.count ?? limit + 1;
  const bucketResetAt = bucket?.resetAt ?? resetAt;

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfter: count <= limit
      ? 0
      : Math.max(1, Math.ceil((bucketResetAt.getTime() - Date.now()) / 1000)),
  };
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}
