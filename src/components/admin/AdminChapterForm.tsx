"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBold, FaImage, FaItalic, FaLink, FaListUl, FaSave } from "react-icons/fa";

interface AdminChapterFormProps {
  storyId: string;
  nextChapterNumber: number;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

function getPlainTextFromHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export default function AdminChapterForm({ storyId, nextChapterNumber }: AdminChapterFormProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getEditorHtml = () => editorRef.current?.innerHTML || "";

  const runEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const insertImage = () => {
    const url = window.prompt("Nhập URL ảnh cần chèn vào chương:");

    if (url?.trim()) {
      runEditorCommand("insertImage", url.trim());
    }
  };

  const insertLink = () => {
    const url = window.prompt("Nhập URL liên kết:");

    if (url?.trim()) {
      runEditorCommand("createLink", url.trim());
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const content = getEditorHtml();

    if (!getPlainTextFromHtml(content)) {
      setError("Vui lòng nhập nội dung chương.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/stories/${storyId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: formData.get("number"),
          title: formData.get("title"),
          content,
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Không thể thêm chương."));
        return;
      }

      form.reset();
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

      setMessage("Đã thêm chương thành công.");
      router.refresh();
    } catch {
      setError("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-chapter-create" onSubmit={handleSubmit}>
      {message && <div className="alert alert-success admin-form-wide">{message}</div>}
      {error && <div className="alert alert-danger admin-form-wide">{error}</div>}

      <div className="admin-create-row">
        <label>
          <span>Số chương</span>
          <input name="number" type="number" min={1} defaultValue={nextChapterNumber} disabled={loading} />
        </label>

        <label>
          <span>Tiêu đề chương</span>
          <input name="title" placeholder={`Chương ${nextChapterNumber}`} required disabled={loading} />
        </label>
      </div>

      <label className="admin-create-block">
        <span>Nội dung chương</span>
        <div className="admin-editor">
          <div className="admin-editor-toolbar">
            <button type="button" onClick={() => runEditorCommand("bold")} aria-label="In đậm">
              <FaBold />
            </button>
            <button type="button" onClick={() => runEditorCommand("italic")} aria-label="In nghiêng">
              <FaItalic />
            </button>
            <button type="button" onClick={() => runEditorCommand("insertUnorderedList")} aria-label="Danh sách">
              <FaListUl />
            </button>
            <button type="button" onClick={insertImage} aria-label="Chèn ảnh">
              <FaImage />
            </button>
            <button type="button" onClick={insertLink} aria-label="Chèn liên kết">
              <FaLink />
            </button>
          </div>
          <div
            ref={editorRef}
            className="admin-editor-content admin-chapter-editor"
            contentEditable={!loading}
            data-placeholder="Nhập nội dung chương tại đây..."
            suppressContentEditableWarning
          />
        </div>
      </label>

      <div className="admin-form-actions">
        <button type="submit" disabled={loading}>
          <FaSave />
          {loading ? "Đang lưu..." : "Lưu chương"}
        </button>
      </div>
    </form>
  );
}
