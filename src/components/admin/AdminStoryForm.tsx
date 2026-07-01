"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaBold,
  FaCloudUploadAlt,
  FaGlobeAsia,
  FaImage,
  FaItalic,
  FaLink,
  FaListUl,
  FaRegFileAlt,
  FaSave,
} from "react-icons/fa";
import { categories } from "@/data/categories";
import { uploadImageDirect } from "@/lib/upload-direct";

interface CreateStoryResponse {
  story?: { id?: string };
  message?: string;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

function createClientSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPlainTextFromHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

async function uploadCoverImage(file: File) {
  return uploadImageDirect(file);
}

export default function AdminStoryForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "");
  const [status, setStatus] = useState("Đang ra");
  const [displayMode, setDisplayMode] = useState<"public" | "draft">("public");
  const [notify, setNotify] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const previewUrl = useMemo(() => {
    if (!coverFile) return "";
    return URL.createObjectURL(coverFile);
  }, [coverFile]);
  const resolvedSlug = slug || createClientSlug(title);

  const handleFile = (file: File | undefined) => {
    if (file) setCoverFile(file);
  };

  const syncEditorHtml = () => setEditorHtml(editorRef.current?.innerHTML || "");

  const runEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorHtml();
  };

  const insertImage = () => {
    const url = window.prompt("Nhập URL ảnh cần chèn vào nội dung:");
    if (url?.trim()) runEditorCommand("insertImage", url.trim());
  };

  const insertLink = () => {
    const url = window.prompt("Nhập URL liên kết:");
    if (url?.trim()) runEditorCommand("createLink", url.trim());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const currentHtml = editorRef.current?.innerHTML || editorHtml;
    if (!getPlainTextFromHtml(currentHtml)) {
      setError("Vui lòng nhập nội dung giới thiệu truyện.");
      return;
    }
    if (!coverFile) {
      setError("Vui lòng chọn file ảnh bìa.");
      return;
    }

    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const coverImage = await uploadCoverImage(coverFile);
      const response = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          slug: resolvedSlug,
          category,
          status,
          coverImage,
          description: currentHtml,
          published: displayMode === "public",
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Không thể thêm truyện."));
        return;
      }

      const data = (await response.json()) as CreateStoryResponse;
      if (data.story?.id) {
        router.push(`/admin/truyen/${data.story.id}/chuong`);
        router.refresh();
        return;
      }

      setMessage("Đã thêm truyện thành công.");
      router.refresh();
    } catch (uploadOrCreateError) {
      setError(uploadOrCreateError instanceof Error ? uploadOrCreateError.message : "Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-create-story">
      <div className="admin-create-head">
        <div>
          <h2>Thêm truyện mới</h2>
          <p>Quản lý truyện / Tạo truyện mới</p>
        </div>
        <div className="admin-create-actions">
          <button type="button" onClick={() => router.push("/admin/truyen")} disabled={loading}>Hủy bỏ</button>
          <button type="submit" form="admin-create-story-form" disabled={loading}>
            <FaSave /> {loading ? "Đang lưu..." : "Lưu truyện mới"}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form id="admin-create-story-form" className="admin-create-grid" onSubmit={handleSubmit}>
        <div className="admin-create-card admin-create-main">
          <div className="admin-create-row">
            <label>
              <span>Tên truyện</span>
              <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nhập tên chính xác của bộ truyện" required disabled={loading} />
            </label>
            <label>
              <span>Slug</span>
              <div className="admin-slug-input">
                <input name="slug" value={resolvedSlug} onChange={(event) => setSlug(createClientSlug(event.target.value))} placeholder="ten-truyen-tu-dong" disabled={loading} />
                <FaLink />
              </div>
            </label>
          </div>

          <label className="admin-create-block">
            <span>Nội dung truyện</span>
            <div className="admin-editor">
              <div className="admin-editor-toolbar">
                <button type="button" onClick={() => runEditorCommand("bold")} aria-label="In đậm"><FaBold /></button>
                <button type="button" onClick={() => runEditorCommand("italic")} aria-label="In nghiêng"><FaItalic /></button>
                <button type="button" onClick={() => runEditorCommand("insertUnorderedList")} aria-label="Danh sách"><FaListUl /></button>
                <button type="button" onClick={insertImage} aria-label="Chèn ảnh"><FaImage /></button>
                <button type="button" onClick={insertLink} aria-label="Chèn liên kết"><FaLink /></button>
              </div>
              <div ref={editorRef} className="admin-editor-content" contentEditable={!loading} data-placeholder="Nhập nội dung giới thiệu hoặc phần nội dung truyện tại đây..." onInput={syncEditorHtml} onBlur={syncEditorHtml} suppressContentEditableWarning />
            </div>
          </label>

          <div className="admin-category-picker">
            <span>Chọn thể loại</span>
            <div>
              {categories.map((item) => (
                <button type="button" className={category === item.name ? "active" : ""} onClick={() => setCategory(item.name)} disabled={loading} key={item.slug}>{item.name}</button>
              ))}
              <button type="button" className="dashed" disabled>+ Thêm mới</button>
            </div>
          </div>
        </div>

        <aside className="admin-create-side">
          <section className="admin-create-card admin-cover-card">
            <h3>Ảnh bìa truyện</h3>
            <button type="button" className={`admin-cover-dropzone ${previewUrl ? "has-preview" : ""}`} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFile(event.dataTransfer.files[0]); }} disabled={loading}>
              {previewUrl ? <img src={previewUrl} alt="Xem trước ảnh bìa" /> : <><FaCloudUploadAlt /><strong>Kéo thả ảnh hoặc <span>tải lên</span></strong><small>Hỗ trợ: JPG, PNG, WebP, GIF</small></>}
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
            <div className="admin-notify-row">
              <div><strong>Bật thông báo</strong><p>Thông báo cho người theo dõi khi có chương mới.</p></div>
              <button type="button" aria-label="Bật hoặc tắt thông báo" className={notify ? "active" : ""} onClick={() => setNotify((current) => !current)} />
            </div>
          </section>

          <section className="admin-create-card admin-settings-card">
            <h3>Thiết lập</h3>
            <div className="admin-setting-group">
              <span>Trạng thái phát hành</span>
              {[
                ["Đang ra", "Truyện vẫn đang ra chương mới"],
                ["Hoàn thành", "Bộ truyện đã kết thúc hoàn toàn"],
                ["Tạm ngưng", "Tạm dừng cập nhật chương"],
              ].map(([value, description]) => (
                <label className={status === value ? "active" : ""} key={value}>
                  <input type="radio" name="status" checked={status === value} onChange={() => setStatus(value)} />
                  <div><strong>{value}</strong><small>{description}</small></div>
                </label>
              ))}
            </div>

            <div className="admin-setting-group">
              <span>Chế độ hiển thị</span>
              <div className="admin-display-mode">
                <button type="button" className={displayMode === "public" ? "active" : ""} onClick={() => setDisplayMode("public")}><FaGlobeAsia />Công khai</button>
                <button type="button" className={displayMode === "draft" ? "active" : ""} onClick={() => setDisplayMode("draft")}><FaRegFileAlt />Bản nháp</button>
              </div>
            </div>
          </section>
        </aside>
      </form>
    </section>
  );
}
