"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBold, FaImage, FaItalic, FaLink, FaListUl, FaSave } from "react-icons/fa";

interface AdminChapterFormProps {
  storyId: string;
  nextChapterNumber: number;
  storyPublished: boolean;
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

export default function AdminChapterForm({ storyId, nextChapterNumber, storyPublished }: AdminChapterFormProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(storyPublished);
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
          title,
          content,
          published,
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Không thể thêm chương."));
        return;
      }

      form.reset();
      setTitle("");
      setPublished(storyPublished);
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

      <div className="admin-chapter-fields-row">
        <label>
          <span>Chương tiếp theo</span>
          <input type="number" value={nextChapterNumber} readOnly aria-readonly="true" />
        </label>

        <label>
          <span>Tiêu đề chương</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`Chương ${nextChapterNumber}`} disabled={loading} />
        </label>

        <div
          className="admin-chapter-publish-field"
          title={!storyPublished ? "Truyện đang là bản nháp nên chương chưa xuất hiện ngoài website." : undefined}
        >
          <span>Hiển thị</span>
          <label className="admin-inline-check admin-chapter-publish-toggle">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              disabled={loading}
            />
            <strong>{published ? "Công khai chương" : "Lưu chương nháp"}</strong>
          </label>
        </div>
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
          {loading ? "Đang lưu..." : published ? "Đăng chương" : "Lưu bản nháp"}
        </button>
      </div>
    </form>
  );
}
