import type { Metadata } from "next";
import Link from "next/link";
import { FaBookOpen, FaEye, FaPlus, FaUsers } from "react-icons/fa";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Tổng quan - Mọt Admin",
};

export default async function AdminDashboardPage() {
  const [storyCount, chapterCount, userCount, totalViews, topStories, recentStories, recentUsers] = await Promise.all([
    db.story.count(),
    db.chapter.count(),
    db.user.count(),
    db.story.aggregate({
      _sum: {
        views: true,
      },
    }),
    db.story.findMany({
      orderBy: {
        views: "desc",
      },
      take: 5,
      include: {
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    }),
    db.story.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    }),
    db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const dbAny = db as any;
  const dailyViews: { date: Date; count: number }[] = dbAny.dailyView
    ? await dbAny.dailyView.findMany({ where: { date: { gte: sevenDaysAgo } } })
    : [];

  const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    return d;
  });
  const chartValues = chartDays.map((d) => {
    const entry = dailyViews.find((v) => v.date.getTime() === d.getTime());
    return entry?.count ?? 0;
  });
  const maxChartValue = Math.max(...chartValues, 1);
  const recentActivities = [
    ...recentStories.map((story) => ({
      title: `Thêm truyện: ${story.title}`,
      meta: `${story.category} - ${story.createdAt.toLocaleDateString("vi-VN")}`,
      icon: "book",
    })),
    ...recentUsers.map((user) => ({
      title: `User mới: ${user.name}`,
      meta: `${user.email} - ${user.createdAt.toLocaleDateString("vi-VN")}`,
      icon: "user",
    })),
  ].slice(0, 5);

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <h2>Bảng điều khiển hệ thống</h2>
          <p>Chào mừng trở lại, đây là hiệu suất nội dung truyện hôm nay.</p>
        </div>
        <div className="admin-hero-actions">
          <span>7 ngày qua</span>
          <Link href="/admin/truyen">Thêm truyện</Link>
        </div>
      </section>

      <section className="admin-stat-grid admin-stat-grid-four">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><FaBookOpen /></div>
          <span>Tổng truyện</span>
          <strong>{storyCount.toLocaleString("vi-VN")}</strong>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon violet"><FaPlus /></div>
          <span>Tổng chương</span>
          <strong>{chapterCount.toLocaleString("vi-VN")}</strong>
        </div>
        <div className="admin-stat-card active">
          <div className="admin-stat-icon gray"><FaEye /></div>
          <span>Tổng lượt xem</span>
          <strong>{(totalViews._sum.views || 0).toLocaleString("vi-VN")}</strong>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green"><FaUsers /></div>
          <span>Người dùng</span>
          <strong>{userCount.toLocaleString("vi-VN")}</strong>
        </div>
      </section>

      <section className="admin-dashboard-grid">
        <div className="admin-panel admin-chart-panel">
          <div className="admin-panel-head">
            <div>
              <h2>Lượt xem 7 ngày qua</h2>
            </div>
            <div className="admin-chart-legend">
              <span /> Lượt xem
            </div>
          </div>

          <div className="admin-bar-chart" aria-label="Biểu đồ lượt xem">
            {chartDays.map((day, index) => (
              <div className="admin-bar-item" key={index}>
                <div className="admin-bar-track">
                  <span style={{ height: `${Math.round((chartValues[index] / maxChartValue) * 100)}%` }} />
                </div>
                <small>{dayNames[day.getDay()]}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel admin-activity-panel">
          <div className="admin-panel-head">
            <div>
              <h2>Hoạt động gần đây</h2>
            </div>
            <Link href="/admin/truyen">Tất cả</Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="admin-empty compact">
              <h3>Chưa có hoạt động</h3>
              <p>Hoạt động mới sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="admin-activity-list">
              {recentActivities.map((item) => (
                <div className="admin-activity-item" key={`${item.title}-${item.meta}`}>
                  <span className={item.icon}>{item.icon === "book" ? "B" : "U"}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Top truyện nổi bật</h2>
          </div>
          <Link href="/admin/truyen">Quản lý truyện</Link>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Truyện</th>
                <th>Thể loại</th>
                <th>Chương</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {topStories.map((story) => (
                <tr key={story.id}>
                  <td>
                    <strong>{story.title}</strong>
                    <span>{story.slug}</span>
                  </td>
                  <td>{story.category}</td>
                  <td>{story._count.chapters}</td>
                  <td>{story.views.toLocaleString("vi-VN")}</td>
                  <td>{story.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
