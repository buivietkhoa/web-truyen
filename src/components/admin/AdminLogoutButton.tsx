"use client";

import { FaSignOutAlt } from "react-icons/fa";

export default function AdminLogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/dang-nhap";
  };

  return (
    <button type="button" className="admin-logout" onClick={handleLogout}>
      <FaSignOutAlt /> Đăng xuất
    </button>
  );
}
