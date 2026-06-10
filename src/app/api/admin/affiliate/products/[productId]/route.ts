import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

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

export async function PATCH(request: Request, { params }: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });
  }

  const { productId } = await params;

  try {
    const body = await request.json();
    const data: {
      title?: string;
      description?: string;
      affiliateUrl?: string;
      imageUrl?: string;
      enabled?: boolean;
    } = {};

    if (typeof body.title === "string") {
      data.title = body.title.trim();
    }

    if (typeof body.description === "string") {
      data.description = body.description.trim();
    }

    if (typeof body.affiliateUrl === "string") {
      data.affiliateUrl = normalizeExternalUrl(body.affiliateUrl);
    }

    if (typeof body.imageUrl === "string") {
      data.imageUrl = normalizeImageUrl(body.imageUrl);
    }

    if (typeof body.enabled === "boolean") {
      data.enabled = body.enabled;
    }

    if (
      ("title" in data && !data.title) ||
      ("description" in data && !data.description) ||
      ("affiliateUrl" in data && !data.affiliateUrl) ||
      ("imageUrl" in data && !data.imageUrl)
    ) {
      return NextResponse.json({ message: "Dữ liệu sản phẩm affiliate không hợp lệ." }, { status: 400 });
    }

    const product = await db.affiliateProduct.update({
      where: {
        id: productId,
      },
      data,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("ADMIN_AFFILIATE_PRODUCT_UPDATE_ERROR", error);
    return NextResponse.json({ message: "Không thể cập nhật sản phẩm affiliate." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });
  }

  const { productId } = await params;

  try {
    await db.affiliateProduct.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({ message: "Đã xóa sản phẩm affiliate." });
  } catch (error) {
    console.error("ADMIN_AFFILIATE_PRODUCT_DELETE_ERROR", error);
    return NextResponse.json({ message: "Không thể xóa sản phẩm affiliate." }, { status: 500 });
  }
}
