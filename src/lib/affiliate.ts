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

function getMarketplace(affiliateUrl: string): "shopee" | "tiktok" | "lazada" | null {
  try {
    const host = new URL(affiliateUrl).hostname.toLowerCase();
    if (host.includes("shopee")) return "shopee";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("lazada")) return "lazada";
  } catch { /* ok */ }
  return null;
}

/** Hash đơn giản để chọn sản phẩm cố định theo storyId */
function storyHash(storyId: string, salt: string): number {
  const str = storyId + salt;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Trả về đúng 3 sản phẩm cho story này: 1 Shopee + 1 TikTok + 1 Lazada
 * Mỗi story luôn nhận cùng 3 sản phẩm (deterministic theo storyId)
 */
export async function getTimedAffiliatePopupData(storyId: string) {
  const setting = await getAffiliateSetting();
  if (!setting?.enabled) return null;

  const products = await db.affiliateProduct.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, affiliateUrl: true, title: true, description: true, imageUrl: true },
  });

  if (products.length === 0) return null;

  // Nhóm theo sàn
  const groups: Record<"shopee" | "tiktok" | "lazada", typeof products> = {
    shopee: [], tiktok: [], lazada: [],
  };
  for (const p of products) {
    const mp = getMarketplace(p.affiliateUrl);
    if (mp) groups[mp].push(p);
  }

  // Chọn 1 sản phẩm mỗi sàn theo hash của storyId
  const selected = (["shopee", "tiktok", "lazada"] as const)
    .map((mp) => {
      const list = groups[mp];
      if (list.length === 0) return null;
      return list[storyHash(storyId, mp) % list.length];
    })
    .filter(Boolean) as typeof products;

  if (selected.length === 0) return null;

  return {
    effect: setting.effect,
    waitSeconds: setting.waitSeconds,
    products: selected.map((p) => ({
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
