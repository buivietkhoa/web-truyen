import type { Metadata } from "next";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { danhSachTruyen } from "@/data/truyen";

interface Props {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Tìm kiếm truyện - Mọt Chạm",
  description: "Tìm truyện theo tên truyện, tác giả hoặc thể loại trên Mọt Chạm.",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default async function TimKiemPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const keyword = normalize(q);
  const results = keyword
    ? danhSachTruyen.filter((truyen) => {
        const haystack = normalize(`${truyen.ten} ${truyen.tacGia} ${truyen.theLoai}`);
        return haystack.includes(keyword);
      })
    : [];

  return (
    <>
      <SiteHeader />

      <main className="search-page">
        <section className="catalog-container">
          <div className="catalog-heading">
            <h1>Tìm kiếm truyện</h1>
            <p>Nhập tên truyện, tác giả hoặc thể loại bạn muốn tìm.</p>
          </div>

          <form action="/tim-kiem" className="search-page-form">
            <FaSearch />
            <input name="q" defaultValue={q} placeholder="Tìm truyện..." />
            <button type="submit">Tìm kiếm</button>
          </form>

          <div className="search-result-head">
            {keyword ? (
              <p>Tìm thấy {results.length} kết quả cho “{q}”.</p>
            ) : (
              <p>Chưa có từ khóa tìm kiếm.</p>
            )}
          </div>

          {keyword && results.length === 0 ? (
            <div className="empty-state">
              <h2>Không tìm thấy truyện phù hợp</h2>
              <p>Thử tìm bằng tên tác giả, thể loại hoặc một từ khóa ngắn hơn.</p>
              <Link href="/the-loai">Xem theo thể loại</Link>
            </div>
          ) : (
            <div className="catalog-story-grid">
              {results.map((truyen) => (
                <Link href={`/truyen/${truyen.id}`} className="catalog-story-card" key={truyen.id}>
                  <img src={truyen.anhBia} alt={truyen.ten} loading="lazy" />
                  <div>
                    <span>{truyen.theLoai}</span>
                    <h2>{truyen.ten}</h2>
                    <p>{truyen.tacGia}</p>
                    <small>{truyen.luotXem.toLocaleString("vi-VN")} lượt xem</small>
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
