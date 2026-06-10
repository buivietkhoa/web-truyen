import type { Metadata } from "next";
import AdminUserRoleButton from "@/components/admin/AdminUserRoleButton";
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
      createdAt: true,
    },
  });

  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  return (
    <div className="admin-page">
      <section className="admin-page-head">
        <div>
          <p>Tài khoản</p>
          <h2>Người dùng</h2>
        </div>
      </section>

      <section className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>Tổng người dùng</span>
          <strong>{users.length}</strong>
        </div>
        <div className="admin-stat-card active">
          <span>Quản trị viên</span>
          <strong>{adminCount}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Tài khoản thường</span>
          <strong>{users.length - adminCount}</strong>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p>Database</p>
            <h2>Danh sách tài khoản</h2>
          </div>
          <span>{users.length} người dùng</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table admin-users-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-initial={user.name.charAt(0).toUpperCase()}>
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-role-pill ${user.role === "ADMIN" ? "admin" : "user"}`}>
                      {user.role === "ADMIN" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>{user.createdAt.toLocaleDateString("vi-VN")}</td>
                  <td>
                    <AdminUserRoleButton
                      userId={user.id}
                      userName={user.name}
                      currentRole={user.role}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
