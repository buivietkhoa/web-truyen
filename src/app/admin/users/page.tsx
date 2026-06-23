import type { Metadata } from "next";
import { FaUserCheck, FaUserFriends, FaUserShield } from "react-icons/fa";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Người dùng - Mọt Chạm Admin",
};

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      authProvider: true,
      lastLoginAt: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  return (
    <div className="admin-page admin-users-page">
      <section className="admin-page-head">
        <div>
          <p>Quản trị tài khoản</p>
          <h2>Người dùng</h2>
          <span>Theo dõi thành viên và kiểm soát quyền truy cập hệ thống.</span>
        </div>
      </section>

      <section className="admin-stat-grid admin-users-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><FaUserFriends /></div><div><span>Tổng người dùng</span><strong>{users.length}</strong><small>Tất cả tài khoản</small></div>
        </div>
        <div className="admin-stat-card active">
          <div className="admin-stat-icon violet"><FaUserShield /></div><div><span>Quản trị viên</span><strong>{adminCount}</strong><small>Có quyền quản trị</small></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green"><FaUserCheck /></div><div><span>Thành viên</span><strong>{users.length - adminCount}</strong><small>Tài khoản đọc truyện</small></div>
        </div>
      </section>

      <AdminUsersTable users={users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        provider: user.authProvider === "GOOGLE" ? "Google" : user.authProvider === "FACEBOOK" ? "Facebook" : "Email",
        createdAt: user.createdAt.toLocaleDateString("vi-VN"),
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toLocaleDateString("vi-VN") : null,
        lastActiveAt: user.updatedAt.toISOString(),
      }))} />
    </div>
  );
}
