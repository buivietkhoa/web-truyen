"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCamera, FaSpinner } from "react-icons/fa";

interface Props {
  currentAvatar: string;
  userName: string;
}

export default function AvatarUpload({ currentAvatar, userName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Upload thất bại.");
        setPreview(currentAvatar);
        return;
      }

      router.refresh();
    } catch {
      setError("Lỗi kết nối, thử lại sau.");
      setPreview(currentAvatar);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="profile-avatar">
      <img src={preview} alt={userName} />

      <button
        type="button"
        className={`avatar-edit-btn ${uploading ? "uploading" : ""}`}
        onClick={() => !uploading && inputRef.current?.click()}
        aria-label="Thay ảnh đại diện"
        title="Thay ảnh đại diện"
        disabled={uploading}
      >
        {uploading ? <FaSpinner className="spinning" /> : <FaCamera />}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {error && <p className="avatar-error">{error}</p>}
    </div>
  );
}
