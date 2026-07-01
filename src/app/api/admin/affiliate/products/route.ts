import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { normalizeExternalUrl, normalizeImageUrl } from "@/lib/affiliate-normalize";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Ưu đãi độc quyền";
    const description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : "Sản phẩm đang được giảm giá tại sàn liên kết.";
    const affiliateUrl = normalizeExternalUrl(body.affiliateUrl);
    const imageUrl = normalizeImageUrl(body.imageUrl);
    const enabled = body.enabled !== false;

    if (!affiliateUrl || !imageUrl) {
      return NextResponse.json(
        { message: "Vui lòng nhập link affiliate và ảnh sản phẩm." },
        { status: 400 }
      );
    }

    const product = await db.affiliateProduct.create({
      data: {
        title,
        description,
        affiliateUrl,
        imageUrl,
        enabled,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("ADMIN_AFFILIATE_PRODUCT_CREATE_ERROR", error);
    return NextResponse.json({ message: "Không thể tạo sản phẩm affiliate." }, { status: 500 });
  }
}
