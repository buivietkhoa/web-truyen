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
  if (!("affiliateSetting" in db)) {
    return null;
  }

  return db.affiliateSetting.findFirst({
    orderBy: {
      updatedAt: "desc",
    },
  });
}
