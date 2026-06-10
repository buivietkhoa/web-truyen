"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaClock,
  FaCloudUploadAlt,
  FaImage,
  FaLink,
  FaMagic,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

interface AffiliateProduct {
  id: string;
  title: string;
  description: string;
  affiliateUrl: string;
  imageUrl: string;
  enabled: boolean;
}

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
  initialProducts: AffiliateProduct[];
}

const emptyProduct = {
  title: "",
  description: "",
  affiliateUrl: "",
  imageUrl: "",
  enabled: true,
};

const defaultProductTitle = "Ưu đãi độc quyền";
const defaultProductDescription = "Sản phẩm đang được giảm giá tại sàn liên kết.";

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
    throw new Error(await readErrorMessage(response, "Không thể upload ảnh."));
  }

  const data = await response.json();

  if (typeof data.url !== "string") {
    throw new Error("Server không trả về URL ảnh.");
  }

  return data.url;
}

function cleanExternalUrl(value: string) {
  const cleaned = value
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "");

  if (!cleaned) {
    return "";
  }

  if (cleaned.startsWith("//")) {
    return `https:${cleaned}`;
  }

  return /^[a-z][a-z\d+\-.]*:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
}

function cleanImageUrl(value: string) {
  const cleaned = value
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "");

  if (!cleaned) {
    return "";
  }

  return cleaned.startsWith("/uploads/") ? cleaned : cleanExternalUrl(cleaned);
}

function displayUrl(value: string) {
  try {
    const url = new URL(cleanExternalUrl(value));
    const path = `${url.pathname}${url.search}`;
    return `${url.hostname}${path.length > 18 ? `${path.slice(0, 18)}...` : path}`;
  } catch {
    return "shopee.vn/uu-dai...";
  }
}

