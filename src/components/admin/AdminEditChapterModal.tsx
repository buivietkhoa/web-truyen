"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

interface Chapter {
  id: string;
  storyId: string;
  number: number;
  title: string;
  content: string;
}

interface AdminEditChapterModalProps {
  chapter: Chapter;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

export default function AdminEditChapterModal({ chapter }: AdminEditChapterModalProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleOpen = () => {
    setOpen(true);
    setError("");
    setSuccess("");
    setTimeout(() => {
      if (contentRef.current) contentRef.current.innerHTML = chapter.content;
    }, 0);
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const fd = new FormData(e.currentTarget);

    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/stories/${chapter.storyId}/chapters/${chapter.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: fd.get("title"),
            number: Number(fd.get("number")),
            content: contentRef.current?.innerHTML || "",
          }),
        }
      );

      if (!res.ok) { setError(await readErrorMessage(res, "Cập nhật thất bại.")); return; }

      setSuccess("Đã cập nhật chương thành công.");
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
      <button type="button" className="admin-chapter-action edit" onClick={handleOpen}>
        <FaEdit /> Sửa
      </button>

      {open && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div className="admin-modal admin-modal-wide">
            <div className="admin-modal-head">
              <h3>Sửa chương {chapter.number}</h3>
              <button type="button" className="admin-modal-close" onClick={handleClose} disabled={loading}>
                <FaTimes />
              </button>
            </div>

            <form className="admin-modal-body" onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="admin-modal-row two-col">
                <label>
                  <span>Số chương</span>
                  <input name="number" type="number" min={1} defaultValue={chapter.number} required disabled={loading} />
                </label>
                <label>
                  <span>Tiêu đề</span>
                  <input name="title" defaultValue={chapter.title} required disabled={loading} />
                </label>
              </div>

              <div className="admin-modal-row">
                <span>Nội dung chương</span>
                <div
                  ref={contentRef}
                  className="admin-modal-desc-editor admin-modal-chapter-editor"
                  contentEditable={!loading}
                  suppressContentEditableWarning
                  data-placeholder="Nội dung chương..."
                />
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-modal-cancel" onClick={handleClose} disabled={loading}>
                  Huỷ
                </button>
                <button type="submit" className="admin-modal-save" disabled={loading}>
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
