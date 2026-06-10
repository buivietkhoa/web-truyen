"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrashAlt } from "react-icons/fa";

interface AdminDeleteChapterButtonProps {
  storyId: string;
  chapterId: string;
  chapterNumber: number;
}

export default function AdminDeleteChapterButton({
  storyId,
  chapterId,
  chapterNumber,
}: AdminDeleteChapterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Xóa chương ${chapterNumber}? Hành động này không thể hoàn tác.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stories/${storyId}/chapters/${chapterId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.message || "Không thể xóa chương.");
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
    <button type="button" className="admin-chapter-action delete" onClick={handleDelete} disabled={loading}>
      <FaTrashAlt />
      {loading ? "Đang xóa" : "Xóa"}
    </button>
  );
}
