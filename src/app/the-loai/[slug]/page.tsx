import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { getCategoryBySlug } from "@/data/categories";
import { db } from "@/lib/db";

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

  const stories = await db.story.findMany({
    where: {
      category: category.name,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      chapters: {
        orderBy: {
          number: "desc",
        },
        take: 1,
      },
    },
  });

  return (
    <>
      <SiteHeader />

      <main className="catalog-page">
        <section className="catalog-container">
          <div className="catalog-heading">
            <Link href="/the-loai" className="catalog-back">{"<-"} Tất cả thể loại</Link>
            <h1>{category.name}</h1>
            <p>{stories.length} truyện thuộc thể loại {category.name}.</p>
          </div>

          {stories.length === 0 ? (
            <div className="empty-state">
              <h2>Chưa có truyện trong thể loại này</h2>
              <p>Admin chưa thêm truyện nào cho thể loại {category.name}.</p>
              <Link href="/admin/truyen">Vào quản trị truyện</Link>
            </div>
          ) : (
            <div className="catalog-story-grid">
              {stories.map((story) => (
                <Link href={`/truyen/${story.slug}`} className="catalog-story-card" key={story.id}>
                  <img src={story.coverImage} alt={story.title} loading="lazy" />
                  <div>
                    <span>{story.status}</span>
                    <h2>{story.title}</h2>
                    <p>{story.category}</p>
                    <small>{story.chapters[0] ? `Chương ${story.chapters[0].number}` : "Chưa có chương"}</small>
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
