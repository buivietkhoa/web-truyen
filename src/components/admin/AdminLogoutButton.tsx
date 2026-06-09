"use client";

export default function AdminLogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/dang-nhap";
  };

  return (
    <button type="button" className="admin-logout" onClick={handleLogout}>
      Đăng xuất
    </button>
  );
}
