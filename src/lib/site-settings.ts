import { cache } from "react";
import { db } from "@/lib/db";

export const defaultSiteSetting = {
  siteName: "Mọt Chạm",
  siteDesc: "Website đọc truyện online",
  logoUrl: "",
  primaryColor: "#2563eb",
  contactEmail: "",
  footerText: "",
};

export const getSiteSetting = cache(async () => {
  const setting = await db.siteSetting.findFirst();
  return setting ?? defaultSiteSetting;
});
