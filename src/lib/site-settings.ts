import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const defaultSiteSetting = {
  siteName: "Mọt Chạm",
  siteDesc: "Website đọc truyện online",
  logoUrl: "",
  primaryColor: "#2563eb",
  contactEmail: "",
  footerText: "",
};

export const getSiteSetting = unstable_cache(
  async () => {
    try {
      const setting = await db.siteSetting.findFirst();
      return setting ?? defaultSiteSetting;
    } catch {
      return defaultSiteSetting;
    }
  },
  ["site-setting"],
  { revalidate: 3600, tags: ["site-setting"] }
);