export default function AdminAffiliateForm({ initialSetting, initialProducts }: AdminAffiliateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [setting, setSetting] = useState(initialSetting);
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const draftImage = imageFile ? URL.createObjectURL(imageFile) : draft.imageUrl;

  const previewProduct =
    products.find((product) => product.enabled) ||
    (draft.affiliateUrl || draftImage
      ? {
          id: "draft",
          title: defaultProductTitle,
          description: defaultProductDescription,
          affiliateUrl: draft.affiliateUrl || "https://shopee.vn",
          imageUrl: draftImage,
          enabled: true,
      }
      : null);

  const updateSetting = (name: keyof typeof setting, value: string | number | boolean) => {
    setSetting((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateDraft = (name: keyof typeof draft, value: string | boolean) => {
    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveSetting = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/affiliate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...setting,
          affiliateUrl: setting.affiliateUrl || "https://shopee.vn",
          title: setting.title || "Ưu đãi độc quyền",
          description: setting.description || "Sản phẩm đang được giảm giá tại sàn liên kết.",
          bannerImage: setting.bannerImage || "/img/cover.png",
          buttonText: setting.buttonText || "Mua ngay",
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Không thể lưu cấu hình affiliate."));
        return;
      }

      setMessage("Đã lưu cấu hình hiển thị affiliate.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const affiliateUrl = cleanExternalUrl(draft.affiliateUrl);
    const imageUrl = imageFile ? "" : cleanImageUrl(draft.imageUrl);

    if (!affiliateUrl || (!imageFile && !imageUrl)) {
      setError("Vui lòng nhập link affiliate và upload ảnh sản phẩm.");
      return;
    }

    setLoading(true);

    try {
      const finalImageUrl = imageFile ? await uploadBanner(imageFile) : imageUrl;
      const response = await fetch("/api/admin/affiliate/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: defaultProductTitle,
          description: defaultProductDescription,
          affiliateUrl,
          imageUrl: finalImageUrl,
          enabled: draft.enabled,
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Không thể thêm sản phẩm affiliate."));
        return;
      }

      const data = await response.json();
      setProducts((current) => [data.product, ...current]);
      setDraft(emptyProduct);
      setImageFile(null);
      setMessage("Đã thêm sản phẩm affiliate.");
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = async (product: AffiliateProduct) => {
    setError("");
    setMessage("");

    const nextEnabled = !product.enabled;
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? { ...item, enabled: nextEnabled } : item))
    );

    const response = await fetch(`/api/admin/affiliate/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enabled: nextEnabled,
      }),
    });

    if (!response.ok) {
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? { ...item, enabled: product.enabled } : item))
      );
      setError(await readErrorMessage(response, "Không thể cập nhật sản phẩm affiliate."));
    }
  };

  const deleteProduct = async (productId: string) => {
    setError("");
    setMessage("");

    const snapshot = products;
    setProducts((current) => current.filter((product) => product.id !== productId));

    const response = await fetch(`/api/admin/affiliate/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setProducts(snapshot);
      setError(await readErrorMessage(response, "Không thể xóa sản phẩm affiliate."));
      return;
    }

    setMessage("Đã xóa sản phẩm affiliate.");
  };

  return (
    <div className="aff-layout">
      <div className="aff-main">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <section className={`aff-status-bar ${setting.enabled ? "on" : "off"}`}>
          <div className="aff-status-info">
            <span className="aff-status-dot" />
            <div>
              <strong>{setting.enabled ? "Affiliate đang hoạt động" : "Affiliate đã tắt"}</strong>
              <p>
                {setting.enabled
                  ? "Modal sẽ chọn ngẫu nhiên một sản phẩm đang bật từ danh sách bên dưới."
                  : "Người đọc sẽ không thấy quảng cáo affiliate."}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={setting.enabled}
            className={`aff-toggle ${setting.enabled ? "on" : ""}`}
            onClick={() => updateSetting("enabled", !setting.enabled)}
            disabled={loading}
          />
        </section>

        <section className="admin-create-card">
          <div className="admin-affiliate-card-title">
            <span>
              <FaMagic />
            </span>
            <div>
              <h3>Cấu hình modal</h3>
              <p>Áp dụng chung cho toàn bộ sản phẩm affiliate.</p>
            </div>
          </div>

          <div className="aff-settings-grid">
            <label className="aff-setting-item">
              <span>
                <FaClock /> Thời gian chờ
              </span>
              <p>Số giây đếm ngược trước khi người đọc click được link hoặc ảnh.</p>
              <input
                type="number"
                min={0}
                max={60}
                value={setting.waitSeconds}
                onChange={(event) => updateSetting("waitSeconds", Number(event.target.value))}
                disabled={loading}
              />
            </label>

            <label className="aff-setting-item">
              <span>
                <FaMagic /> Hiệu ứng mở modal
              </span>
              <p>Kiểu hoạt ảnh khi modal xuất hiện.</p>
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

          <div className="aff-save-row">
            <button type="button" className="aff-save-btn" onClick={saveSetting} disabled={loading}>
              <FaSave />
              Lưu cấu hình modal
            </button>
          </div>
        </section>

        <form className="admin-create-card" onSubmit={createProduct}>
          <div className="admin-affiliate-card-title">
            <span>
              <FaPlus />
            </span>
            <div>
              <h3>Thêm sản phẩm affiliate</h3>
              <p>Mỗi sản phẩm có link và ảnh riêng. Website sẽ chọn ngẫu nhiên sản phẩm đang bật.</p>
            </div>
          </div>

          <label className="admin-create-block">
            <span>Link Affiliate</span>
            <div className="admin-slug-input">
              <input
                value={draft.affiliateUrl}
                onChange={(event) => updateDraft("affiliateUrl", event.target.value)}
                placeholder="https://shopee.vn/..."
                disabled={loading}
              />
              <FaLink />
            </div>
          </label>

          <div className="aff-banner-row">
            <div className="aff-banner-preview">
              {draftImage ? (
                <img src={draftImage} alt="Ảnh sản phẩm affiliate" />
              ) : (
                <div className="aff-banner-empty">
                  <FaImage />
                  <span>Chưa có ảnh sản phẩm</span>
                </div>
              )}
            </div>
            <div className="aff-banner-info">
              <p>Ảnh này sẽ hiển thị trong modal đọc truyện và có thể click để mở link affiliate.</p>
              <button
                type="button"
                className="aff-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <FaCloudUploadAlt />
                {imageFile ? "Đổi ảnh khác" : "Tải ảnh lên"}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
          />

          <div className="aff-save-row">
            <button type="submit" className="aff-save-btn" disabled={loading}>
              <FaPlus />
              {loading ? "Đang lưu..." : "Thêm sản phẩm"}
            </button>
          </div>
        </form>

        <section className="admin-create-card">
          <div className="admin-affiliate-card-title">
            <span>
              <FaImage />
            </span>
            <div>
              <h3>Danh sách sản phẩm affiliate</h3>
              <p>{products.length} sản phẩm. Chỉ sản phẩm đang bật mới được chọn ngẫu nhiên.</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="admin-empty">
              <h3>Chưa có sản phẩm affiliate</h3>
              <p>Thêm ít nhất một sản phẩm để modal hiển thị trên trang đọc truyện.</p>
            </div>
          ) : (
            <div className="affiliate-product-list">
              {products.map((product) => (
                <article className={`affiliate-product-item ${product.enabled ? "active" : ""}`} key={product.id}>
                  <img src={product.imageUrl} alt={product.title} />
                  <div>
                    <h4>{product.title}</h4>
                    <p>{product.description}</p>
                    <a href={product.affiliateUrl} target="_blank" rel="noreferrer">
                      {displayUrl(product.affiliateUrl)}
                    </a>
                  </div>
                  <div className="affiliate-product-actions">
                    <button type="button" onClick={() => toggleProduct(product)}>
                      {product.enabled ? "Đang bật" : "Đã tắt"}
                    </button>
                    <button type="button" className="danger" onClick={() => deleteProduct(product.id)}>
                      <FaTrash />
                      Xóa
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="aff-preview-col">
        <div className="aff-preview-header">
          <div>
            <h3>Xem trước modal</h3>
            <p>Sản phẩm thực tế sẽ được chọn ngẫu nhiên khi người đọc mở chương.</p>
          </div>
          <span className={`aff-live-badge ${setting.enabled ? "active" : ""}`}>
            {setting.enabled ? "Đang bật" : "Đã tắt"}
          </span>
        </div>

        <div className="aff-preview-frame">
          <div className="aff-preview-backdrop" />
          <div className={`aff-modal-card aff-effect-${setting.effect}`}>
            <button type="button" className="aff-modal-close" aria-label="Đóng">
              <FaTimes />
            </button>

            <div className="aff-modal-body">
              <p className="aff-modal-instruction">
                Mời Quý độc giả <strong>CLICK VÀO LINK LIÊN KẾT HOẶC ẢNH</strong> bên dưới{" "}
                <span style={{ color: "#dc2626", fontWeight: 800 }}>MỞ ỨNG DỤNG SHOPEE</span> để tiếp tục đọc!
              </p>

              <div className="aff-card-url-bar aff-preview-url">
                {previewProduct ? displayUrl(previewProduct.affiliateUrl) : "Chưa có sản phẩm"}
              </div>

              <div className="aff-modal-banner-wrap">
                {previewProduct?.imageUrl ? (
                  <img src={previewProduct.imageUrl} alt={previewProduct.title} className="aff-modal-banner" />
                ) : (
                  <div className="aff-modal-banner-empty">
                    <FaImage />
                    <span>Chưa có ảnh sản phẩm</span>
                  </div>
                )}
                {setting.waitSeconds > 0 && (
                  <div className="aff-modal-countdown-overlay">
                    <strong>{String(setting.waitSeconds).padStart(2, "0")}</strong>
                    <span>giây</span>
                  </div>
                )}
              </div>

              <div className="aff-modal-preview-copy">
                <strong>{previewProduct?.title || "Chưa có sản phẩm affiliate"}</strong>
                <span>{previewProduct?.description || "Thêm sản phẩm để website chọn ngẫu nhiên."}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="aff-preview-note">Trang đọc truyện sẽ chỉ hiện sản phẩm đang bật.</p>
      </aside>
    </div>
  );
}
