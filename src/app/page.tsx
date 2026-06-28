import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowRight, FaStar } from "react-icons/fa";
import CompletedStoriesCarousel from "@/components/home/CompletedStoriesCarousel";
import HeroSlider from "@/components/home/HeroSlider";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { db } from "@/lib/db";
import { withDatabaseRetry } from "@/lib/db-retry";
import { absoluteUrl, defaultSiteDescription, defaultSiteName } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSiteSetting();
  const siteName = setting.siteName || defaultSiteName;
  const description = setting.siteDesc || defaultSiteDescription;

  return {
    title: siteName,
    description,
    alternates: {
      canonical: absoluteUrl("/"),
    },
    openGraph: {
      type: "website",
      title: siteName,
      description,
      url: absoluteUrl("/"),
      siteName,
      images: setting.logoUrl ? [{ url: setting.logoUrl, alt: siteName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: setting.logoUrl ? [setting.logoUrl] : undefined,
    },
  };
}

export default async function HomePage() {
  const [latestStories, completedStories] = await withDatabaseRetry(() =>
    Promise.all([
      db.story.findMany({
        where: {
          published: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 8,
        include: {
          chapters: {
            where: {
              published: true,
            },
            orderBy: {
              number: "desc",
            },
            take: 1,
          },
        },
      }),
      db.story.findMany({
        where: {
          status: "Hoàn thành",
          published: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 4,
      }),
    ])
  );

  const heroStories = latestStories.slice(0, 3).map((story) => ({
    slug: story.slug,
    title: story.title,
    category: story.category,
    coverImage: story.coverImage,
    description: story.description,
  }));

  const recommended = latestStories.slice(0, 3);

  return (
    <>
      <SiteHeader activePage="home" />

      <main className="home-page">
        {latestStories.length === 0 ? (
          <section className="container mt-5">
            <div className="empty-state">
              <h1>Chưa có truyện nào</h1>
              <p>Website đang dùng dữ liệu thật từ database. Admin có thể thêm truyện đầu tiên trong trang quản trị.</p>
              <Link href="/admin/truyen">Vào quản trị truyện</Link>
            </div>
          </section>
        ) : (
          <>
            <section className="container hero-section">
              <div className="row">
                <div className="col-lg-8">
                  <HeroSlider stories={heroStories} />
                </div>

                <div className="col-lg-4">
                  <h3 className="side-title"><FaStar /> Đề cử cho bạn</h3>

                  {recommended.map((item) => (
                    <Link href={`/truyen/${item.slug}`} className="recommend-card" key={item.id}>
                      <img src={item.coverImage} alt={item.title} />
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.category} - {item.status}</p>
                        <span>{item.views.toLocaleString("vi-VN")} lượt đọc</span>
                      </div>
                    </Link>
                  ))}

                  <Link href="/truyen" className="small-link">
                    <span>Xem thêm đề cử</span>
                    <FaArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>

            <section className="container mt-5 home-main-section">
              <div className="section-heading latest-section-heading">
                <div>
                  <h2>Truyện Mới Cập Nhật</h2>
                </div>
                <Link href="/truyen">Tất cả</Link>
              </div>

              <div className="row latest-grid">
                {latestStories.map((story) => (
                  <div className="col-lg-3 col-sm-6 mb-4" key={story.id}>
                    <Link href={`/truyen/${story.slug}`} className="story-card">
                      <div className="story-cover-wrap image-skeleton">
                        <img src={story.coverImage} alt={story.title} loading="lazy" />
                        <span>{story.category}</span>
                      </div>
                      <h3>{story.title}</h3>
                      <p>{story.category}</p>
                      <strong>
                        {story.chapters[0] ? `Chương ${story.chapters[0].number}` : "Chưa có chương"}
                      </strong>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="completed-box completed-wide-box">
                <h2>Truyện Hoàn Thành</h2>
                <p>Các bộ truyện đã được admin đánh dấu hoàn thành.</p>

                {completedStories.length === 0 ? (
                  <p>Chưa có truyện hoàn thành.</p>
                ) : (
                  <CompletedStoriesCarousel
                    stories={completedStories.map((story) => ({
                      id: story.id,
                      slug: story.slug,
                      title: story.title,
                      category: story.category,
                      coverImage: story.coverImage,
                      views: story.views,
                    }))}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
