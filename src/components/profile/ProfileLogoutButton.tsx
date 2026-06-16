"use client";

import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default function ProfileLogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/dang-nhap";
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      className="profile-menu-button profile-logout-button"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      <FaSignOutAlt />
      <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
    </button>
  );
}
