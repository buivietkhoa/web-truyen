"use client";

import { FormEvent, useState } from "react";
import { FaSave, FaUpload } from "react-icons/fa";

interface SiteSetting {
  siteName: string;
  siteDesc: string;
  logoUrl: string;
  primaryColor: string;
  contactEmail: string;
  footerText: string;
}

interface AdminSettingsFormProps {
  initialSetting: SiteSetting;
}

export default function AdminSettingsForm({ initialSetting }: AdminSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState(initialSetting.logoUrl);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
      if (!res.ok) { setError("Upload logo thất bại."); return; }
      const data = await res.json();
      setLogoUrl(data.url);
    } catch {
      setError("Không thể kết nối server.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName:     fd.get("siteName"),
          siteDesc:     fd.get("siteDesc"),
          logoUrl,
          primaryColor: fd.get("primaryColor"),
          contactEmail: fd.get("contactEmail"),
          footerText:   fd.get("footerText"),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Lưu thất bại."); return; }
      setMessage("Đã lưu cài đặt thành công.");
    } catch {
      setError("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-settings-form" onSubmit={handleSubmit}>
      {message && <div className="alert alert-success">{message}</div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      <div className="admin-settings-section">
        <h3>Thông tin chung</h3>
        <div className="admin-settings-grid">
          <label>
            <span>Tên website</span>
            <input name="siteName" defaultValue={initialSetting.siteName} disabled={loading} />
          </label>
          <label>
            <span>Email liên hệ</span>
            <input name="contactEmail" type="email" defaultValue={initialSetting.contactEmail} disabled={loading} />
          </label>
          <label className="admin-settings-full">
            <span>Mô tả website</span>
            <input name="siteDesc" defaultValue={initialSetting.siteDesc} disabled={loading} />
          </label>
          <label className="admin-settings-full">
            <span>Chữ footer</span>
            <input name="footerText" defaultValue={initialSetting.footerText} placeholder="© 2025 Mọt Chạm. All rights reserved." disabled={loading} />
          </label>
        </div>
      </div>

      <div className="admin-settings-section">
        <h3>Giao diện</h3>
        <div className="admin-settings-grid">
          <div className="admin-settings-logo-row">
            <span>Logo website</span>
            <div className="admin-settings-logo-body">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="admin-settings-logo-preview" />
              ) : (
                <div className="admin-settings-logo-empty">Chưa có logo</div>
              )}
              <label className="admin-modal-upload-btn">
                <FaUpload />
                {uploading ? "Đang upload..." : "Chọn ảnh"}
                <input type="file" accept="image/*" onChange={handleUploadLogo} disabled={uploading || loading} hidden />
              </label>
            </div>
          </div>

          <label>
            <span>Màu chủ đạo</span>
            <div className="admin-settings-color-row">
              <input name="primaryColor" type="color" defaultValue={initialSetting.primaryColor} disabled={loading} className="admin-settings-color-input" />
              <span className="admin-settings-color-hint">Màu nút và accent</span>
            </div>
          </label>
        </div>
      </div>

      <div className="admin-settings-footer">
        <button type="submit" className="admin-modal-save" disabled={loading || uploading}>
          <FaSave />
          {loading ? "Đang lưu..." : "Lưu cài đặt"}
        </button>
      </div>
    </form>
  );
}
