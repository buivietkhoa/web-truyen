import { db } from "@/lib/db";

export const defaultAffiliateSetting = {
  affiliateUrl: "",
  buttonText: "Mua ngay",
  title: "Ưu đãi độc quyền",
  description: "Sản phẩm đang được giảm giá tại sàn liên kết.",
  bannerImage: "",
  buttonColor: "#0b2fa3",
  waitSeconds: 3,
  fontSize: 16,
  effect: "fade",
  enabled: true,
};

export async function getAffiliateSetting() {
  return db.affiliateSetting.findFirst({ orderBy: { updatedAt: "desc" } });
}

export async function getAffiliateProducts() {
  return db.affiliateProduct.findMany({ orderBy: { updatedAt: "desc" } });
}

function getMarketplaceRank(affiliateUrl: string) {
  try {
    const hostname = new URL(affiliateUrl).hostname.toLowerCase();

    if (hostname.includes("shopee")) return 0;
    if (hostname.includes("tiktok")) return 1;
    if (hostname.includes("lazada")) return 2;
  } catch {
    // Invalid URLs are already rejected by the admin API. Keep a fallback rank
    // so legacy rows cannot break the reader page.
  }

  return 3;
}

export async function getTimedAffiliatePopupData() {
  const setting = await getAffiliateSetting();
  if (!setting?.enabled) return null;

  const products = await db.affiliateProduct.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      affiliateUrl: true,
      title: true,
      description: true,
      imageUrl: true,
    },
  });

  if (products.length === 0) return null;

  const orderedProducts = products.sort((first, second) => {
    return getMarketplaceRank(first.affiliateUrl) - getMarketplaceRank(second.affiliateUrl);
  });

  return {
    waitSeconds: setting.waitSeconds,
    effect: setting.effect,
    products: orderedProducts.map((p) => ({
      productId: p.id,
      affiliateUrl: p.affiliateUrl,
      title: p.title,
      description: p.description,
      bannerImage: p.imageUrl || null,
    })),
  };
}

export async function getRandomAffiliateGateSetting() {
  const setting = await getAffiliateSetting();

  if (!setting?.enabled) return null;

  const products = await db.affiliateProduct.findMany({
    where: { enabled: true },
    select: {
      id: true,
      affiliateUrl: true,
      title: true,
      description: true,
      imageUrl: true,
    },
  });

  if (products.length === 0) return null;

  const product = products[Math.floor(Math.random() * products.length)];

  return {
    productId: product.id,
    affiliateUrl: product.affiliateUrl,
    title: product.title,
    description: product.description,
    bannerImage: product.imageUrl,
    waitSeconds: setting.waitSeconds,
    effect: setting.effect,
  };
}
