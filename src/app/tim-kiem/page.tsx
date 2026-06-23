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
        <section className="catalog-container">
          <div className="catalog-heading">
            <h1>Tìm kiếm truyện</h1>
            <p>Nhập tên truyện hoặc thể loại bạn muốn tìm.</p>
          </div>

          <form action="/tim-kiem" className="search-page-form">
            <FaSearch />
            <input name="q" defaultValue={q} placeholder="Tìm truyện..." />
            <button type="submit">Tìm kiếm</button>
          </form>

          <div className="search-result-head">
            {keyword ? (
              <p>Tìm thấy {results.length} kết quả cho &quot;{q}&quot;.</p>
            ) : (
              <p>Chưa có từ khóa tìm kiếm.</p>
            )}
          </div>

          {keyword && results.length === 0 ? (
            <div className="empty-state">
              <h2>Không tìm thấy truyện phù hợp</h2>
              <p>Thử tìm bằng thể loại hoặc một từ khóa ngắn hơn.</p>
              <Link href="/the-loai">Xem theo thể loại</Link>
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
