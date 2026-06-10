import type { Metadata } from "next";
import { FaBookOpen, FaChartBar, FaEye, FaUsers } from "react-icons/fa";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Báo cáo - Mọt Admin",
};

export default async function AdminReportsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [
    totalStories,
    totalChapters,
    totalUsers,
    totalViewsAgg,
    topStories,
    storiesByCategory,
    recentUsers,
    dailyViews30,
  ] = await Promise.all([
    db.story.count(),
    db.chapter.count(),
    db.user.count(),
    db.story.aggregate({ _sum: { views: true } }),
    db.story.findMany({
      orderBy: { views: "desc" },
      take: 10,
      select: { id: true, title: true, category: true, views: true, status: true, _count: { select: { chapters: true } } },
    }),
    db.story.groupBy({ by: ["category"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    (db as any).dailyView
      ? (db as any).dailyView.findMany({ where: { date: { gte: thirtyDaysAgo } }, orderBy: { date: "asc" } })
      : Promise.resolve([] as { date: Date; count: number }[]),
  ]);
  const dailyViews30Typed = dailyViews30 as { date: Date; count: number }[];

  const totalViews = totalViewsAgg._sum.views ?? 0;

  // Build 30-day chart data
  const chartData: { label: string; count: number }[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo);
    d.setDate(thirtyDaysAgo.getDate() + i);
    const entry = dailyViews30Typed.find((v) => v.date.getTime() === d.getTime());
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      count: entry?.count ?? 0,
    };
  });

  const maxChart = Math.max(...chartData.map((d) => d.count), 1);

  // Views last 7 days
  const views7 = chartData.slice(-7).reduce((s, d) => s + d.count, 0);
  // Views last 30 days
  const views30 = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="admin-reports-page">
      {/* Header */}
      <section className="admin-hero">
        <div>
          <h2>Báo cáo</h2>
          <p>Tổng hợp lượt xem, truyện nổi bật và hoạt động hệ thống.</p>
        </div>
      </section>

      {/* Summary stats */}
      <section className="admin-stat-grid admin-stat-grid-four">
        <div className="admin-stat-card">
          <span>Tổng lượt xem</span>
          <strong>{totalViews.toLocaleString("vi-VN")}</strong>
        </div>
        <div className="admin-stat-card active">
          <span>Lượt xem 7 ngày</span>
          <strong>{views7.toLocaleString("vi-VN")}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Lượt xem 30 ngày</span>
          <strong>{views30.toLocaleString("vi-VN")}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Truyện / Chương / User</span>
          <strong>{totalStories} / {totalChapters} / {totalUsers}</strong>
        </div>
      </section>

      {/* 30-day chart */}
      <section className="admin-panel admin-report-chart-panel">
        <div className="admin-panel-head">
          <div><p>Biểu đồ</p><h2>Lượt xem 30 ngày qua</h2></div>
          <div className="admin-chart-legend"><span /><FaChartBar /> Lượt xem / ngày</div>
        </div>
        <div className="admin-report-bar-chart">
          {chartData.map((day, i) => (
            <div className="admin-report-bar-item" key={i} title={`${day.label}: ${day.count}`}>
              <div className="admin-report-bar-track">
                <span style={{ height: `${Math.round((day.count / maxChart) * 100)}%` }} />
              </div>
              {(i === 0 || i === 9 || i === 19 || i === 29) && (
                <small>{day.label}</small>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="admin-reports-grid">
        {/* Top stories */}
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div><p>Xếp hạng</p><h2>Top truyện lượt xem</h2></div>
            <FaEye style={{ color: "#94a3b8" }} />
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Truyện</th>
                  <th>Thể loại</th>
                  <th>Chương</th>
                  <th>Lượt xem</th>
                </tr>
              </thead>
              <tbody>
                {topStories.map((story, i) => (
                  <tr key={story.id}>
                    <td>
                      <span className={`admin-rank-badge ${i < 3 ? `top${i + 1}` : ""}`}>{i + 1}</span>
                    </td>
                    <td>
                      <strong>{story.title}</strong>
                      <span className={`admin-status-pill ${story.status === "Hoàn thành" ? "done" : "updating"}`} style={{ marginTop: 4 }}>
                        {story.status}
                      </span>
                    </td>
                    <td>{story.category}</td>
                    <td>{story._count.chapters}</td>
                    <td><strong style={{ color: "#2563eb" }}>{story.views.toLocaleString("vi-VN")}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="admin-reports-right">
          {/* Category breakdown */}
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div><p>Phân tích</p><h2>Thể loại</h2></div>
              <FaBookOpen style={{ color: "#94a3b8" }} />
            </div>
            <div className="admin-category-bars">
              {storiesByCategory.map((cat) => (
                <div className="admin-category-bar-row" key={cat.category}>
                  <span className="admin-category-bar-name">{cat.category}</span>
                  <div className="admin-category-bar-track">
                    <div
                      className="admin-category-bar-fill"
                      style={{ width: `${totalStories > 0 ? Math.round((cat._count.id / totalStories) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="admin-category-bar-count">{cat._count.id}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent users */}
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div><p>Mới nhất</p><h2>Người dùng gần đây</h2></div>
              <FaUsers style={{ color: "#94a3b8" }} />
            </div>
            <div className="admin-recent-users">
              {recentUsers.map((user) => (
                <div className="admin-recent-user-row" key={user.id}>
                  <span className="admin-recent-user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <span className={`admin-role-pill ${user.role === "ADMIN" ? "admin" : "user"}`}>
                    {user.role === "ADMIN" ? "Admin" : "User"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
