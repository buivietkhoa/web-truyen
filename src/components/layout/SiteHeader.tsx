"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaBars,
  FaBell,
  FaRegUserCircle,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { categories } from "@/data/categories";

type ActivePage = "home" | "updates" | "profile";

interface SiteHeaderProps {
  activePage?: ActivePage;
}

export default function SiteHeader({ activePage }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

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

        <Link href="/dang-nhap" className="login-btn">Đăng nhập</Link>

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

      <div className={`mobile-menu-panel ${isMenuOpen ? "open" : ""}`}>
        <form className="mobile-menu-search" action="/tim-kiem">
          <FaSearch />
          <input name="q" placeholder="Tìm truyện..." />
        </form>

        <nav>
          <Link href="/" onClick={closeMenu} className={activePage === "home" ? "active" : ""}>Trang chủ</Link>
          <Link href="/truyen" onClick={closeMenu} className={activePage === "updates" ? "active" : ""}>Mới cập nhật</Link>
          <Link href="/profile" onClick={closeMenu} className={activePage === "profile" ? "active" : ""}>Hồ sơ cá nhân</Link>
          <Link href="/dang-nhap" onClick={closeMenu}>Đăng nhập</Link>
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
