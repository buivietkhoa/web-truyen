"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBullhorn, FaCloudUploadAlt, FaLink, FaSave, FaTimes } from "react-icons/fa";

interface AdminAffiliateFormProps {
  initialSetting: {
    affiliateUrl: string;
    buttonText: string;
    title: string;
    description: string;
    bannerImage: string;
    buttonColor: string;
    waitSeconds: number;
    fontSize: number;
    effect: string;
    enabled: boolean;
  };
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

async function uploadBanner(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Không thể upload banner."));
  }

  const data = await response.json();

  if (typeof data.url !== "string") {
    throw new Error("Server không trả về URL banner.");
  }

  return data.url;
}

export default function AdminAffiliateForm({ initialSetting }: AdminAffiliateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [setting, setSetting] = useState(initialSetting);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const previewBanner = bannerFile ? URL.createObjectURL(bannerFile) : setting.bannerImage;

  const updateSetting = (name: keyof typeof setting, value: string | number | boolean) => {
    setSetting((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    setBannerFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const bannerImage = bannerFile ? await uploadBanner(bannerFile) : setting.bannerImage;
      const response = await fetch("/api/admin/affiliate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...setting,
          bannerImage,
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Không thể lưu cấu hình affiliate."));
        return;
      }

      setBannerFile(null);
      setSetting((current) => ({
        ...current,
        bannerImage,
      }));
      setMessage("Đã lưu cấu hình affiliate.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-affiliate-layout" onSubmit={handleSubmit}>
      <section className="admin-affiliate-main">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="admin-create-card">
          <div className="admin-affiliate-card-title">
            <span>
              <FaBullhorn />
            </span>
            <h3>Cấu hình chung</h3>
          </div>

          <label className="admin-create-block">
            <span>Link Affiliate</span>
            <div className="admin-slug-input">
              <input
                value={setting.affiliateUrl}
                onChange={(event) => updateSetting("affiliateUrl", event.target.value)}
                placeholder="https://shopee.vn/..."
                disabled={loading}
              />
              <FaLink />
            </div>
          </label>

          <div className="admin-create-row">
            <label>
              <span>Văn bản trên nút</span>
              <input
                value={setting.buttonText}
                onChange={(event) => updateSetting("buttonText", event.target.value)}
                disabled={loading}
              />
            </label>
            <label>
              <span>Tiêu đề quảng cáo</span>
              <input
                value={setting.title}
                onChange={(event) => updateSetting("title", event.target.value)}
                disabled={loading}
              />
            </label>
          </div>

          <label className="admin-create-block">
            <span>Mô tả quảng cáo</span>
            <textarea
              value={setting.description}
              onChange={(event) => updateSetting("description", event.target.value)}
              disabled={loading}
              rows={3}
            />
          </label>

          <div className="admin-affiliate-upload-row">
            <div>
              <span>Ảnh banner quảng cáo</span>
              {previewBanner ? (
                <img src={previewBanner} alt="Xem trước banner affiliate" />
              ) : (
                <div className="admin-affiliate-banner-empty">Chưa có banner</div>
              )}
            </div>

            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}>
              <FaCloudUploadAlt />
              Tải ảnh mới
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              hidden
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>
        </div>

        <div className="admin-create-card">
          <div className="admin-affiliate-card-title">
            <span>
              <FaLink />
            </span>
            <h3>Cài đặt Gate Modal</h3>
          </div>

          <div className="admin-create-row">
            <label>
              <span>Màu sắc nút bấm</span>
              <input
                type="color"
                value={setting.buttonColor}
                onChange={(event) => updateSetting("buttonColor", event.target.value)}
                disabled={loading}
              />
            </label>
            <label>
              <span>Thời gian chờ (giây)</span>
              <input
                type="number"
                min={0}
                max={60}
                value={setting.waitSeconds}
                onChange={(event) => updateSetting("waitSeconds", Number(event.target.value))}
                disabled={loading}
              />
            </label>
          </div>

          <div className="admin-create-row">
            <label>
              <span>Cỡ chữ nút (px)</span>
              <input
                type="range"
                min={12}
                max={28}
                value={setting.fontSize}
                onChange={(event) => updateSetting("fontSize", Number(event.target.value))}
                disabled={loading}
              />
              <strong className="admin-affiliate-range-value">{setting.fontSize}px</strong>
            </label>
            <label>
              <span>Kiểu hiệu ứng mở</span>
              <select
                value={setting.effect}
                onChange={(event) => updateSetting("effect", event.target.value)}
                disabled={loading}
              >
                <option value="fade">Fade In</option>
                <option value="slide">Slide Up</option>
                <option value="zoom">Zoom</option>
              </select>
            </label>
          </div>

          <label className="admin-affiliate-toggle">
            <input
              type="checkbox"
              checked={setting.enabled}
              onChange={(event) => updateSetting("enabled", event.target.checked)}
              disabled={loading}
            />
            <span>Bật affiliate trong trang đọc truyện</span>
          </label>
        </div>
      </section>

      <aside className="admin-affiliate-preview-wrap">
        <div className="admin-affiliate-preview-head">
          <h3>Xem trước trực tiếp</h3>
          <span>Live</span>
        </div>

        <div className={`affiliate-gate-card preview ${setting.effect}`}>
          <button type="button" aria-label="Đóng xem trước">
            <FaTimes />
          </button>
          {previewBanner && <img src={previewBanner} alt="Banner affiliate" />}
          <div>
            <h2>{setting.title}</h2>
            <p>{setting.description}</p>
            <small>Nút sẽ mở khóa sau</small>
            <strong>{String(setting.waitSeconds).padStart(2, "0")}</strong>
            <a
              href={setting.affiliateUrl || "#"}
              style={{
                background: setting.buttonColor,
                fontSize: `${setting.fontSize}px`,
              }}
            >
              {setting.buttonText}
            </a>
          </div>
        </div>

        <div className="admin-create-actions admin-affiliate-save">
          <button type="submit" disabled={loading}>
            <FaSave />
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </aside>
    </form>
  );
}
