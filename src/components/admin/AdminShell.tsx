import type { ReactNode } from "react";
import Link from "next/link";
import { FaBookOpen, FaCog, FaSearch } from "react-icons/fa";
import AdminNav from "@/components/admin/AdminNav";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import NotificationBell from "@/components/layout/NotificationBell";

interface AdminShellProps {
  children: ReactNode;
  userName: string;
}

export default function AdminShell({ children, userName }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span><FaBookOpen /></span>
          <div><strong>Mọt Admin</strong><small>Hệ thống quản trị</small></div>
        </div>

        <AdminNav />

        <div className="admin-sidebar-footer"><AdminLogoutButton /></div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <form className="admin-search" action="/admin/search">
            <FaSearch />
            <input name="q" placeholder="Tìm truyện, chương hoặc người dùng..." />
          </form>

          <div className="admin-topbar-actions">
            <NotificationBell />
            <Link className="admin-topbar-icon" href="/admin/settings" aria-label="Cài đặt"><FaCog /></Link>
            <div className="admin-account">
              <div><strong>{userName}</strong><span>Quản trị viên</span></div>
              <span className="admin-avatar">{userName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
