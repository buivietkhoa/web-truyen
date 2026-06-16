import type { Metadata } from "next";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { getSiteSetting } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Cài đặt - Mọt Admin",
};

export default async function AdminSettingsPage() {
  const setting = await getSiteSetting();

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
