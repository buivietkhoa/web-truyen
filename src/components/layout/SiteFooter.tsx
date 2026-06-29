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
              <a href="https://www.facebook.com/profile.php?id=61591646273203" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
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

        </div>
        {setting.footerText && <p className="footer-custom-text">{setting.footerText}</p>}
      </div>
    </footer>
  );
}
