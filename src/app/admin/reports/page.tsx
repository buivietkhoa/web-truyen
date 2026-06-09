import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Báo cáo - Mọt Admin",
};

export default function AdminReportsPage() {
  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <h2>Báo cáo</h2>
          <p>Khu vực báo cáo sẽ dùng để tổng hợp lượt xem, truyện nổi bật và hoạt động hệ thống.</p>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-empty">
          <h3>Chưa có báo cáo chi tiết</h3>
          <p>Có thể mở rộng phần này sau khi hoàn thiện tracking lượt đọc và lịch sử hoạt động.</p>
        </div>
      </section>
    </div>
  );
}
