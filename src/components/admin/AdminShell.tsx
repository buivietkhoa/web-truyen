import type { ReactNode } from "react";
import Link from "next/link";
import { FaBell, FaBookOpen, FaCog, FaSearch } from "react-icons/fa";
import AdminNav from "@/components/admin/AdminNav";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

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
          <div>
            <strong>Mọt Admin</strong>
            <small>Hệ thống quản trị</small>
          </div>
        </div>

        <AdminNav />

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-upgrade">Nâng cấp tài khoản</button>
          <Link href="/">Về website</Link>
          <AdminLogoutButton />
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <form className="admin-search" action="/admin/truyen">
            <FaSearch />
            <input name="q" placeholder="Tìm kiếm hệ thống..." />
          </form>

          <div className="admin-topbar-actions">
            <button type="button" aria-label="Thông báo"><FaBell /></button>
            <button type="button" aria-label="Cài đặt"><FaCog /></button>
            <div className="admin-account">
              <div>
                <strong>{userName}</strong>
                <span>Quản trị viên</span>
              </div>
              <span className="admin-avatar">{userName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
