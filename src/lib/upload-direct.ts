interface SignResponse {
  cloudName: string;
  signed: boolean;
  uploadPreset?: string;
  folder?: string;
  apiKey?: string;
  timestamp?: string;
  publicId?: string;
  signature?: string;
}

interface CloudinaryResult {
  secure_url?: string;
  error?: { message?: string };
}

/**
 * Upload ảnh thẳng từ browser lên Cloudinary (bỏ qua giới hạn 4.5MB của Vercel).
 * Bước 1: lấy chữ ký từ /api/admin/uploads/sign
 * Bước 2: POST trực tiếp đến Cloudinary API
 */
export async function uploadImageDirect(file: File): Promise<string> {
  const signRes = await fetch("/api/admin/uploads/sign");
  if (!signRes.ok) {
    let msg = "Thiếu cấu hình upload ảnh.";
    try {
      const d = await signRes.json();
      if (typeof d.message === "string") msg = d.message;
    } catch { /* ok */ }
    throw new Error(msg);
  }

  const sign = (await signRes.json()) as SignResponse;

  const formData = new FormData();
  formData.append("file", file);

  if (sign.signed) {
    formData.append("api_key", sign.apiKey!);
    formData.append("timestamp", sign.timestamp!);
    formData.append("public_id", sign.publicId!);
    formData.append("folder", sign.folder!);
    formData.append("signature", sign.signature!);
  } else {
    formData.append("upload_preset", sign.uploadPreset!);
    if (sign.folder) formData.append("folder", sign.folder);
  }

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = (await uploadRes.json()) as CloudinaryResult;

  if (!uploadRes.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Cloudinary không thể nhận ảnh.");
  }

  return data.secure_url;
}
