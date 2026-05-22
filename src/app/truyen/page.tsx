import Link from "next/link";
import {
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaRegUserCircle,
  FaSearch,
} from "react-icons/fa";
import { danhSachTruyen } from "@/data/truyen";

const updateTimes = [
  "5 phút trước",
  "12 phút trước",
  "25 phút trước",
  "45 phút trước",
  "1 giờ trước",
  "2 giờ trước",
  "3 giờ trước",
  "4 giờ trước",
  "5 giờ trước",
  "6 giờ trước",
];

export default function DanhSachTruyenPage() {
  const updatedStories = danhSachTruyen.map((truyen, index) => ({
    ...truyen,
    latestChapter: truyen.chuongs.at(-1)?.soChuong || index + 1,
    updateTime: updateTimes[index] || "Hôm nay",
  }));

  return (
    <>
      <header className="site-header">
        <div className="container d-flex align-items-center">
          <Link href="/" className="brand">Mọt Chạm</Link>

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
            <Link href="/truyen" className="active">Mới cập nhật</Link>
          </nav>

          <div className="search-box ml-auto">
            <FaSearch />
            <input placeholder="Tìm truyện..." />
          </div>

          <FaBell className="header-icon" />
          <Link href="/profile" className="header-icon-link" aria-label="Hồ sơ cá nhân">
            <FaRegUserCircle />
          </Link>

          <Link href="/dang-nhap" className="login-btn">Đăng nhập</Link>
        </div>
      </header>

      <main className="updates-page">
        <section className="updates-container">
          <div className="updates-toolbar">
            <h1>Mới cập nhật</h1>
          </div>

          <div className="updates-grid">
            {updatedStories.map((truyen) => (
              <Link href={`/truyen/${truyen.id}`} className="update-card" key={truyen.id}>
                <div className="update-cover">
                  <img src={truyen.anhBia} alt={truyen.ten} />
                  <span>{truyen.theLoai.toUpperCase()}</span>
                </div>

                <div className="update-info">
                  <h2>{truyen.ten}</h2>
                  <div>
                    <p>Chương {truyen.latestChapter}</p>
                    <small>{truyen.updateTime}</small>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <nav className="updates-pagination" aria-label="Phân trang">
            <button type="button" aria-label="Trang trước">
              <FaChevronLeft />
            </button>
            <button className="active" type="button">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <span>...</span>
            <button type="button">10</button>
            <button type="button" aria-label="Trang sau">
              <FaChevronRight />
            </button>
          </nav>
        </section>
      </main>

    </>
  );
}
