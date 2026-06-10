import type { Metadata } from "next";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Cài đặt - Mọt Admin",
};

const defaultSetting = {
  siteName: "Mọt Chạm",
  siteDesc: "Website đọc truyện online",
  logoUrl: "",
  primaryColor: "#2563eb",
  contactEmail: "",
  footerText: "",
};

export default async function AdminSettingsPage() {
  const dbAny = db as any;
  const list = dbAny.siteSetting ? await dbAny.siteSetting.findMany({ take: 1 }) : [];
  const setting = list[0] ?? defaultSetting;

  return (
    <div className="admin-settings-page">
      <section className="admin-hero">
        <div>
          <h2>Cài đặt</h2>
          <p>Cấu hình tên website, logo, màu sắc và thông tin chung.</p>
        </div>
      </section>

      <section className="admin-panel">
        <AdminSettingsForm initialSetting={setting} />
      </section>
    </div>
  );
}
