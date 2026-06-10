import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { defaultAffiliateSetting } from "@/lib/affiliate";
import { db } from "@/lib/db";

const allowedEffects = new Set(["fade", "slide", "zoom"]);

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

export async function PATCH(request: Request) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const affiliateUrl = normalizeExternalUrl(body.affiliateUrl);
    const bannerImage = normalizeImageUrl(body.bannerImage);
    const buttonText =
      typeof body.buttonText === "string" && body.buttonText.trim()
        ? body.buttonText.trim()
        : defaultAffiliateSetting.buttonText;
    const title =
      typeof body.title === "string" && body.title.trim() ? body.title.trim() : defaultAffiliateSetting.title;
    const description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : defaultAffiliateSetting.description;
    const buttonColor = typeof body.buttonColor === "string" ? body.buttonColor.trim() : "#0b2fa3";
    const waitSeconds = Math.max(0, Math.min(60, Number(body.waitSeconds) || defaultAffiliateSetting.waitSeconds));
    const fontSize = Math.max(12, Math.min(28, Number(body.fontSize) || defaultAffiliateSetting.fontSize));
    const effect = allowedEffects.has(body.effect) ? body.effect : defaultAffiliateSetting.effect;
    const enabled = Boolean(body.enabled);

    const existed = await db.affiliateSetting.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
      },
    });

    const data = {
      affiliateUrl,
      buttonText,
      title,
      description,
      bannerImage: bannerImage || null,
      buttonColor,
      waitSeconds,
      fontSize,
      effect,
      enabled,
    };

    const setting = existed
      ? await db.affiliateSetting.update({
          where: {
            id: existed.id,
          },
          data,
        })
      : await db.affiliateSetting.create({
          data,
        });

    return NextResponse.json({
      message: "Đã lưu cấu hình affiliate.",
      setting,
    });
  } catch (error) {
    console.error("ADMIN_AFFILIATE_UPDATE_ERROR", error);

    return NextResponse.json({ message: "Không thể lưu cấu hình affiliate." }, { status: 500 });
  }
}
