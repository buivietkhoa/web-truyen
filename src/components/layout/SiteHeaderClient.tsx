"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaBars,
  FaBell,
  FaRegUserCircle,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { categories } from "@/data/categories";

export type ActivePage = "home" | "updates" | "profile";

interface SiteHeaderClientProps {
  activePage?: ActivePage;
  initialUserName: string;
}

export default function SiteHeaderClient({ activePage, initialUserName }: SiteHeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState(initialUserName);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUserName("");
    closeMenu();
    window.location.href = "/dang-nhap";
  };

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <div className="container d-flex align-items-center">
        <Link href="/" className="brand" onClick={closeMenu}>Mọt Chạm</Link>

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

        <FaBell className="header-icon" />
        <Link
          href="/profile"
          className={`header-icon-link ${activePage === "profile" ? "active" : ""}`}
          aria-label="Hồ sơ cá nhân"
        >
          <FaRegUserCircle />
        </Link>

        {userName ? (
          <button type="button" className="login-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        ) : (
          <Link href="/dang-nhap" className="login-btn">
            Đăng nhập
          </Link>
        )}

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
          <Link href="/profile" onClick={closeMenu} className={activePage === "profile" ? "active" : ""}>Hồ sơ cá nhân</Link>
          {userName ? (
            <button type="button" onClick={handleLogout}>
              Đăng xuất
            </button>
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
  );
}
