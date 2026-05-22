import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaBell,
  FaBookOpen,
  FaEye,
  FaRegUserCircle,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import { danhSachTruyen } from "@/data/truyen";

interface Props {
  params: Promise<{
    id: string;
  }>;
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

  return (
    <>
      <header className="site-header">
        <div className="container d-flex align-items-center">
          <Link href="/" className="brand">
            Mọt Chạm
          </Link>

          <nav className="main-nav">
            <Link href="/">Trang chủ</Link>
            <details className="nav-dropdown">
              <summary className="nav-dropdown-trigger">Thể loại</summary>
              <div className="category-dropdown">
                {["Tiên Hiệp", "Kiếm Hiệp", "Ngôn Tình", "Đô Thị", "Huyền Huyễn", "Xuyên Không", "Trinh Thám", "Kinh Dị"].map((cat) => (
                  <Link href="/the-loai" key={cat}>{cat}</Link>
                ))}
              </div>
            </details>
            <Link href="/truyen">Mới cập nhật</Link>
          </nav>

          <div className="search-box ml-auto">
            <FaSearch />
            <input placeholder="Tìm truyện..." />
          </div>

          <FaBell className="header-icon" />
          <Link href="/profile" className="header-icon-link" aria-label="Hồ sơ cá nhân">
            <FaRegUserCircle />
          </Link>

          <Link href="/dang-nhap" className="login-btn">
            Đăng nhập
          </Link>
        </div>
      </header>

      <main className="story-detail-page">
        <div className="container detail-container">
          <nav className="story-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span>›</span>
            <Link href="/truyen">{truyen.theLoai}</Link>
            <span>›</span>
            <strong>{truyen.ten}</strong>
          </nav>

          <section className="story-hero">
            <div className="story-cover">
              <img src={truyen.anhBia} alt={truyen.ten} />
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
                <Link
                  href={`/doc-truyen/${truyen.id}/${truyen.chuongs[0]?.id || ""}`}
                  className="btn btn-primary"
                >
                  <FaBookOpen />
                  Đọc từ đầu
                </Link>

                <Link href="#chapters" className="btn btn-outline-primary">
                  Mới nhất: Chương {truyen.chuongs.length}
                </Link>
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
                  <Link
                    href={`/doc-truyen/${truyen.id}/${chuong.id}`}
                    className="chapter-row"
                    key={chuong.id}
                  >
                    <span>{chuong.ten}</span>
                    <small>{24 + index}/10/2023</small>
                  </Link>
                ))}
              </div>

              <button className="chapter-more">Xem tất cả chương</button>
            </div>

            <aside className="story-sidebar">
              <div className="related-box">
                <h2>Truyện cùng thể loại</h2>

                {relatedStories.map((item) => (
                  <Link href={`/truyen/${item.id}`} className="related-item" key={item.id}>
                    <img src={item.anhBia} alt={item.ten} />
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
    </>
  );
}
