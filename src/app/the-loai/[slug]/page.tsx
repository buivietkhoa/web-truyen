import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { getCategoryBySlug } from "@/data/categories";
import { danhSachTruyen } from "@/data/truyen";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Không tìm thấy thể loại - Mọt Chạm",
    };
  }

  return {
    title: `${category.name} - Mọt Chạm`,
    description: `Danh sách truyện thuộc thể loại ${category.name} trên Mọt Chạm.`,
  };
}

export default async function ChiTietTheLoaiPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const stories = danhSachTruyen.filter((truyen) => truyen.theLoai === category.name);

  return (
    <>
      <SiteHeader />

      <main className="catalog-page">
        <section className="catalog-container">
          <div className="catalog-heading">
            <Link href="/the-loai" className="catalog-back">← Tất cả thể loại</Link>
            <h1>{category.name}</h1>
            <p>{stories.length} truyện thuộc thể loại {category.name}.</p>
          </div>

          {stories.length === 0 ? (
            <div className="empty-state">
              <h2>Chưa có truyện trong thể loại này</h2>
              <p>Bạn có thể quay lại danh sách thể loại để tìm truyện khác.</p>
              <Link href="/the-loai">Xem tất cả thể loại</Link>
            </div>
          ) : (
            <div className="catalog-story-grid">
              {stories.map((truyen) => (
                <Link href={`/truyen/${truyen.id}`} className="catalog-story-card" key={truyen.id}>
                  <img src={truyen.anhBia} alt={truyen.ten} loading="lazy" />
                  <div>
                    <span>{truyen.trangThai}</span>
                    <h2>{truyen.ten}</h2>
                    <p>{truyen.tacGia}</p>
                    <small>Chương {truyen.chuongs.at(-1)?.soChuong || truyen.chuongs.length}</small>
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
