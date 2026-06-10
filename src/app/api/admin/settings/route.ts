import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

async function getSetting() {
  const list = await db.siteSetting.findMany({ take: 1 });
  return list[0] ?? null;
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });

  const setting = await getSetting();
  return NextResponse.json({ setting });
}

export async function PATCH(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });

  try {
    const body = await request.json();
    const data = {
      siteName:     typeof body.siteName     === "string" ? body.siteName.trim()     : undefined,
      siteDesc:     typeof body.siteDesc     === "string" ? body.siteDesc.trim()     : undefined,
      logoUrl:      typeof body.logoUrl      === "string" ? body.logoUrl.trim()      : undefined,
      primaryColor: typeof body.primaryColor === "string" ? body.primaryColor.trim() : undefined,
      contactEmail: typeof body.contactEmail === "string" ? body.contactEmail.trim() : undefined,
      footerText:   typeof body.footerText   === "string" ? body.footerText.trim()   : undefined,
    };
    Object.keys(data).forEach(
      (k) => (data as Record<string, unknown>)[k] === undefined && delete (data as Record<string, unknown>)[k]
    );

    const existing = await getSetting();
    const setting = existing
      ? await db.siteSetting.update({ where: { id: existing.id }, data })
      : await db.siteSetting.create({ data });

    return NextResponse.json({ message: "Đã lưu cài đặt.", setting });
  } catch (error) {
    console.error("ADMIN_SETTINGS_ERROR", error);
    return NextResponse.json({ message: "Lỗi server khi lưu cài đặt." }, { status: 500 });
  }
}
