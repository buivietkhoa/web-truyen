import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { categories } from "@/data/categories";
import { danhSachTruyen } from "@/data/truyen";

export const metadata: Metadata = {
  title: "Thể loại truyện - Mọt Chạm",
  description: "Khám phá truyện theo thể loại trên Mọt Chạm.",
};

export default function TheLoaiPage() {
  return (
    <>
      <SiteHeader />

      <main className="catalog-page">
        <section className="catalog-container">
          <div className="catalog-heading">
            <h1>Thể loại truyện</h1>
            <p>Chọn một thể loại để xem các truyện được phân nhóm đúng nội dung.</p>
          </div>

          <div className="category-page-grid">
            {categories.map((category) => {
              const count = danhSachTruyen.filter((truyen) => truyen.theLoai === category.name).length;

              return (
                <Link href={`/the-loai/${category.slug}`} className="category-page-card" key={category.slug}>
                  <span>{count} truyện</span>
                  <h2>{category.name}</h2>
                  <p>Xem danh sách truyện thuộc thể loại {category.name}.</p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
