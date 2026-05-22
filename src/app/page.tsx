import Link from "next/link";
import HeroSlider from "@/components/home/HeroSlider";
import {
  FaBell,
  FaBookOpen,
  FaFacebookF,
  FaInstagram,
  FaRegUserCircle,
  FaSearch,
  FaStar,
  FaTiktok,
} from "react-icons/fa";

const latestStories = [
  { title: "Vô Thượng Thần Đế", author: "Oa Ngưu", category: "Tiên Hiệp", chapter: "Chương 2450", image: "https://picsum.photos/300/420?random=1" },
  { title: "Phàm Nhân Tu Tiên", author: "Vong Ngữ", category: "Tu Chân", chapter: "Chương 1502", image: "https://picsum.photos/300/420?random=2" },
  { title: "Đế Bá", author: "Yếm Bút Tiêu Sinh", category: "Huyền Huyễn", chapter: "Chương 6120", image: "https://picsum.photos/300/420?random=3" },
  { title: "Cổ Sự Thành Tây", author: "Mộc Hương", category: "Ngôn Tình", chapter: "Chương 85", image: "https://picsum.photos/300/420?random=4" },
  { title: "Quỷ Bí Chi Chủ", author: "Ái Tiềm Thủy", category: "Kỳ Huyễn", chapter: "Chương 12", image: "https://picsum.photos/300/420?random=5" },
  { title: "Linh Vũ Thiên Hạ", author: "Vũ Phong", category: "Xuyên Không", chapter: "Chương 5001", image: "https://picsum.photos/300/420?random=6" },
  { title: "Thế Giới Hoàn Mỹ", author: "Thần Đông", category: "Dị Giới", chapter: "Chương 2018", image: "https://picsum.photos/300/420?random=7" },
  { title: "Nguyên Tôn", author: "Thiên Tằm", category: "Cổ Đại", chapter: "Chương 1450", image: "https://picsum.photos/300/420?random=8" },
];

const latestStoryIds = [
  "vo-thuong-than-de",
  "pham-nhan-tu-tien",
  "de-ba",
  "co-su-thanh-tay",
  "quy-bi-chi-chu",
  "linh-vu-thien-ha",
  "the-gioi-hoan-my",
  "nguyen-ton",
];

const recommended = [
  { id: "tuyet-the-duong-mon", title: "Tuyệt Thế Đường Môn", meta: "Huyền Huyễn • Full", image: "https://picsum.photos/80/100?random=11" },
  { id: "vu-luyen-dien-phong", title: "Vũ Luyện Điên Phong", meta: "Tiên Hiệp • Đang ra", image: "https://picsum.photos/80/100?random=12" },
  { id: "than-dao-dan-ton", title: "Thần Đạo Đan Tôn", meta: "Trọng Sinh • 5200 chương", image: "https://picsum.photos/80/100?random=13" },
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="container d-flex align-items-center">
          <Link href="/" className="brand">Mọt Chạm</Link>

          <nav className="main-nav">
            <Link href="/" className="active">Trang chủ</Link>
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

          <Link href="/dang-nhap" className="login-btn">Đăng nhập</Link>
        </div>
      </header>

      <main className="home-page">
        <section className="container hero-section">
          <div className="row">
            <div className="col-lg-8">
              <HeroSlider />
            </div>

            <div className="col-lg-4">
              <h3 className="side-title"><FaStar /> Đề cử cho bạn</h3>

              {recommended.map((item) => (
                <Link href={`/truyen/${item.id}`} className="recommend-card" key={item.title}>
                  <img src={item.image} alt={item.title} />
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.meta}</p>
                    <span>★ 4.9</span>
                  </div>
                </Link>
              ))}

              <Link href="/de-cu" className="small-link">Xem thêm đề cử</Link>
            </div>
          </div>
        </section>

        <section className="container mt-5 home-main-section">
          <div className="section-heading">
            <div>
              <h2>Truyện Mới Cập Nhật</h2>
              <p>Khám phá những chương truyện mới nhất vừa lên kệ.</p>
            </div>
            <Link href="/truyen">Tất cả</Link>
          </div>

          <div className="row latest-grid">
            {latestStories.map((story, index) => (
              <div className="col-lg-3 col-sm-6 mb-4" key={story.title}>
                <Link href={`/truyen/${latestStoryIds[index]}`} className="story-card">
                  <div className="story-cover-wrap">
                    <img src={story.image} alt={story.title} />
                    <span>{story.category}</span>
                  </div>
                  <h3>{story.title}</h3>
                  <p>{story.author}</p>
                  <strong>{story.chapter}</strong>
                </Link>
              </div>
            ))}
          </div>

          <div className="completed-box completed-wide-box">
            <h2>Tuyệt Phẩm Hoàn Thành</h2>
            <p>Những bộ truyện đã kết thúc, sẵn sàng cho những buổi cày xuyên đêm.</p>

            <div className="row">
              {["Đấu La Đại Lục", "Tru Tiên", "Gà Nuôi", "Tuyết Trung Hãn Đao Hành"].map((name) => (
                <div className="col-lg-3 col-md-6 mb-3" key={name}>
                  <div className="completed-item">
                    <FaBookOpen />
                    <div>
                      <h4>{name}</h4>
                      <p>Full • 1.2M lượt đọc</p>
                    </div>
                    <span>9.8</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand">
              <Link href="/" className="footer-logo">Mọt Chạm</Link>
              <p>
                Hệ thống đọc truyện tối ưu, mang đến trải nghiệm đọc mượt mà
                và các gợi ý truyện phù hợp cho từng độc giả.
              </p>
              <div className="footer-socials">
                <Link href="/" aria-label="Facebook">
                  <FaFacebookF />
                </Link>
                <Link href="/" aria-label="TikTok">
                  <FaTiktok />
                </Link>
                <Link href="/" aria-label="Instagram">
                  <FaInstagram />
                </Link>
              </div>
            </div>

            <div className="footer-column">
              <h4>Khám phá</h4>
              <Link href="/truyen">Truyện mới cập nhật</Link>
              <Link href="/the-loai">Thể loại truyện</Link>
              <Link href="/xep-hang">Bảng xếp hạng</Link>
              <Link href="/de-cu">Truyện đề cử</Link>
            </div>

            <div className="footer-column">
              <h4>Hỗ trợ</h4>
              <Link href="/lien-he">Liên hệ</Link>
              <Link href="/cau-hoi-thuong-gap">Câu hỏi thường gặp</Link>
              <Link href="/dieu-khoan">Điều khoản dịch vụ</Link>
              <Link href="/bao-mat">Chính sách bảo mật</Link>
            </div>

            <div className="footer-newsletter">
              <h4>Nhận truyện mới</h4>
              <p>Đăng ký để nhận thông báo khi truyện yêu thích có chương mới.</p>
              <div>
                <input placeholder="Email của bạn..." />
                <button>Gửi</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
