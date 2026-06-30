import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit({ key: `aff_click:${ip}`, limit: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    const url = new URL(request.url);
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const url = new URL(request.url);
  const productId = url.searchParams.get("productId") || "";
  const storyId = url.searchParams.get("storyId") || null;
  const chapterId = url.searchParams.get("chapterId") || null;
  const product = await db.affiliateProduct.findFirst({ where: { id: productId, enabled: true }, select: { affiliateUrl: true } });

  if (!product) return NextResponse.redirect(new URL("/", url.origin));

  const user = await getCurrentUser();
  await db.affiliateClick.create({ data: { productId, storyId, chapterId, userId: user?.id || null } });
  return NextResponse.redirect(product.affiliateUrl);
}
