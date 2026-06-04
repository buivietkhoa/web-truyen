import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">Mọt Chạm</Link>
            <p>
              Không gian đọc truyện nhẹ nhàng, cập nhật các bộ truyện được yêu thích
              và gợi ý nội dung phù hợp cho từng độc giả.
            </p>
            <div className="footer-socials">
              <Link href="/" aria-label="Facebook"><FaFacebookF /></Link>
              <Link href="/" aria-label="TikTok"><FaTiktok /></Link>
              <Link href="/" aria-label="Instagram"><FaInstagram /></Link>
            </div>
          </div>

          <div className="footer-column">
            <h4>Khám phá</h4>
            <Link href="/truyen">Truyện mới cập nhật</Link>
            <Link href="/the-loai">Thể loại truyện</Link>
            <Link href="/tim-kiem">Tìm kiếm truyện</Link>
          </div>

          <div className="footer-column">
            <h4>Hỗ trợ</h4>
            <Link href="/profile">Hồ sơ cá nhân</Link>
            <Link href="/dang-nhap">Đăng nhập</Link>
            <Link href="/dang-ki">Đăng ký</Link>
          </div>

          <div className="footer-newsletter">
            <h4>Gợi ý đọc</h4>
            <p>Lưu lại truyện yêu thích, theo dõi chương mới và tiếp tục đọc ở nơi bạn dừng lại.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
