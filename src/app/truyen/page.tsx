import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

const PER_PAGE = 20;

export const metadata: Metadata = {
  title: "Truyện mới cập nhật",
  description: "Danh sách truyện mới cập nhật tại Một Chạm.",
  alternates: {
    canonical: absoluteUrl("/truyen"),
  },
  openGraph: {
    title: "Truyện mới cập nhật - Một Chạm",
    description: "Theo dõi các truyện và chương mới nhất được cập nhật tại Một Chạm.",
    url: absoluteUrl("/truyen"),
  },
};

interface Props {
  searchParams: Promise<{ trang?: string }>;
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current <= 4) {
    pages.push(2, 3, 4, 5, "...", total);
  } else if (current >= total - 3) {
    pages.push("...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push("...", current - 1, current, current + 1, "...", total);
  }

  return pages;
}

export default async function DanhSachTruyenPage({ searchParams }: Props) {
  const { trang } = await searchParams;
  const page = Math.max(1, Number(trang) || 1);
  const skip = (page - 1) * PER_PAGE;

  const [stories, total] = await Promise.all([
    db.story.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      skip,
      take: PER_PAGE,
      include: {
        chapters: {
          where: { published: true },
          orderBy: { number: "desc" },
          take: 1,
        },
      },
    }),
    db.story.count({ where: { published: true } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE) || 1;
  const safePage = Math.min(page, totalPages);
  const pageList = buildPageList(safePage, totalPages);

  return (
    <>
      <SiteHeader activePage="updates" />

      <main className="updates-page">
        <section className="updates-container">
          <div className="updates-toolbar">
            <h1>Mới cập nhật</h1>
            {total > 0 && <span className="updates-count">{total} truyện</span>}
          </div>

          {stories.length === 0 ? (
            <div className="empty-state">
              <h2>Chưa có truyện nào</h2>
              <p>Admin có thể thêm truyện trong trang quản trị. Khi có dữ liệu, truyện sẽ xuất hiện ở đây.</p>
              <Link href="/admin/truyen">Vào quản trị truyện</Link>
            </div>
          ) : (
            <>
              <div className="updates-grid">
                {stories.map((story) => (
                  <Link href={`/truyen/${story.slug}`} className="update-card" key={story.id}>
                    <div className="update-cover image-skeleton">
                      <img src={story.coverImage} alt={story.title} loading="lazy" />
                      <span>{story.category.toUpperCase()}</span>
                    </div>

                    <div className="update-info">
                      <h2>{story.title}</h2>
                      <div>
                        <p>{story.chapters[0] ? `Chương ${story.chapters[0].number}` : "Chưa có chương"}</p>
                        <small>{story.updatedAt.toLocaleDateString("vi-VN")}</small>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="updates-pagination" aria-label="Phân trang">
                  {safePage > 1 ? (
                    <Link href={`/truyen?trang=${safePage - 1}`} aria-label="Trang trước">‹</Link>
                  ) : (
                    <span aria-disabled="true">‹</span>
                  )}

                  {pageList.map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
                    ) : (
                      <Link
                        key={p}
                        href={`/truyen?trang=${p}`}
                        className={p === safePage ? "active" : ""}
                        aria-current={p === safePage ? "page" : undefined}
                      >
                        {p}
                      </Link>
                    )
                  )}

                  {safePage < totalPages ? (
                    <Link href={`/truyen?trang=${safePage + 1}`} aria-label="Trang sau">›</Link>
                  ) : (
                    <span aria-disabled="true">›</span>
                  )}
                </nav>
              )}
            </>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
