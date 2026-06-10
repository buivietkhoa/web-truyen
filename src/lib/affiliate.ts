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

export async function getRandomAffiliateGateSetting() {
  const setting = await getAffiliateSetting();

  if (!setting?.enabled) return null;

  const products = await db.affiliateProduct.findMany({
    where: { enabled: true },
    select: {
      affiliateUrl: true,
      title: true,
      description: true,
      imageUrl: true,
    },
  });

  if (products.length === 0) return null;

  const product = products[Math.floor(Math.random() * products.length)];

  return {
    affiliateUrl: product.affiliateUrl,
    title: product.title,
    description: product.description,
    bannerImage: product.imageUrl,
    waitSeconds: setting.waitSeconds,
    effect: setting.effect,
  };
}
