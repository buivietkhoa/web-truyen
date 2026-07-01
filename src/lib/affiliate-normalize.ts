export function normalizeExternalUrl(value: unknown): string {
  const rawUrl = typeof value === "string" ? value : "";
  const cleanedUrl = rawUrl
    .trim()
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, "");

  if (!cleanedUrl) return "";

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

export function normalizeImageUrl(value: unknown): string {
  const rawUrl = typeof value === "string" ? value : "";
  const cleanedUrl = rawUrl
    .trim()
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, "");

  if (!cleanedUrl) return "";

  if (cleanedUrl.startsWith("/uploads/")) return cleanedUrl;

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
