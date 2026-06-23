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
  try {
    const setting = await db.siteSetting.findFirst();
    return setting ?? defaultSiteSetting;
  } catch (firstError) {
    // Neon can close an idle pooled connection; retry once with a fresh checkout.
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const setting = await db.siteSetting.findFirst();
      return setting ?? defaultSiteSetting;
    } catch (retryError) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Unable to load site settings after retry", {
          firstError,
          retryError,
        });
      }

      return defaultSiteSetting;
    }
  }
});
