import type { Metadata } from "next";
import Link from "next/link";
import { FaBookOpen, FaEye, FaLayerGroup, FaPlus, FaUsers } from "react-icons/fa";
import AdminDashboardPeriodFilter from "@/components/admin/AdminDashboardPeriodFilter";
import AdminRecentActivityPanel from "@/components/admin/AdminRecentActivityPanel";
import AdminTopStoriesTable from "@/components/admin/AdminTopStoriesTable";
import AdminViewsChart from "@/components/admin/AdminViewsChart";
import { addUtcDays, getBangkokDateKey } from "@/lib/date";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Tổng quan - Mọt Admin" };

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

function parseDate(value: string | undefined, fallback: Date) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function trend(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

function DashboardTrend({ value }: { value: number }) {
  return <span className={`admin-dashboard-trend ${value > 0 ? "up" : value < 0 ? "down" : "neutral"}`}>{value > 0 ? "↑" : value < 0 ? "↓" : "–"} {Math.abs(value)}%</span>;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(value);
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const today = getBangkokDateKey();
  const range = ["today", "7", "30", "90", "custom"].includes(params.range || "") ? params.range! : "7";
  const presetDays = range === "today" ? 1 : range === "custom" ? 7 : Number(range);
  let start = range === "custom" ? parseDate(params.from, addUtcDays(today, -6)) : addUtcDays(today, -(presetDays - 1));
  let end = range === "custom" ? parseDate(params.to, today) : today;
  if (start > end) [start, end] = [end, start];
  const selectedDays = Math.min(365, Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1));
  start = addUtcDays(end, -(selectedDays - 1));
  const endExclusive = addUtcDays(end, 1);
  const previousStart = addUtcDays(start, -selectedDays);
  const periodLabel = range === "today" ? "hôm nay" : range === "custom" ? `từ ${start.getUTCDate()}/${start.getUTCMonth() + 1} đến ${end.getUTCDate()}/${end.getUTCMonth() + 1}` : `${selectedDays} ngày qua`;

  const [
    storyCount,
    chapterCount,
    userCount,
    newStories,
    previousStories,
    newChapters,
    previousChapters,
    newUsers,
    previousUsers,
    dailyViews,
    topStories,
    recentStories,
    recentChapters,
    recentUsers,
  ] = await Promise.all([
    db.story.count(),
    db.chapter.count(),
    db.user.count(),
    db.story.count({ where: { createdAt: { gte: start, lt: endExclusive } } }),
    db.story.count({ where: { createdAt: { gte: previousStart, lt: start } } }),
    db.chapter.count({ where: { createdAt: { gte: start, lt: endExclusive } } }),
    db.chapter.count({ where: { createdAt: { gte: previousStart, lt: start } } }),
    db.user.count({ where: { createdAt: { gte: start, lt: endExclusive } } }),
    db.user.count({ where: { createdAt: { gte: previousStart, lt: start } } }),
    db.dailyView.findMany({ where: { date: { gte: previousStart, lt: endExclusive } }, orderBy: { date: "asc" } }),
    db.story.findMany({
      where: { updatedAt: { gte: start, lt: endExclusive } },
      orderBy: { views: "desc" },
      take: 100,
      select: { id: true, slug: true, title: true, category: true, status: true, views: true, updatedAt: true, _count: { select: { chapters: true } } },
    }),
    db.story.findMany({ where: { createdAt: { gte: start, lt: endExclusive } }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, slug: true, title: true, createdAt: true } }),
    db.chapter.findMany({ where: { createdAt: { gte: start, lt: endExclusive } }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, number: true, title: true, createdAt: true, story: { select: { slug: true, title: true } } } }),
    db.user.findMany({ where: { createdAt: { gte: start, lt: endExclusive } }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, name: true, createdAt: true, authProvider: true } }),
  ]);

  const chartDays = Array.from({ length: selectedDays }, (_, index) => addUtcDays(start, index));
  const weekdayNames = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const chartData = chartDays.map((day) => ({
    date: dateKey(day),
    label: `${String(day.getUTCDate()).padStart(2, "0")}/${String(day.getUTCMonth() + 1).padStart(2, "0")}`,
    tooltipLabel: `${weekdayNames[day.getUTCDay()]} ${String(day.getUTCDate()).padStart(2, "0")}/${String(day.getUTCMonth() + 1).padStart(2, "0")}`,
    count: dailyViews.find((item) => item.date.getTime() === day.getTime())?.count ?? 0,
  }));
  const currentViews = chartData.reduce((sum, item) => sum + item.count, 0);
  const previousViews = dailyViews.filter((item) => item.date >= previousStart && item.date < start).reduce((sum, item) => sum + item.count, 0);

  const activities = [
    ...recentStories.map((item) => ({ id: `story-${item.id}`, date: item.createdAt, type: "book" as const, title: `Thêm truyện: ${item.title}`, actor: "Quản trị viên", href: `/truyen/${item.slug}` })),
    ...recentChapters.map((item) => ({ id: `chapter-${item.id}`, date: item.createdAt, type: "edit" as const, title: `Đăng chương ${item.number}: ${item.title}`, actor: "Quản trị viên", href: `/doc-truyen/${item.story.slug}/${item.id}` })),
    ...recentUsers.map((item) => ({ id: `user-${item.id}`, date: item.createdAt, type: "user" as const, title: `Người dùng mới: ${item.name}`, actor: item.authProvider === "GOOGLE" ? "Google" : item.authProvider === "FACEBOOK" ? "Facebook" : "Email", href: "/admin/users" })),
  ].sort((first, second) => second.date.getTime() - first.date.getTime()).slice(0, 15).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    actor: item.actor,
    href: item.href,
    dateLabel: formatDateTime(item.date),
  }));

  return (
    <div className="admin-page admin-dashboard-page">
      <section className="admin-hero">
        <div><h2>Bảng điều khiển hệ thống</h2><p>Theo dõi hiệu suất nội dung và hoạt động của website trong {periodLabel}.</p></div>
        <div className="admin-hero-actions"><AdminDashboardPeriodFilter range={range} from={dateKey(start)} to={dateKey(end)} /><Link href="/admin/truyen"><FaPlus /> Thêm truyện</Link></div>
      </section>

      <section className="admin-stat-grid admin-stat-grid-four admin-dashboard-stats">
        <Link href="/admin/truyen" className="admin-stat-card"><div className="admin-stat-icon blue"><FaBookOpen /></div><span>Tổng truyện</span><strong>{storyCount}</strong><small>+{newStories} trong kỳ</small><DashboardTrend value={trend(newStories, previousStories)} /></Link>
        <Link href="/admin/truyen" className="admin-stat-card"><div className="admin-stat-icon violet"><FaLayerGroup /></div><span>Tổng chương</span><strong>{chapterCount}</strong><small>+{newChapters} trong kỳ</small><DashboardTrend value={trend(newChapters, previousChapters)} /></Link>
        <Link href="/admin/reports" className="admin-stat-card active"><div className="admin-stat-icon gray"><FaEye /></div><span>Lượt truy cập trong kỳ</span><strong>{currentViews}</strong><small>So với kỳ trước</small><DashboardTrend value={trend(currentViews, previousViews)} /></Link>
        <Link href="/admin/users" className="admin-stat-card"><div className="admin-stat-icon green"><FaUsers /></div><span>Người dùng</span><strong>{userCount}</strong><small>+{newUsers} trong kỳ</small><DashboardTrend value={trend(newUsers, previousUsers)} /></Link>
      </section>

      <section className="admin-dashboard-grid">
        <AdminViewsChart data={chartData} fixedRange fixedTitle={`Lượt truy cập trong ${periodLabel}`} />
        <AdminRecentActivityPanel activities={activities} />
      </section>

      <AdminTopStoriesTable
        generatedAt={endExclusive.toISOString()}
        totalViews={currentViews}
        title="Top truyện có lượt xem cao nhất"
        stories={topStories.map((story) => ({ id: story.id, slug: story.slug, title: story.title, category: story.category, status: story.status, views: story.views, chapters: story._count.chapters, updatedAt: story.updatedAt.toISOString() }))}
      />
    </div>
  );
}
