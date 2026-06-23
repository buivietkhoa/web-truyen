export const defaultSiteName = "Một Chạm";
export const defaultSiteDescription = "Website đọc truyện online, cập nhật truyện mới và chương mới mỗi ngày.";

export function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  const withProtocol = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  return withProtocol.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateMeta(value: string, maxLength = 160) {
  const cleanValue = stripHtml(value);
  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, maxLength - 1).trim()}…`;
}
