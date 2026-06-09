"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaShieldAlt, FaUser } from "react-icons/fa";

interface AdminUserRoleButtonProps {
  userId: string;
  userName: string;
  currentRole: "USER" | "ADMIN";
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

export default function AdminUserRoleButton({ userId, userName, currentRole }: AdminUserRoleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
  const label = currentRole === "ADMIN" ? "Hạ quyền" : "Cấp admin";

  const handleClick = async () => {
    const confirmed = window.confirm(
      currentRole === "ADMIN"
        ? `Hạ quyền "${userName}" về USER?`
        : `Cấp quyền ADMIN cho "${userName}"? Người này sẽ vào được trang quản trị.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: nextRole,
        }),
      });

      if (!response.ok) {
        window.alert(await readErrorMessage(response, "Không thể cập nhật quyền."));
        return;
      }

      router.refresh();
    } catch {
      window.alert("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`admin-user-role-action ${currentRole === "ADMIN" ? "danger" : "primary"}`}
      onClick={handleClick}
      disabled={loading}
    >
      {currentRole === "ADMIN" ? <FaUser /> : <FaShieldAlt />}
      {loading ? "Đang lưu" : label}
    </button>
  );
}
