import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaBookOpen, FaChevronDown, FaEye, FaStar } from "react-icons/fa";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import FavoriteButton from "@/components/story/FavoriteButton";
import RelatedStoriesCarousel from "@/components/story/RelatedStoriesCarousel";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeRichContent } from "@/lib/sanitize-content";
import { absoluteUrl, truncateMeta } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site-settings";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const siteSetting = await getSiteSetting();
  const story = await db.story.findFirst({
    where: {
      slug: id,
      published: true,
    },
  });

  if (!story) {
    return {
      title: `Không tìm thấy truyện - ${siteSetting.siteName}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    truncateMeta(story.description) ||
    `Đọc ${story.title} mới nhất, cập nhật chương nhanh tại ${siteSetting.siteName}.`;
  const url = absoluteUrl(`/truyen/${story.slug}`);

  return {
    title: `${story.title} - ${siteSetting.siteName}`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title: `${story.title} - ${siteSetting.siteName}`,
      description,
      url,
      siteName: siteSetting.siteName,
      images: [{ url: story.coverImage, alt: story.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${story.title} - ${siteSetting.siteName}`,
      description,
      images: [story.coverImage],
    },
  };
}

export default async function ChiTietTruyenPage({ params }: Props) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const story = await db.story.findFirst({
    where: {
      slug: id,
      published: true,
    },
    include: {
      chapters: {
        where: {
          published: true,
        },
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
      published: true,
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
  const favorite = currentUser
    ? await db.favorite.findUnique({
        where: { userId_storyId: { userId: currentUser.id, storyId: story.id } },
        select: { id: true },
      })
    : null;

  return (
    <>
      <SiteHeader />

      <main className="story-detail-page">
        <div className="container detail-container">
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

                <FavoriteButton
                  storyId={story.id}
                  initialFavorite={Boolean(favorite)}
                  isLoggedIn={Boolean(currentUser)}
                />
              </div>

              <div className="story-summary">
                <h2>Tóm tắt nội dung</h2>
                <div
                  className="story-summary-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichContent(story.description) }}
                />
              </div>
            </div>
          </section>

          <section className="story-content-grid">
            <div id="chapters" className="chapter-panel">
              {story.chapters.length === 0 ? (
                <>
                  <div className="chapter-panel-header">
                    <h2>Danh sách chương</h2>
                    <span>0 chương</span>
                  </div>
                  <div className="empty-state">
                    <h2>Chưa có chương</h2>
                    <p>Admin có thể thêm chương cho truyện này trong trang quản trị.</p>
                    <Link href="/admin/truyen">Vào quản trị truyện</Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="chapter-desktop-list">
                    <div className="chapter-panel-header">
                      <h2>Danh sách chương</h2>
                      <span>Tổng cộng: {story.chapters.length} chương</span>
                    </div>

                    <div className="chapter-list">
                      {story.chapters.map((chapter) => (
                        <Link href={`/doc-truyen/${story.slug}/${chapter.id}`} className="chapter-row" key={chapter.id}>
                          <span className="chapter-index" aria-hidden="true">
                            {chapter.number}
                          </span>
                          <span className="chapter-title">
                            <span className="chapter-label">Chương {chapter.number}{chapter.title ? ": " : ""}</span>
                            <strong>{chapter.title}</strong>
                          </span>
                          <small className="chapter-date">
                            {chapter.createdAt.toLocaleDateString("vi-VN")}
                          </small>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <details className="chapter-disclosure chapter-mobile-disclosure">
                    <summary className="chapter-panel-header">
                      <h2>Danh sách chương</h2>
                      <span className="chapter-summary-action">
                        {story.chapters.length} chương
                        <FaChevronDown aria-hidden="true" />
                      </span>
                    </summary>

                    <div className="chapter-list">
                      {story.chapters.map((chapter) => (
                        <Link href={`/doc-truyen/${story.slug}/${chapter.id}`} className="chapter-row" key={chapter.id}>
                          <span className="chapter-index" aria-hidden="true">
                            {chapter.number}
                          </span>
                          <span className="chapter-title">
                            <span className="chapter-label">Chương {chapter.number}{chapter.title ? ": " : ""}</span>
                            <strong>{chapter.title}</strong>
                          </span>
                          <small className="chapter-date">
                            {chapter.createdAt.toLocaleDateString("vi-VN")}
                          </small>
                        </Link>
                      ))}
                    </div>
                  </details>
                </>
              )}
            </div>

            <aside className="story-sidebar">
              <div className="related-box">
                <h2>Truyện cùng thể loại</h2>

                {relatedStories.length === 0 ? (
                  <p>Chưa có truyện cùng thể loại.</p>
                ) : (
                  <RelatedStoriesCarousel
                    stories={relatedStories.map((story) => ({
                      id: story.id,
                      slug: story.slug,
                      title: story.title,
                      category: story.category,
                      status: story.status,
                      coverImage: story.coverImage,
                    }))}
                  />
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
