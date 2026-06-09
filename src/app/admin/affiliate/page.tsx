import type { Metadata } from "next";
import AdminAffiliateForm from "@/components/admin/AdminAffiliateForm";
import { defaultAffiliateSetting, getAffiliateSetting } from "@/lib/affiliate";

export const metadata: Metadata = {
  title: "Cấu hình Affiliate - Mọt Admin",
};

export default async function AdminAffiliatePage() {
  const setting = await getAffiliateSetting();

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <h2>Cấu hình Affiliate Marketing</h2>
          <p>Quản lý link affiliate, banner và modal hiển thị trong trang đọc truyện.</p>
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
      />
    </div>
  );
}
