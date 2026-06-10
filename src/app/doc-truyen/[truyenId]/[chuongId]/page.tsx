import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaArrowRight, FaBookOpen } from "react-icons/fa";
import AffiliateContentGate from "@/components/affiliate/AffiliateContentGate";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ChapterSelect from "@/components/reader/ChapterSelect";
import ReaderToolbar from "@/components/reader/ReaderToolbar";
import ViewTracker from "@/components/reader/ViewTracker";
import { getRandomAffiliateGateSetting } from "@/lib/affiliate";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{
    truyenId: string;
    chuongId: string;
  }>;
}

async function getReaderData(truyenId: string, chuongId: string) {
  const story = await db.story.findUnique({
    where: {
      slug: truyenId,
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

  if (!data) {
    return {
      title: "Không tìm thấy chương - Mọt Chạm",
    };
  }

  return {
    title: `Chương ${data.chapter.number}: ${data.chapter.title} - ${data.story.title}`,
    description: `Đọc chương ${data.chapter.number} của truyện ${data.story.title} trên Mọt Chạm.`,
  };
}

export default async function DocTruyenPage({ params }: Props) {
  const { truyenId, chuongId } = await params;
  const data = await getReaderData(truyenId, chuongId);

  if (!data) {
    notFound();
  }

  const { story, chapter, prevChapter, nextChapter } = data;
  const affiliateModalSetting = await getRandomAffiliateGateSetting();

  return (
    <>
      <ViewTracker storyId={story.id} />
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
                Chương {chapter.number}: {chapter.title}
              </h1>
              <span>{story.title}</span>
            </header>

            <ChapterSelect truyenId={story.slug} chuongs={story.chapters} currentChapterId={chapter.id} />

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

            <AffiliateContentGate
              content={chapter.content}
              chapterId={chapter.id}
              chapterNumber={chapter.number}
              setting={affiliateModalSetting}
            />

            <div className="reader-nav reader-nav-bottom">
              {prevChapter ? (
                <Link href={`/doc-truyen/${story.slug}/${prevChapter.id}`}>
                  <FaArrowLeft /> Chương trước
                </Link>
              ) : (
                <span />
              )}

              <Link href={`/truyen/${story.slug}`}>
                Danh sách chương
              </Link>

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

      <SiteFooter />
    </>
  );
}
