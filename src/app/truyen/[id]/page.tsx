import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { FaBookOpen, FaEye, FaStar } from "react-icons/fa";
import { danhSachTruyen } from "@/data/truyen";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const truyen = danhSachTruyen.find((item) => item.id === id);

  if (!truyen) {
    return {
      title: "Không tìm thấy truyện - Mọt Chạm",
    };
  }

  return {
    title: `${truyen.ten} - Mọt Chạm`,
    description: truyen.moTa,
    openGraph: {
      title: `${truyen.ten} - Mọt Chạm`,
      description: truyen.moTa,
      images: [truyen.anhBia],
    },
  };
}

export default async function ChiTietTruyenPage({ params }: Props) {
  const { id } = await params;
  const truyen = danhSachTruyen.find((item) => item.id === id);

  if (!truyen) {
    notFound();
  }

  const truyenCungTheLoai = danhSachTruyen
    .filter((item) => item.theLoai === truyen.theLoai && item.id !== truyen.id)
    .slice(0, 3);

  const relatedStories =
    truyenCungTheLoai.length > 0
      ? truyenCungTheLoai
      : danhSachTruyen.filter((item) => item.id !== truyen.id).slice(0, 3);

  const firstChapter = truyen.chuongs[0];
  const latestChapter = truyen.chuongs.at(-1);

  return (
    <>
      <SiteHeader />

      <main className="story-detail-page">
        <div className="container detail-container">
          <nav className="story-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span>›</span>
            <Link href="/the-loai">{truyen.theLoai}</Link>
            <span>›</span>
            <strong>{truyen.ten}</strong>
          </nav>

          <section className="story-hero">
            <div className="story-cover image-skeleton">
              <img src={truyen.anhBia} alt={truyen.ten} loading="lazy" />
            </div>

            <div className="story-main-info">
              <div className="story-tags">
                <span>{truyen.trangThai}</span>
                <span>{truyen.theLoai}</span>
              </div>

              <h1>{truyen.ten}</h1>

              <div className="story-meta">
                <span>{truyen.tacGia}</span>
                <span>
                  <FaEye /> {truyen.luotXem.toLocaleString("vi-VN")} lượt xem
                </span>
                <span>
                  <FaStar /> 4.8/5
                </span>
              </div>

              <div className="story-actions">
                {firstChapter && (
                  <Link href={`/doc-truyen/${truyen.id}/${firstChapter.id}`} className="btn btn-primary">
                    <FaBookOpen />
                    Đọc từ đầu
                  </Link>
                )}

                {latestChapter && (
                  <Link href={`/doc-truyen/${truyen.id}/${latestChapter.id}`} className="btn btn-outline-primary">
                    Mới nhất: Chương {latestChapter.soChuong}
                  </Link>
                )}
              </div>

              <div className="story-summary">
                <h2>Tóm tắt nội dung</h2>
                <p>{truyen.moTa}</p>
              </div>
            </div>
          </section>

          <section className="story-content-grid">
            <div id="chapters" className="chapter-panel">
              <div className="chapter-panel-header">
                <h2>Danh sách chương</h2>
                <span>Tổng cộng: {truyen.chuongs.length} chương</span>
              </div>

              <div className="chapter-list">
                {truyen.chuongs.map((chuong, index) => (
                  <Link href={`/doc-truyen/${truyen.id}/${chuong.id}`} className="chapter-row" key={chuong.id}>
                    <span>{chuong.ten}</span>
                    <small>{24 + index}/10/2023</small>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="story-sidebar">
              <div className="related-box">
                <h2>Truyện cùng thể loại</h2>

                {relatedStories.map((item) => (
                  <Link href={`/truyen/${item.id}`} className="related-item" key={item.id}>
                    <img src={item.anhBia} alt={item.ten} loading="lazy" />
                    <div>
                      <h3>{item.ten}</h3>
                      <p>{item.tacGia}</p>
                      <span>★ 4.8</span>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
