import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { categories } from "@/data/categories";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Thể loại truyện",
  description: "Khám phá truyện theo thể loại trên Một Chạm.",
  alternates: {
    canonical: absoluteUrl("/the-loai"),
  },
  openGraph: {
    title: "Thể loại truyện - Một Chạm",
    description: "Khám phá truyện tiên hiệp, kiếm hiệp, ngôn tình, xuyên không và nhiều thể loại khác.",
    url: absoluteUrl("/the-loai"),
  },
};

export default async function TheLoaiPage() {
  const counts = await db.story.groupBy({
    by: ["category"],
    where: {
      published: true,
    },
    _count: {
      _all: true,
    },
  });

  const countMap = new Map(counts.map((item) => [item.category, item._count._all]));

  return (
    <>
      <SiteHeader />

      <main className="catalog-page">
        <section className="catalog-container">
          <div className="catalog-heading">
            <h1>Thể loại truyện</h1>
            <p>Chọn một thể loại để xem các truyện admin đã phân nhóm.</p>
          </div>

          <div className="category-page-grid">
            {categories.map((category) => {
              const count = countMap.get(category.name) || 0;

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
