"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaSave, FaTimes, FaUpload } from "react-icons/fa";
import { categories } from "@/data/categories";

interface Story {
  id: string;
  title: string;
  category: string;
  status: string;
  coverImage: string;
  description: string;
}

interface AdminEditStoryModalProps {
  story: Story;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

export default function AdminEditStoryModal({ story }: AdminEditStoryModalProps) {
  const router = useRouter();
  const descRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coverImage, setCoverImage] = useState(story.coverImage);

  const handleOpen = () => {
    setOpen(true);
    setError("");
    setSuccess("");
    setCoverImage(story.coverImage);
    setTimeout(() => {
      if (descRef.current) descRef.current.innerHTML = story.description;
    }, 0);
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
      if (!res.ok) { setError("Upload ảnh thất bại."); return; }
      const data = await res.json();
      setCoverImage(data.url);
    } catch {
      setError("Không thể kết nối server khi upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const form = e.currentTarget;
    const fd = new FormData(form);

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fd.get("title"),
          category: fd.get("category"),
          status: fd.get("status"),
          coverImage,
          description: descRef.current?.innerHTML || "",
        }),
      });

      if (!res.ok) { setError(await readErrorMessage(res, "Cập nhật thất bại.")); return; }

      setSuccess("Đã cập nhật truyện thành công.");
      router.refresh();
      setTimeout(() => setOpen(false), 900);
    } catch {
      setError("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" className="admin-story-action edit" onClick={handleOpen}>
        <FaEdit /> Sửa
      </button>

      {open && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3>Sửa truyện</h3>
              <button type="button" className="admin-modal-close" onClick={handleClose} disabled={loading}>
                <FaTimes />
              </button>
            </div>

            <form className="admin-modal-body" onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="admin-modal-row">
                <label>
                  <span>Tên truyện</span>
                  <input name="title" defaultValue={story.title} required disabled={loading} />
                </label>
              </div>

              <div className="admin-modal-row two-col">
                <label>
                  <span>Thể loại</span>
                  <select name="category" defaultValue={story.category} disabled={loading}>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Trạng thái</span>
                  <select name="status" defaultValue={story.status} disabled={loading}>
                    <option value="Đang ra">Đang ra</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Tạm ngưng">Tạm ngưng</option>
                  </select>
                </label>
              </div>

              <div className="admin-modal-cover-row">
                <span>Ảnh bìa</span>
                <div className="admin-modal-cover-body">
                  <img src={coverImage} alt="Ảnh bìa" className="admin-modal-cover-preview" />
                  <label className="admin-modal-upload-btn">
                    <FaUpload />
                    {uploading ? "Đang upload..." : "Đổi ảnh"}
                    <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading || loading} hidden />
                  </label>
                </div>
              </div>

              <div className="admin-modal-row">
                <span>Mô tả / Tóm tắt</span>
                <div
                  ref={descRef}
                  className="admin-modal-desc-editor"
                  contentEditable={!loading}
                  suppressContentEditableWarning
                  data-placeholder="Nhập mô tả truyện..."
                />
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-modal-cancel" onClick={handleClose} disabled={loading}>
                  Huỷ
                </button>
                <button type="submit" className="admin-modal-save" disabled={loading || uploading}>
                  <FaSave />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
