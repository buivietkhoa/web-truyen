"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaClock, FaEnvelope, FaFacebookF, FaGoogle, FaSearch, FaShieldAlt, FaUser, FaUsers } from "react-icons/fa";
import AdminUserRoleButton from "@/components/admin/AdminUserRoleButton";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  active: boolean;
  provider: string;
  createdAt: string;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
}

interface Props { users: UserItem[]; }
type RoleFilter = "ALL" | "ADMIN" | "USER";

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === "Google") return <FaGoogle />;
  if (provider === "Facebook") return <FaFacebookF />;
  return <FaEnvelope />;
}

export default function AdminUsersTable({ users }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [now, setNow] = useState(0);

  useEffect(() => {
    const initialClock = window.setTimeout(() => setNow(Date.now()), 0);
    const clock = window.setInterval(() => setNow(Date.now()), 10_000);
    const refresh = window.setInterval(() => router.refresh(), 30_000);
    return () => {
      window.clearTimeout(initialClock);
      window.clearInterval(clock);
      window.clearInterval(refresh);
    };
  }, [router]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    return users.filter((user) => {
      const matchesRole = role === "ALL" || user.role === role;
      const matchesQuery = !normalizedQuery || `${user.name} ${user.email}`.toLocaleLowerCase("vi-VN").includes(normalizedQuery);
      return matchesRole && matchesQuery;
    });
  }, [query, role, users]);

  return (
    <section className="admin-panel admin-users-panel">
      <div className="admin-panel-head admin-users-panel-head">
        <div><p>Database</p><h2>Danh sách tài khoản</h2><small>Quản lý quyền truy cập và trạng thái thành viên.</small></div>
        <span>{filteredUsers.length} người dùng</span>
      </div>

      <div className="admin-users-toolbar">
        <label className="admin-users-search"><FaSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email..." /></label>
        <div className="admin-users-role-filter" aria-label="Lọc theo vai trò">
          {(["ALL", "ADMIN", "USER"] as RoleFilter[]).map((value) => <button type="button" key={value} className={role === value ? "active" : ""} onClick={() => setRole(value)}>{value === "ALL" ? "Tất cả" : value === "ADMIN" ? "Quản trị viên" : "Thành viên"}</button>)}
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-users-table">
          <thead><tr><th>Người dùng</th><th>Nguồn</th><th>Vai trò</th><th>Hoạt động</th><th>Ngày tham gia</th><th>Hành động</th></tr></thead>
          <tbody>
            {filteredUsers.map((user) => {
              const isOnline = Boolean(now && user.lastActiveAt && now - new Date(user.lastActiveAt).getTime() < 90_000);
              const presenceLabel = !user.active ? "Đã khóa" : isOnline ? "Đang đăng nhập" : "Chưa đăng nhập";
              return <tr key={user.id}>
                <td><div className="admin-user-identity"><span className={`admin-user-avatar ${user.active ? "online" : "locked"}`}>{user.name.charAt(0).toUpperCase()}</span><div><strong>{user.name}</strong><span title={user.email}>{user.email}</span></div></div></td>
                <td><span className={`admin-user-provider-badge ${user.provider.toLowerCase()}`}><ProviderIcon provider={user.provider} /> {user.provider}</span></td>
                <td><span className={`admin-role-pill ${user.role === "ADMIN" ? "admin" : "user"}`}>{user.role === "ADMIN" ? <FaShieldAlt /> : <FaUser />}{user.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}</span></td>
                <td><div className="admin-user-activity"><span className={`admin-user-state ${!user.active ? "disabled" : isOnline ? "online" : "offline"}`}>{presenceLabel}</span><small><FaClock /> {isOnline ? "Đang mở website" : user.lastLoginAt ? `Lần cuối ${user.lastLoginAt}` : "Chưa từng đăng nhập"}</small></div></td>
                <td><time>{user.createdAt}</time></td>
                <td><AdminUserRoleButton userId={user.id} userName={user.name} currentRole={user.role} /></td>
              </tr>;
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <div className="admin-users-empty"><FaUsers /><strong>Không tìm thấy người dùng</strong><span>Hãy thử từ khóa hoặc bộ lọc khác.</span></div>}
      </div>
    </section>
  );
}
