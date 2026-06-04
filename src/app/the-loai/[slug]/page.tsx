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

          <div className="catalog-story-grid">
            {stories.map((truyen) => (
              <Link href={`/truyen/${truyen.id}`} className="catalog-story-card" key={truyen.id}>
                <img src={truyen.anhBia} alt={truyen.ten} />
                <div>
                  <span>{truyen.trangThai}</span>
                  <h2>{truyen.ten}</h2>
                  <p>{truyen.tacGia}</p>
                  <small>Chương {truyen.chuongs.at(-1)?.soChuong || truyen.chuongs.length}</small>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
