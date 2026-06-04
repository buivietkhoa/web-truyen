import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaArrowRight, FaBookOpen } from "react-icons/fa";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ReaderToolbar from "@/components/reader/ReaderToolbar";
import { danhSachTruyen } from "@/data/truyen";

interface Props {
  params: Promise<{
    truyenId: string;
    chuongId: string;
  }>;
}

export default async function DocTruyenPage({ params }: Props) {
  const { truyenId, chuongId } = await params;
  const truyen = danhSachTruyen.find((item) => item.id === truyenId);

  if (!truyen) {
    notFound();
  }

  const currentIndex = truyen.chuongs.findIndex((chuong) => chuong.id === chuongId);

  if (currentIndex === -1) {
    notFound();
  }

  const chuong = truyen.chuongs[currentIndex];
  const prevChapter = truyen.chuongs[currentIndex - 1];
  const nextChapter = truyen.chuongs[currentIndex + 1];

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
