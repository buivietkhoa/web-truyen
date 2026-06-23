import type { Metadata } from "next";
import {
  FaBook,
  FaBookOpen,
  FaClock,
  FaEye,
  FaExchangeAlt,
  FaLayerGroup,
  FaSearch,
  FaUsers,
} from "react-icons/fa";
import AdminViewsChart from "@/components/admin/AdminViewsChart";
import AdminTopStoriesTable from "@/components/admin/AdminTopStoriesTable";
import AdminReportDetailCards from "@/components/admin/AdminReportDetailCards";
import { addUtcDays, getBangkokDateKey } from "@/lib/date";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Báo cáo - Mọt Admin",
};

function getTrend(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

function TrendBadge({ value }: { value: number }) {
  const direction = value > 0 ? "up" : value < 0 ? "down" : "neutral";
  return (
    <span className={`admin-report-trend ${direction}`}>
      {value > 0 ? "↑" : value < 0 ? "↓" : "–"} {Math.abs(value)}%
    </span>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(value);
}

export default async function AdminReportsPage() {
  const today = getBangkokDateKey();
  const firstChartDate = addUtcDays(today, -364);
  const thirtyDaysAgo = addUtcDays(today, -29);

  const [
    totalStories,
    totalChapters,
    totalUsers,
    totalViewsAgg,
    topStories,
    storiesByCategory,
    recentUsers,
    dailyViews,
    affiliateProducts,
    enabledAffiliateProducts,
    affiliateSetting,
    affiliateClicks30,
    readingViews30,
    nextChapterEvents30,
    readingDuration30,
    activeReaders30,
    topReadChapters,
    staleStories,
    topSearchTerms,
    topAffiliateStories,
  ] = await Promise.all([
    db.story.count(),
    db.chapter.count(),
    db.user.count(),
    db.story.aggregate({ _sum: { views: true } }),
    db.story.findMany({
      orderBy: { views: "desc" },
      take: 100,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        views: true,
        status: true,
        updatedAt: true,
        _count: { select: { chapters: true } },
      },
    }),
    db.story.groupBy({
      by: ["category"],
      _count: { id: true },
      _sum: { views: true },
      orderBy: { _sum: { views: "desc" } },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        authProvider: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    db.dailyView.findMany({
      where: { date: { gte: firstChartDate } },
      orderBy: { date: "asc" },
    }),
    db.affiliateProduct.count(),
    db.affiliateProduct.count({ where: { enabled: true } }),
    db.affiliateSetting.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { enabled: true },
    }),
    db.affiliateClick.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.readingEvent.count({ where: { eventType: "VIEW", createdAt: { gte: thirtyDaysAgo } } }),
    db.readingEvent.count({ where: { eventType: "NEXT_CHAPTER", createdAt: { gte: thirtyDaysAgo } } }),
    db.readingEvent.aggregate({ where: { eventType: "DURATION", createdAt: { gte: thirtyDaysAgo } }, _avg: { durationSeconds: true } }),
    db.readingEvent.findMany({
      where: { userId: { not: null }, createdAt: { gte: thirtyDaysAgo } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    db.readingEvent.groupBy({
      by: ["chapterId"],
      where: { eventType: "VIEW", createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    db.story.count({ where: { published: true, updatedAt: { lt: thirtyDaysAgo } } }),
    db.searchEvent.groupBy({
      by: ["query"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    db.affiliateClick.groupBy({
      by: ["storyId"],
      where: { storyId: { not: null }, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
  ]);

  const totalViews = totalViewsAgg._sum.views ?? 0;
  const chartData = Array.from({ length: 365 }, (_, index) => {
    const date = addUtcDays(firstChartDate, index);
    const entry = dailyViews.find((item) => item.date.getTime() === date.getTime());
    return {
      label: `${date.getUTCDate()}/${date.getUTCMonth() + 1}`,
      date: date.toISOString().slice(0, 10),
      count: entry?.count ?? 0,
    };
  });

  const current30 = chartData.slice(-30).reduce((sum, item) => sum + item.count, 0);
  const previous30 = chartData.slice(-60, -30).reduce((sum, item) => sum + item.count, 0);
  const current7 = chartData.slice(-7).reduce((sum, item) => sum + item.count, 0);
  const previous7 = chartData.slice(-14, -7).reduce((sum, item) => sum + item.count, 0);
  const [topReadChapter, topAffiliateStory] = await Promise.all([
    topReadChapters[0]
      ? db.chapter.findUnique({ where: { id: topReadChapters[0].chapterId }, select: { number: true, title: true, story: { select: { title: true } } } })
      : null,
    topAffiliateStories[0]?.storyId
      ? db.story.findUnique({ where: { id: topAffiliateStories[0].storyId }, select: { title: true } })
      : null,
  ]);
  const chapterConversion = readingViews30 > 0 ? Math.round((nextChapterEvents30 / readingViews30) * 100) : 0;
  const affiliateCtr = current30 > 0 ? ((affiliateClicks30 / current30) * 100).toFixed(1) : "0.0";
  const averageReadingMinutes = Math.round((readingDuration30._avg.durationSeconds ?? 0) / 60);

  return (
    <div className="admin-reports-page">
      <section className="admin-hero admin-report-hero">
        <div>
          <p className="admin-report-eyebrow">Phân tích hệ thống</p>
          <h2>Báo cáo tổng quan</h2>
          <p>Theo dõi nội dung, độc giả và hiệu quả vận hành bằng dữ liệu thực tế.</p>
        </div>
        <span className="admin-report-date">Cập nhật đến {formatDate(new Date())}</span>
      </section>

      <section className="admin-report-kpi-grid">
        <article className="admin-report-kpi tone-blue">
          <span className="admin-report-kpi-icon"><FaEye /></span>
          <div><small>Tổng lượt xem</small><strong>{totalViews.toLocaleString("vi-VN")}</strong></div>
          <span className="admin-report-kpi-note">Toàn bộ thư viện</span>
        </article>
        <article className="admin-report-kpi tone-green">
          <span className="admin-report-kpi-icon"><FaEye /></span>
          <div><small>7 ngày gần nhất</small><strong>{current7.toLocaleString("vi-VN")}</strong></div>
          <TrendBadge value={getTrend(current7, previous7)} />
        </article>
        <article className="admin-report-kpi tone-violet">
          <span className="admin-report-kpi-icon"><FaEye /></span>
          <div><small>30 ngày gần nhất</small><strong>{current30.toLocaleString("vi-VN")}</strong></div>
          <TrendBadge value={getTrend(current30, previous30)} />
        </article>
        <article className="admin-report-kpi tone-cyan">
          <span className="admin-report-kpi-icon"><FaBook /></span>
          <div><small>Tổng truyện</small><strong>{totalStories}</strong></div>
          <span className="admin-report-kpi-note">đầu truyện</span>
        </article>
        <article className="admin-report-kpi tone-orange">
          <span className="admin-report-kpi-icon"><FaLayerGroup /></span>
          <div><small>Tổng chương</small><strong>{totalChapters}</strong></div>
          <span className="admin-report-kpi-note">đã tạo</span>
        </article>
        <article className="admin-report-kpi tone-slate">
          <span className="admin-report-kpi-icon"><FaUsers /></span>
          <div><small>Người dùng</small><strong>{totalUsers}</strong></div>
          <span className="admin-report-kpi-note">tài khoản</span>
        </article>
      </section>

      <AdminViewsChart data={chartData} />

      <section className="admin-panel admin-reader-insights-panel">
        <div className="admin-panel-head">
          <div><p>Hành vi đọc</p><h2>Chỉ số độc giả trong 30 ngày</h2></div>
          <span>Dữ liệu từ lượt đọc thực tế</span>
        </div>
        <div className="admin-reader-insights-grid">
          <article><FaBookOpen /><div><small>Chương đọc nhiều nhất</small><strong>{topReadChapter ? `Chương ${topReadChapter.number}` : "Chưa có dữ liệu"}</strong><span>{topReadChapter?.story.title || "Bắt đầu ghi nhận từ hôm nay"}</span></div></article>
          <article><FaUsers /><div><small>Độc giả hoạt động</small><strong>{activeReaders30.length}</strong><span>người dùng đăng nhập</span></div></article>
          <article><FaClock /><div><small>Thời gian đọc TB</small><strong>{averageReadingMinutes} phút</strong><span>mỗi phiên đọc</span></div></article>
          <article><FaExchangeAlt /><div><small>Chuyển chương tiếp</small><strong>{chapterConversion}%</strong><span>{nextChapterEvents30}/{readingViews30} lượt đọc</span></div></article>
          <article><FaBook /><div><small>Truyện lâu chưa cập nhật</small><strong>{staleStories}</strong><span>quá 30 ngày</span></div></article>
          <article><FaSearch /><div><small>Từ khóa nổi bật</small><strong>{topSearchTerms[0]?.query || "Chưa có"}</strong><span>{topSearchTerms[0]?._count.id || 0} lượt tìm</span></div></article>
        </div>
      </section>

      <div className="admin-reports-grid">
        <AdminTopStoriesTable
          totalViews={totalViews}
          generatedAt={new Date().toISOString()}
          stories={topStories.map((story) => ({
            id: story.id,
            slug: story.slug,
            title: story.title,
            category: story.category,
            status: story.status,
            views: story.views,
            chapters: story._count.chapters,
            updatedAt: story.updatedAt.toISOString(),
          }))}
        />

        <AdminReportDetailCards
          categories={storiesByCategory.map((category) => {
            const views = category._sum.views ?? 0;
            return { name: category.category, stories: category._count.id, views, percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0 };
          })}
          users={recentUsers.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            active: user.active,
            provider: user.authProvider === "GOOGLE" ? "Google" : user.authProvider === "FACEBOOK" ? "Facebook" : "Email",
            joinedAt: formatDate(user.createdAt),
            lastLoginAt: user.lastLoginAt ? formatDate(user.lastLoginAt) : null,
          }))}
          affiliate={{ products: affiliateProducts, enabledProducts: enabledAffiliateProducts, clicks30: affiliateClicks30, ctr: affiliateCtr, topStory: topAffiliateStory?.title || "Chưa có", enabled: affiliateSetting?.enabled ?? false }}
        />
      </div>
    </div>
  );
}
