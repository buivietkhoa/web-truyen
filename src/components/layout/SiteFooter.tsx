import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { getSiteSetting } from "@/lib/site-settings";

export default async function SiteFooter() {
  const setting = await getSiteSetting();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              {setting.siteName}
            </Link>
            <p>{setting.siteDesc}</p>
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
          </div>

          <div className="footer-column">
            <h4>Hỗ trợ</h4>
            <Link href="/profile">Hồ sơ cá nhân</Link>
            <Link href="/dang-nhap">Đăng nhập</Link>
            <Link href="/dang-ki">Đăng ký</Link>
          </div>

          <div className="footer-newsletter">
            <h4>Gợi ý đọc</h4>
            <p>
              Lưu lại truyện yêu thích, theo dõi chương mới và tiếp tục đọc ở
              nơi bạn dừng lại.
            </p>
          </div>
        </div>
        {setting.footerText && <p className="footer-custom-text">{setting.footerText}</p>}
      </div>
    </footer>
  );
}
