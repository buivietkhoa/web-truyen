import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaArrowRight, FaBookOpen } from "react-icons/fa";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ChapterSelect from "@/components/reader/ChapterSelect";
import ReaderToolbar from "@/components/reader/ReaderToolbar";
import { danhSachTruyen } from "@/data/truyen";

interface Props {
  params: Promise<{
    truyenId: string;
    chuongId: string;
  }>;
}

function getReaderData(truyenId: string, chuongId: string) {
  const truyen = danhSachTruyen.find((item) => item.id === truyenId);
  if (!truyen) return null;

  const currentIndex = truyen.chuongs.findIndex((chuong) => chuong.id === chuongId);
  if (currentIndex === -1) return null;

  return {
    truyen,
    chuong: truyen.chuongs[currentIndex],
    prevChapter: truyen.chuongs[currentIndex - 1],
    nextChapter: truyen.chuongs[currentIndex + 1],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { truyenId, chuongId } = await params;
  const data = getReaderData(truyenId, chuongId);

  if (!data) {
    return {
      title: "Không tìm thấy chương - Mọt Chạm",
    };
  }

  return {
    title: `${data.chuong.ten} - ${data.truyen.ten}`,
    description: `Đọc ${data.chuong.ten} của truyện ${data.truyen.ten} trên Mọt Chạm.`,
  };
}

export default async function DocTruyenPage({ params }: Props) {
  const { truyenId, chuongId } = await params;
  const data = getReaderData(truyenId, chuongId);

  if (!data) {
    notFound();
  }

  const { truyen, chuong, prevChapter, nextChapter } = data;

  return (
    <>
      <SiteHeader />

      <ReaderToolbar>
        <main className="reader-page">
          <article className="reader-container">
            <nav className="reader-breadcrumb">
              <Link href="/">Trang chủ</Link>
              <span>/</span>
              <Link href={`/truyen/${truyen.id}`}>{truyen.ten}</Link>
              <span>/</span>
              <strong>{chuong.ten}</strong>
            </nav>

            <header className="reader-head">
              <p>{truyen.theLoai} · {truyen.tacGia}</p>
              <h1>{chuong.ten}</h1>
              <span>{truyen.ten}</span>
            </header>

            <ChapterSelect truyenId={truyen.id} chuongs={truyen.chuongs} currentChapterId={chuong.id} />

            <div className="reader-nav">
              {prevChapter ? (
                <Link href={`/doc-truyen/${truyen.id}/${prevChapter.id}`}>
                  <FaArrowLeft /> Chương trước
                </Link>
              ) : (
                <span />
              )}

              <Link href={`/truyen/${truyen.id}`}>
                <FaBookOpen /> Chi tiết truyện
              </Link>

              {nextChapter ? (
                <Link href={`/doc-truyen/${truyen.id}/${nextChapter.id}`}>
                  Chương sau <FaArrowRight />
                </Link>
              ) : (
                <span />
              )}
            </div>

            <section
              className="reader-content"
              dangerouslySetInnerHTML={{ __html: chuong.noiDung }}
            />

            <div className="reader-nav reader-nav-bottom">
              {prevChapter ? (
                <Link href={`/doc-truyen/${truyen.id}/${prevChapter.id}`}>
                  <FaArrowLeft /> Chương trước
                </Link>
              ) : (
                <span />
              )}

              <Link href={`/truyen/${truyen.id}`}>
                Danh sách chương
              </Link>

              {nextChapter ? (
                <Link href={`/doc-truyen/${truyen.id}/${nextChapter.id}`}>
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
