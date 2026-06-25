"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBars, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import NotificationBell from "@/components/layout/NotificationBell";
import ThemeToggle from "@/components/layout/ThemeToggle";
import UserPresenceTracker from "@/components/analytics/UserPresenceTracker";
import { categories } from "@/data/categories";

export type ActivePage = "home" | "updates" | "profile";

interface SiteHeaderClientProps {
  activePage?: ActivePage;
  initialUserName: string;
  siteName: string;
  logoUrl: string;
}

export default function SiteHeaderClient({
  activePage,
  initialUserName,
  siteName,
  logoUrl,
}: SiteHeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userName = initialUserName;

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isMenuOpen]);

  return (
    <>
      {userName && <UserPresenceTracker />}
      <header className="site-header">
      <div className="container header-inner d-flex align-items-center">
        <Link href="/" className="brand" onClick={closeMenu}>
          {logoUrl && <img src={logoUrl} alt="" className="site-brand-logo" />}
          <span>{siteName}</span>
        </Link>

        <nav className="main-nav">
          <Link href="/" className={activePage === "home" ? "active" : ""}>Trang chủ</Link>
          <details className="nav-dropdown">
            <summary className="nav-dropdown-trigger">Thể loại</summary>
            <div className="category-dropdown">
              {categories.map((category) => (
                <Link href={`/the-loai/${category.slug}`} key={category.slug}>{category.name}</Link>
              ))}
            </div>
          </details>
          <Link href="/truyen" className={activePage === "updates" ? "active" : ""}>Mới cập nhật</Link>
        </nav>

        <form className="search-box ml-auto" action="/tim-kiem">
          <FaSearch />
          <input name="q" placeholder="Tìm truyện..." />
        </form>

        <div className="header-actions">
          <ThemeToggle />
          {userName && <NotificationBell />}

          {userName ? (
            <Link
              href="/profile"
              className={`header-icon-link ${activePage === "profile" ? "active" : ""}`}
              aria-label="Hồ sơ cá nhân"
              title={userName}
            >
              <FaUser />
            </Link>
          ) : (
            <Link href="/dang-nhap" className="login-btn">
              Đăng nhập
            </Link>
          )}
        </div>

        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <button
        className={`mobile-menu-backdrop ${isMenuOpen ? "open" : ""}`}
        type="button"
        aria-label="Đóng menu"
        onClick={closeMenu}
      />

      <div className={`mobile-menu-panel ${isMenuOpen ? "open" : ""}`}>
        <form className="mobile-menu-search" action="/tim-kiem">
          <FaSearch />
          <input name="q" placeholder="Tìm truyện..." />
        </form>

        <nav>
          <Link href="/" onClick={closeMenu} className={activePage === "home" ? "active" : ""}>Trang chủ</Link>
          <Link href="/truyen" onClick={closeMenu} className={activePage === "updates" ? "active" : ""}>Mới cập nhật</Link>
          {userName ? (
            <Link href="/profile" onClick={closeMenu} className={activePage === "profile" ? "active" : ""}>
              Hồ sơ cá nhân
            </Link>
          ) : (
            <Link href="/dang-nhap" onClick={closeMenu}>
              Đăng nhập
            </Link>
          )}
        </nav>

        <div className="mobile-menu-categories">
          <h3>Thể loại</h3>
          <div>
            {categories.map((category) => (
              <Link href={`/the-loai/${category.slug}`} key={category.slug} onClick={closeMenu}>{category.name}</Link>
            ))}
          </div>
        </div>
      </div>
      </header>
    </>
  );
}
