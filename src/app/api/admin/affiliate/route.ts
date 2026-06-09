import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

const allowedEffects = new Set(["fade", "slide", "zoom"]);

function normalizeUrl(value: unknown) {
  const url = typeof value === "string" ? value.trim() : "";

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export async function PATCH(request: Request) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json(
      { message: "Bạn không có quyền quản trị." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const affiliateUrl = normalizeUrl(body.affiliateUrl);
    const bannerImage = normalizeUrl(body.bannerImage);
    const buttonText = typeof body.buttonText === "string" ? body.buttonText.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const buttonColor = typeof body.buttonColor === "string" ? body.buttonColor.trim() : "#0b2fa3";
    const waitSeconds = Math.max(0, Math.min(60, Number(body.waitSeconds) || 0));
    const fontSize = Math.max(12, Math.min(28, Number(body.fontSize) || 16));
    const effect = allowedEffects.has(body.effect) ? body.effect : "fade";
    const enabled = Boolean(body.enabled);

    if (!affiliateUrl || !buttonText || !title || !description) {
      return NextResponse.json(
        { message: "Vui lòng nhập link affiliate, tiêu đề, mô tả và chữ trên nút." },
        { status: 400 }
      );
    }

    const existed = await db.affiliateSetting.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
      },
    });

    const setting = existed
      ? await db.affiliateSetting.update({
          where: {
            id: existed.id,
          },
          data: {
            affiliateUrl,
            buttonText,
            title,
            description,
            bannerImage,
            buttonColor,
            waitSeconds,
            fontSize,
            effect,
            enabled,
          },
        })
      : await db.affiliateSetting.create({
          data: {
            affiliateUrl,
            buttonText,
            title,
            description,
            bannerImage,
            buttonColor,
            waitSeconds,
            fontSize,
            effect,
            enabled,
          },
        });

    return NextResponse.json({
      message: "Đã lưu cấu hình affiliate.",
      setting,
    });
  } catch (error) {
    console.error("ADMIN_AFFILIATE_UPDATE_ERROR", error);

    return NextResponse.json(
      { message: "Không thể lưu cấu hình affiliate." },
      { status: 500 }
    );
  }
}
