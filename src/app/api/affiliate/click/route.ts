import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
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
