"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrashAlt } from "react-icons/fa";

interface AdminDeleteStoryButtonProps {
  storyId: string;
  storyTitle: string;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

export default function AdminDeleteStoryButton({ storyId, storyTitle }: AdminDeleteStoryButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Xóa truyện "${storyTitle}"? Toàn bộ chương của truyện này cũng sẽ bị xóa.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        window.alert(await readErrorMessage(response, "Không thể xóa truyện."));
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
      className="admin-story-delete"
      onClick={handleDelete}
      disabled={loading}
    >
      <FaTrashAlt />
      {loading ? "Đang xóa" : "Xóa"}
    </button>
  );
}
