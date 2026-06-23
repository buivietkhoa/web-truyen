"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBookOpen, FaBullhorn, FaCog, FaTimes, FaUsers } from "react-icons/fa";

interface CategoryItem {
  name: string;
  stories: number;
  views: number;
  percentage: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  provider: string;
  joinedAt: string;
  lastLoginAt: string | null;
}

interface AffiliateSummary {
  products: number;
  enabledProducts: number;
  clicks30: number;
  ctr: string;
  topStory: string;
  enabled: boolean;
}

interface Props {
  categories: CategoryItem[];
  users: UserItem[];
  affiliate: AffiliateSummary;
}

type ModalName = "categories" | "users" | "affiliate" | null;

export default function AdminReportDetailCards({ categories, users, affiliate }: Props) {
  const [modal, setModal] = useState<ModalName>(null);

  useEffect(() => {
    if (!modal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setModal(null);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [modal]);

  const openWithKeyboard = (event: React.KeyboardEvent, name: Exclude<ModalName, null>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setModal(name);
    }
  };

  const close = () => setModal(null);

  return (
    <div className="admin-reports-right">
      <section className="admin-panel admin-report-side-panel admin-report-clickable" role="button" tabIndex={0} onClick={() => setModal("categories")} onKeyDown={(event) => openWithKeyboard(event, "categories")}>
        <div className="admin-panel-head">
          <div><p>Phân tích</p><h2>Tỷ trọng thể loại</h2></div><FaBookOpen />
        </div>
        <div className="admin-category-bars">
          {categories.map((category) => (
            <div className="admin-category-bar-row" key={category.name}>
              <span className="admin-category-bar-name">{category.name}</span>
              <div className="admin-category-bar-track"><div className="admin-category-bar-fill" style={{ width: `${category.percentage}%` }} /></div>
              <span className="admin-category-bar-count">{category.views} · {category.percentage}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel admin-report-side-panel admin-report-clickable" role="button" tabIndex={0} onClick={() => setModal("users")} onKeyDown={(event) => openWithKeyboard(event, "users")}>
        <div className="admin-panel-head">
          <div><p>Mới nhất</p><h2>Người dùng gần đây</h2></div><FaUsers />
        </div>
        <div className="admin-recent-users">
          {users.map((user) => (
            <div className="admin-recent-user-row" key={user.id}>
              <span className="admin-recent-user-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <div><strong>{user.name}</strong><span title={user.email}>{user.email}</span><small>Tham gia {user.joinedAt} · {user.lastLoginAt ? `Đăng nhập ${user.lastLoginAt}` : "Chưa đăng nhập"}</small></div>
              <div className="admin-recent-user-flags"><span className={`admin-user-state ${user.active ? "active" : "disabled"}`}>{user.active ? "Hoạt động" : "Đã khóa"}</span><span className="admin-user-provider">{user.provider}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel admin-report-affiliate-panel admin-report-clickable" role="button" tabIndex={0} onClick={() => setModal("affiliate")} onKeyDown={(event) => openWithKeyboard(event, "affiliate")}>
        <div className="admin-report-affiliate-title"><span><FaBullhorn /></span><div><small>Affiliate</small><strong>Hiệu lực quảng cáo</strong></div></div>
        <div className="admin-report-affiliate-stats">
          <div><strong>{affiliate.products}</strong><span>Sản phẩm</span></div>
          <div><strong>{affiliate.enabledProducts}</strong><span>Đang bật</span></div>
          <div><strong>{affiliate.clicks30}</strong><span>Click 30 ngày</span></div>
          <div><strong>{affiliate.ctr}%</strong><span>CTR / lượt xem</span></div>
          <div><strong>{affiliate.topStory}</strong><span>Truyện nhiều click</span></div>
          <div><strong className="is-off">Chưa kết nối</strong><span>Đơn hàng / doanh thu</span></div>
          <div><strong className={affiliate.enabled ? "is-active" : "is-off"}>{affiliate.enabled ? "Hoạt động" : "Đang tắt"}</strong><span>Cấu hình</span></div>
        </div>
      </section>

      {modal && (
        <div className="admin-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && close()}>
          <section className="admin-modal admin-report-detail-modal" role="dialog" aria-modal="true" aria-labelledby="report-detail-title">
            <header className="admin-modal-head">
              <div>
                <p>{modal === "categories" ? "Phân tích nội dung" : modal === "users" ? "Tài khoản mới" : "Hiệu quả quảng cáo"}</p>
                <h3 id="report-detail-title">{modal === "categories" ? "Tỷ trọng thể loại" : modal === "users" ? "Người dùng gần đây" : "Hiệu lực Affiliate"}</h3>
              </div>
              <button type="button" className="admin-modal-close" onClick={close} aria-label="Đóng"><FaTimes /></button>
            </header>

            <div className="admin-report-detail-modal-body">
              {modal === "categories" && <div className="admin-report-category-details">{categories.map((category) => <article key={category.name}><div><strong>{category.name}</strong><span>{category.stories} truyện · {category.views.toLocaleString("vi-VN")} lượt xem</span></div><b>{category.percentage}%</b><div className="admin-category-bar-track"><div className="admin-category-bar-fill" style={{ width: `${category.percentage}%` }} /></div></article>)}</div>}

              {modal === "users" && <div className="admin-report-user-details">{users.map((user) => <article key={user.id}><span className="admin-recent-user-avatar">{user.name.charAt(0).toUpperCase()}</span><div><strong>{user.name}</strong><a href={`mailto:${user.email}`}>{user.email}</a><p>Tham gia {user.joinedAt} · {user.lastLoginAt ? `Đăng nhập ${user.lastLoginAt}` : "Chưa đăng nhập"}</p></div><aside><span className={`admin-user-state ${user.active ? "active" : "disabled"}`}>{user.active ? "Hoạt động" : "Đã khóa"}</span><small>{user.provider} · {user.role}</small></aside></article>)}</div>}

              {modal === "affiliate" && <div className="admin-report-affiliate-details"><article><span>Sản phẩm</span><strong>{affiliate.products}</strong></article><article><span>Đang hoạt động</span><strong>{affiliate.enabledProducts}</strong></article><article><span>Click trong 30 ngày</span><strong>{affiliate.clicks30}</strong></article><article><span>CTR trên lượt xem</span><strong>{affiliate.ctr}%</strong></article><article className="wide"><span>Truyện tạo nhiều click nhất</span><strong>{affiliate.topStory}</strong></article><article className="wide"><span>Trạng thái cấu hình</span><strong className={affiliate.enabled ? "is-active" : "is-off"}>{affiliate.enabled ? "Đang hoạt động" : "Đang tắt"}</strong></article></div>}
            </div>

            <footer className="admin-ranking-modal-footer">
              <button type="button" className="admin-modal-cancel" onClick={close}>Đóng</button>
              {modal === "users" && <Link href="/admin/users" onClick={close}><FaUsers /> Quản lý người dùng</Link>}
              {modal === "affiliate" && <Link href="/admin/affiliate" onClick={close}><FaCog /> Mở cấu hình</Link>}
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
