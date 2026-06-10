import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

function normalizeExternalUrl(value: unknown) {
  const rawUrl = typeof value === "string" ? value : "";
  const cleanedUrl = rawUrl
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "");

  if (!cleanedUrl) {
    return "";
  }

  const url =
    cleanedUrl.startsWith("//")
      ? `https:${cleanedUrl}`
      : /^[a-z][a-z\d+\-.]*:\/\//i.test(cleanedUrl)
        ? cleanedUrl
        : `https://${cleanedUrl}`;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function normalizeImageUrl(value: unknown) {
  const rawUrl = typeof value === "string" ? value : "";
  const cleanedUrl = rawUrl
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "");

  if (!cleanedUrl) {
    return "";
  }

  if (cleanedUrl.startsWith("/uploads/")) {
    return cleanedUrl;
  }

  try {
    const parsed = new URL(cleanedUrl);

    if (parsed.hostname === "uploads") {
      return parsed.pathname.startsWith("/uploads/")
        ? parsed.pathname
        : `/uploads${parsed.pathname}`;
    }

    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

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
