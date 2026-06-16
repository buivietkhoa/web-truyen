import { NextResponse } from "next/server";
import {
  affiliateUnlockCookieName,
  affiliateUnlockCookieOptions,
  createAffiliateUnlockToken,
} from "@/lib/affiliate-unlock";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const chapterId = typeof body.chapterId === "string" ? body.chapterId : "";
    const productId = typeof body.productId === "string" ? body.productId : "";

    if (!chapterId || !productId) {
      return NextResponse.json({ message: "Yêu cầu mở khóa không hợp lệ." }, { status: 400 });
    }

    const [chapter, product] = await Promise.all([
      db.chapter.findUnique({ where: { id: chapterId }, select: { id: true } }),
      db.affiliateProduct.findFirst({
        where: { id: productId, enabled: true },
        select: { id: true },
      }),
    ]);

    if (!chapter || !product) {
      return NextResponse.json({ message: "Chương hoặc sản phẩm không còn khả dụng." }, { status: 404 });
    }

    const response = NextResponse.json({ message: "Đã mở khóa chương." });
    response.cookies.set(
      affiliateUnlockCookieName,
      createAffiliateUnlockToken(chapterId),
      affiliateUnlockCookieOptions
    );
    return response;
  } catch (error) {
    console.error("AFFILIATE_UNLOCK_ERROR", error);
    return NextResponse.json({ message: "Không thể mở khóa chương." }, { status: 500 });
  }
}
