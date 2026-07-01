import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaArrowRight, FaBookOpen } from "react-icons/fa";
import AffiliateTimedPopup from "@/components/affiliate/AffiliateTimedPopup";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ChapterContent from "@/components/reader/ChapterContent";
import ChapterSelect from "@/components/reader/ChapterSelect";
import ReadingHistoryTracker from "@/components/reader/ReadingHistoryTracker";
import ReaderToolbar from "@/components/reader/ReaderToolbar";
import ViewTracker from "@/components/reader/ViewTracker";
import { getTimedAffiliatePopupData } from "@/lib/affiliate";
import { db } from "@/lib/db";
import { absoluteUrl, truncateMeta } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    truyenId: string;
    chuongId: string;
  }>;
}

async function getReaderData(truyenId: string, chuongId: string) {
  const story = await db.story.findFirst({
    where: {
      slug: truyenId,
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
    return null;
  }

  const currentIndex = story.chapters.findIndex((chapter) => chapter.id === chuongId);

  if (currentIndex === -1) {
    return null;
  }

  return {
    story,
    chapter: story.chapters[currentIndex],
    prevChapter: story.chapters[currentIndex - 1],
    nextChapter: story.chapters[currentIndex + 1],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { truyenId, chuongId } = await params;
  const data = await getReaderData(truyenId, chuongId);
  const siteSetting = await getSiteSetting();

  if (!data) {
    return {
      title: `Không tìm thấy chương - ${siteSetting.siteName}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { story, chapter } = data;
  const title = `Chương ${chapter.number}${chapter.title ? `: ${chapter.title}` : ""} - ${story.title}`;
  const description =
    truncateMeta(chapter.content) ||
    `Đọc chương ${chapter.number} của truyện ${story.title} trên ${siteSetting.siteName}.`;
  const url = absoluteUrl(`/doc-truyen/${story.slug}/${chapter.id}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: siteSetting.siteName,
      images: [{ url: story.coverImage, alt: story.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [story.coverImage],
    },
  };
}

export default async function DocTruyenPage({ params }: Props) {
  const { truyenId, chuongId } = await params;
  const data = await getReaderData(truyenId, chuongId);

  if (!data) {
    notFound();
  }

  const { story, chapter, prevChapter, nextChapter } = data;
  const affiliatePopupData = await getTimedAffiliatePopupData();

  return (
    <>
      <ViewTracker storyId={story.id} />
      <ReadingHistoryTracker storyId={story.id} chapterId={chapter.id} chapterNumber={chapter.number} />
      <SiteHeader />

      <ReaderToolbar>
        <main className="reader-page">
          <article className="reader-container">
            <nav className="reader-breadcrumb">
              <Link href="/">Trang chủ</Link>
              <span>/</span>
              <Link href={`/truyen/${story.slug}`}>{story.title}</Link>
              <span>/</span>
              <strong>Chương {chapter.number}</strong>
            </nav>

            <header className="reader-head">
              <p>{story.category}</p>
              <h1>
                Chương {chapter.number}{chapter.title ? `: ${chapter.title}` : ""}
              </h1>
              <span>{story.title}</span>
            </header>

            <ChapterSelect
              truyenId={story.slug}
              chuongs={story.chapters.map(({ id, title, number }) => ({ id, title, number }))}
              currentChapterId={chapter.id}
            />

            <div className="reader-nav">
              {prevChapter ? (
                <Link href={`/doc-truyen/${story.slug}/${prevChapter.id}`}>
                  <FaArrowLeft /> Chương trước
                </Link>
              ) : (
                <span />
              )}

              <Link href={`/truyen/${story.slug}`}>
                <FaBookOpen /> Chi tiết truyện
              </Link>

              {nextChapter ? (
                <Link href={`/doc-truyen/${story.slug}/${nextChapter.id}`}>
                  Chương sau <FaArrowRight />
                </Link>
              ) : (
                <span />
              )}
            </div>

            <ChapterContent chapterId={chapter.id} storyId={story.id} />

            <div className="reader-nav reader-nav-bottom">
              {prevChapter ? (
                <Link href={`/doc-truyen/${story.slug}/${prevChapter.id}`}>
                  <FaArrowLeft /> Chương trước
                </Link>
              ) : (
                <span />
              )}

              <Link href={`/truyen/${story.slug}`}>Danh sách chương</Link>

              {nextChapter ? (
                <Link href={`/doc-truyen/${story.slug}/${nextChapter.id}`}>
                  Chương sau <FaArrowRight />
                </Link>
              ) : (
                <span />
              )}
            </div>
          </article>
        </main>
      </ReaderToolbar>

      {affiliatePopupData && (
        <AffiliateTimedPopup
          key={chapter.id}
          products={affiliatePopupData.products}
          storyId={story.id}
          chapterId={chapter.id}
          chapterNumber={chapter.number}
          effect={affiliatePopupData.effect}
        />
      )}

      <SiteFooter />
    </>
  );
}
