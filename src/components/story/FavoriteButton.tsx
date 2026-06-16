"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface FavoriteButtonProps {
  storyId: string;
  initialFavorite: boolean;
  isLoggedIn: boolean;
}

export default function FavoriteButton({ storyId, initialFavorite, isLoggedIn }: FavoriteButtonProps) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      router.push("/dang-nhap");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/favorites", {
        method: favorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId }),
      });

      if (response.status === 401) {
        router.push("/dang-nhap");
        return;
      }
      if (!response.ok) throw new Error("Không thể cập nhật yêu thích.");

      const data = await response.json();
      setFavorite(Boolean(data.favorite));
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn favorite-button${favorite ? " active" : ""}`}
      onClick={toggleFavorite}
      disabled={loading}
      aria-pressed={favorite}
    >
      {favorite ? <FaHeart /> : <FaRegHeart />}
      {loading ? "Đang lưu..." : favorite ? "Đã yêu thích" : "Yêu thích"}
    </button>
  );
}
