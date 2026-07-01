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

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Trả về đúng 3 sản phẩm để hiện ở chương 2, 4, 6.
 * Ưu tiên lấy 1 sản phẩm từ mỗi sàn (Shopee, TikTok, Lazada).
 * Nếu thiếu sàn, lấy thêm ngẫu nhiên từ các sản phẩm còn lại.
 * Nếu tổng số sản phẩm < 3, cho phép lặp lại sản phẩm.
 */
export async function getTimedAffiliatePopupData() {
  const setting = await getAffiliateSetting();
  if (!setting?.enabled) return null;

  const products = await db.affiliateProduct.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, affiliateUrl: true, title: true, description: true, imageUrl: true },
  });

  if (products.length === 0) return null;

  const groups: Record<"shopee" | "tiktok" | "lazada", typeof products> = {
    shopee: [], tiktok: [], lazada: [],
  };
  for (const p of products) {
    const mp = getMarketplace(p.affiliateUrl);
    if (mp) groups[mp].push(p);
  }

  const selected: typeof products = [];
  const usedIds = new Set<string>();

  // Bước 1: lấy 1 ngẫu nhiên từ mỗi sàn có sản phẩm
  for (const mp of ["shopee", "tiktok", "lazada"] as const) {
    if (selected.length >= 3) break;
    if (groups[mp].length === 0) continue;
    const pick = pickRandom(groups[mp]);
    selected.push(pick);
    usedIds.add(pick.id);
  }

  // Bước 2: nếu chưa đủ 3, lấy thêm từ sản phẩm chưa dùng
  if (selected.length < 3) {
    const remaining = products.filter(p => !usedIds.has(p.id));
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    for (const p of remaining) {
      if (selected.length >= 3) break;
      selected.push(p);
    }
  }

  // Bước 3: nếu vẫn chưa đủ 3 (ít sản phẩm), cho phép lặp lại
  while (selected.length < 3) {
    selected.push(pickRandom(products));
  }

  return {
    effect: setting.effect,
    products: selected.map((p) => ({
      productId: p.id,
      affiliateUrl: p.affiliateUrl,
      title: p.title,
      description: p.description,
      bannerImage: p.imageUrl || null,
    })),
  };
}

