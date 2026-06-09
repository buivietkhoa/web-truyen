import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaBookOpen, FaEye, FaStar } from "react-icons/fa";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = await db.story.findUnique({
    where: {
      slug: id,
    },
  });

  if (!story) {
    return {
      title: "Không tìm thấy truyện - Mọt Chạm",
    };
  }

  const description = stripHtml(story.description);

  return {
    title: `${story.title} - Mọt Chạm`,
    description,
    openGraph: {
      title: `${story.title} - Mọt Chạm`,
      description,
      images: [story.coverImage],
    },
  };
}

export default async function ChiTietTruyenPage({ params }: Props) {
  const { id } = await params;
  const story = await db.story.findUnique({
    where: {
      slug: id,
    },
    include: {
      chapters: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  if (!story) {
    notFound();
  }

  const relatedStories = await db.story.findMany({
    where: {
      category: story.category,
      id: {
        not: story.id,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
  });

  const firstChapter = story.chapters[0];
  const latestChapter = story.chapters.at(-1);

  return (
    <>
      <SiteHeader />

      <main className="story-detail-page">
        <div className="container detail-container">
          <nav className="story-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span>{">"}</span>
            <Link href="/the-loai">{story.category}</Link>
            <span>{">"}</span>
            <strong>{story.title}</strong>
          </nav>

          <section className="story-hero">
            <div className="story-cover image-skeleton">
              <img src={story.coverImage} alt={story.title} loading="lazy" />
            </div>

            <div className="story-main-info">
              <div className="story-tags">
                <span>{story.status}</span>
                <span>{story.category}</span>
              </div>

              <h1>{story.title}</h1>

              <div className="story-meta">
                <span>{story.category}</span>
                <span>
                  <FaEye /> {story.views.toLocaleString("vi-VN")} lượt xem
                </span>
                <span>
                  <FaStar /> Chưa có đánh giá
                </span>
              </div>

              <div className="story-actions">
                {firstChapter ? (
                  <Link href={`/doc-truyen/${story.slug}/${firstChapter.id}`} className="btn btn-primary">
                    <FaBookOpen />
                    Đọc từ đầu
                  </Link>
                ) : (
                  <span className="btn btn-outline-primary disabled">Chưa có chương</span>
                )}

                {latestChapter && (
                  <Link href={`/doc-truyen/${story.slug}/${latestChapter.id}`} className="btn btn-outline-primary">
                    Mới nhất: Chương {latestChapter.number}
                  </Link>
                )}
              </div>

              <div className="story-summary">
                <h2>Tóm tắt nội dung</h2>
                <div
                  className="story-summary-content"
                  dangerouslySetInnerHTML={{ __html: story.description }}
                />
              </div>
            </div>
          </section>

          <section className="story-content-grid">
            <div id="chapters" className="chapter-panel">
              <div className="chapter-panel-header">
                <h2>Danh sách chương</h2>
                <span>Tổng cộng: {story.chapters.length} chương</span>
              </div>

              {story.chapters.length === 0 ? (
                <div className="empty-state">
                  <h2>Chưa có chương</h2>
                  <p>Admin có thể thêm chương cho truyện này trong trang quản trị.</p>
                  <Link href="/admin/truyen">Vào quản trị truyện</Link>
                </div>
              ) : (
                <div className="chapter-list">
                  {story.chapters.map((chapter) => (
                    <Link href={`/doc-truyen/${story.slug}/${chapter.id}`} className="chapter-row" key={chapter.id}>
                      <span>
                        Chương {chapter.number}: {chapter.title}
                      </span>
                      <small>{chapter.createdAt.toLocaleDateString("vi-VN")}</small>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <aside className="story-sidebar">
              <div className="related-box">
                <h2>Truyện cùng thể loại</h2>

                {relatedStories.length === 0 ? (
                  <p>Chưa có truyện cùng thể loại.</p>
                ) : (
                  relatedStories.map((item) => (
                    <Link href={`/truyen/${item.slug}`} className="related-item" key={item.id}>
                      <img src={item.coverImage} alt={item.title} loading="lazy" />
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.category}</p>
                        <span>{item.status}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </aside>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
