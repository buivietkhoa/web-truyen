import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

function getCloudinaryConfig() {
  return {
    cloudName: cleanEnvValue(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: cleanEnvValue(process.env.CLOUDINARY_API_KEY),
    apiSecret: cleanEnvValue(process.env.CLOUDINARY_API_SECRET),
    uploadPreset: cleanEnvValue(process.env.CLOUDINARY_UPLOAD_PRESET),
    uploadFolder: cleanEnvValue(process.env.CLOUDINARY_UPLOAD_FOLDER) || "web-truyen/covers",
  };
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Không có quyền truy cập." }, { status: 403 });
  }

  const { cloudName, apiKey, apiSecret, uploadPreset, uploadFolder } = getCloudinaryConfig();

  if (!cloudName) {
    return NextResponse.json(
      { message: "Thiếu CLOUDINARY_CLOUD_NAME trên Vercel." },
      { status: 503 }
    );
  }

  // Unsigned preset — không cần ký
  if (uploadPreset) {
    return NextResponse.json({ cloudName, uploadPreset, folder: uploadFolder, signed: false });
  }

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { message: "Thiếu CLOUDINARY_API_KEY hoặc CLOUDINARY_API_SECRET trên Vercel." },
      { status: 503 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `${Date.now()}-${randomUUID()}`;

  const params: Record<string, string> = {
    folder: uploadFolder,
    public_id: publicId,
    timestamp,
  };

  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const signature = createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    publicId,
    folder: uploadFolder,
    signature,
    signed: true,
  });
}
