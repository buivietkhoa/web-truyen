import type { Metadata } from "next";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import SearchTracker from "@/components/analytics/SearchTracker";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

interface Props {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Tìm kiếm truyện",
  description: "Tìm truyện theo tên truyện hoặc thể loại trên Một Chạm.",
  alternates: {
    canonical: absoluteUrl("/tim-kiem"),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function TimKiemPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const keyword = q.trim();
  const results = keyword
    ? await db.story.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { category: { contains: keyword, mode: "insensitive" } },
          ],
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    : [];

  return (
    <>
      <SiteHeader />
      {keyword && <SearchTracker query={keyword} />}

      <main className="search-page">
        <section className="search-page-container">

          {/* Kết quả tìm kiếm */}
          {keyword && (
            <p className="search-result-count">
              {results.length > 0
                ? `${results.length} kết quả cho "${q}"`
                : `Không tìm thấy kết quả cho "${q}"`}
            </p>
          )}

          {/* Kết quả */}
          {!keyword ? (
            <div className="search-empty-hint">
              <FaSearch />
              <p>Nhập tên truyện hoặc thể loại để bắt đầu tìm kiếm</p>
            </div>
          ) : results.length === 0 ? (
            <div className="search-empty-hint">
              <p>Không tìm thấy truyện phù hợp. Thử từ khóa khác hoặc <Link href="/the-loai">xem theo thể loại</Link>.</p>
            </div>
          ) : (
            <div className="catalog-story-grid">
              {results.map((story) => (
                <Link href={`/truyen/${story.slug}`} className="catalog-story-card" key={story.id}>
                  <img src={story.coverImage} alt={story.title} loading="lazy" />
                  <div>
                    <span>{story.category}</span>
                    <h2>{story.title}</h2>
                    <p>{story.status}</p>
                    <small>{story.views.toLocaleString("vi-VN")} lượt xem</small>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
