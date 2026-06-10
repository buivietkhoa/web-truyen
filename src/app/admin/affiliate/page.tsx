import type { Metadata } from "next";
import AdminAffiliateForm from "@/components/admin/AdminAffiliateForm";
import { defaultAffiliateSetting, getAffiliateProducts, getAffiliateSetting } from "@/lib/affiliate";

export const metadata: Metadata = {
  title: "Cấu hình Affiliate - Mọt Admin",
};

export default async function AdminAffiliatePage() {
  const setting = await getAffiliateSetting();
  const products = await getAffiliateProducts();

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <h2>Cấu hình Affiliate</h2>
          <p>Thiết lập quảng cáo và modal gate hiển thị khi người đọc mở chương truyện.</p>
        </div>
      </section>

      <AdminAffiliateForm
        initialSetting={{
          affiliateUrl: setting?.affiliateUrl || defaultAffiliateSetting.affiliateUrl,
          buttonText: setting?.buttonText || defaultAffiliateSetting.buttonText,
          title: setting?.title || defaultAffiliateSetting.title,
          description: setting?.description || defaultAffiliateSetting.description,
          bannerImage: setting?.bannerImage || defaultAffiliateSetting.bannerImage,
          buttonColor: setting?.buttonColor || defaultAffiliateSetting.buttonColor,
          waitSeconds: setting?.waitSeconds ?? defaultAffiliateSetting.waitSeconds,
          fontSize: setting?.fontSize ?? defaultAffiliateSetting.fontSize,
          effect: setting?.effect || defaultAffiliateSetting.effect,
          enabled: setting?.enabled ?? defaultAffiliateSetting.enabled,
        }}
        initialProducts={products.map((product) => ({
          id: product.id,
          title: product.title,
          description: product.description,
          affiliateUrl: product.affiliateUrl,
          imageUrl: product.imageUrl,
          enabled: product.enabled,
        }))}
      />
    </div>
  );
}
