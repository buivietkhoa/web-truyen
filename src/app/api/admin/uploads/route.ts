import { randomUUID, createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";

const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const maxUploadSize = 5 * 1024 * 1024;

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
}

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

function hasCloudinaryConfig() {
  return Boolean(
    cleanEnvValue(process.env.CLOUDINARY_CLOUD_NAME) &&
      cleanEnvValue(process.env.CLOUDINARY_API_KEY) &&
      cleanEnvValue(process.env.CLOUDINARY_API_SECRET)
  );
}

function createCloudinarySignature(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

async function uploadToCloudinary(file: File) {
  const cloudName = cleanEnvValue(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = cleanEnvValue(process.env.CLOUDINARY_API_KEY);
  const apiSecret = cleanEnvValue(process.env.CLOUDINARY_API_SECRET);

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Thiếu cấu hình Cloudinary.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = cleanEnvValue(process.env.CLOUDINARY_UPLOAD_FOLDER) || "web-truyen/covers";
  const publicId = `${Date.now()}-${randomUUID()}`;
  const signature = createCloudinarySignature(
    {
      folder,
      public_id: publicId,
      timestamp,
    },
    apiSecret
  );

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Không thể upload ảnh lên Cloudinary.");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    storage: "cloudinary",
  };
}

async function uploadToLocal(file: File, extension: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, bytes);

  return {
    url: `/uploads/${fileName}`,
    publicId: null,
    storage: "local",
  };
}

export async function POST(request: Request) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json(
      { message: "Bạn không có quyền quản trị." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Vui lòng chọn file ảnh bìa." },
        { status: 400 }
      );
    }

    const extension = allowedMimeTypes.get(file.type);

    if (!extension) {
      return NextResponse.json(
        { message: "Ảnh bìa phải là JPG, PNG, WEBP hoặc GIF." },
        { status: 400 }
      );
    }

    if (file.size > maxUploadSize) {
      return NextResponse.json(
        { message: "Ảnh bìa không được vượt quá 5MB." },
        { status: 400 }
      );
    }

    const uploadedImage = hasCloudinaryConfig()
      ? await uploadToCloudinary(file)
      : await uploadToLocal(file, extension);

    return NextResponse.json({
      message: "Upload ảnh bìa thành công.",
      ...uploadedImage,
    });
  } catch (error) {
    console.error("ADMIN_UPLOAD_ERROR", error);

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Lỗi server khi upload ảnh bìa." },
      { status: 500 }
    );
  }
}
