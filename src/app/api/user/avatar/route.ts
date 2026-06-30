import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxSize = 3 * 1024 * 1024; // 3MB

function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY);
  const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET);
  const uploadPreset = cleanEnv(process.env.CLOUDINARY_UPLOAD_PRESET);
  const folder = "web-truyen/avatars";

  if (!cloudName) throw new Error("Thiếu cấu hình Cloudinary.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  if (uploadPreset) {
    formData.append("upload_preset", uploadPreset);
  } else if (apiKey && apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(payload).digest("hex");
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
  } else {
    throw new Error("Thiếu cấu hình Cloudinary.");
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message || "Upload thất bại.");
  return data.secure_url as string;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Vui lòng chọn ảnh." }, { status: 400 });
    }

    if (!allowedMimeTypes.has(file.type)) {
      return NextResponse.json({ message: "Ảnh phải là JPG, PNG, WEBP hoặc GIF." }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ message: "Ảnh không được vượt quá 3MB." }, { status: 400 });
    }

    const avatarUrl = await uploadToCloudinary(file);

    await db.user.update({
      where: { id: currentUser.id },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({ message: "Cập nhật ảnh đại diện thành công.", avatarUrl });
  } catch (error) {
    console.error("AVATAR_UPLOAD_ERROR", error);
    return NextResponse.json(
      { message: "Lỗi server khi cập nhật ảnh đại diện." },
      { status: 500 }
    );
  }
}
