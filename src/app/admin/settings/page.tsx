import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt - Mọt Admin",
};

export default function AdminSettingsPage() {
  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <h2>Cài đặt</h2>
          <p>Khu vực cấu hình hệ thống, hiển thị website và thiết lập quản trị.</p>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-empty">
          <h3>Chưa có cấu hình riêng</h3>
          <p>Các thiết lập như logo, tên website và chính sách hiển thị có thể thêm ở bước tiếp theo.</p>
        </div>
      </section>
    </div>
  );
}
