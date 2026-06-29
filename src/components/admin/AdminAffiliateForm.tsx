"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCloudUploadAlt,
  FaImage,
  FaLink,
  FaPlus,
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


function displayUrl(value: string) {
  try {
    const url = new URL(cleanExternalUrl(value));
    const path = `${url.pathname}${url.search}`;
    return `${url.hostname}${path.length > 18 ? `${path.slice(0, 18)}...` : path}`;
  } catch {
    return "shopee.vn/uu-dai...";
  }
}

const PLATFORMS = [
  { key: "shopee", label: "Shopee", color: "#ee4d2d", placeholder: "https://shopee.vn/..." },
  { key: "tiktok", label: "TikTok", color: "#010101", placeholder: "https://shop.tiktok.com/..." },
  { key: "lazada", label: "Lazada", color: "#0f146d", placeholder: "https://www.lazada.vn/..." },
] as const;

type PlatformKey = "shopee" | "tiktok" | "lazada";


export default function AdminAffiliateForm({ initialSetting, initialProducts }: AdminAffiliateFormProps) {
  const router = useRouter();
  const [setting, setSetting] = useState(initialSetting);
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingKey, setLoadingKey] = useState<PlatformKey | null>(null);

  // Stats
  const [stats, setStats] = useState<{
    totalClicks: number;
    todayClicks: number;
    weekClicks: number;
    monthClicks: number;
    clicksByProduct: Record<string, number>;
  } | null>(null);

  const fetchStats = () => {
    fetch("/api/admin/affiliate/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setStats(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30_000); // auto-refresh 30 giây
    return () => clearInterval(interval);
  }, []);

  // Draft riêng cho mỗi sàn
  const [links, setLinks] = useState<Record<PlatformKey, string>>({ shopee: "", tiktok: "", lazada: "" });
  const [images, setImages] = useState<Record<PlatformKey, File | null>>({ shopee: null, tiktok: null, lazada: null });
  const fileRefs = {
    shopee: useRef<HTMLInputElement>(null),
    tiktok: useRef<HTMLInputElement>(null),
    lazada: useRef<HTMLInputElement>(null),
  };

  const previewProduct = products.find((p) => p.enabled) || null;

  const updateSetting = (name: keyof typeof setting, value: string | number | boolean) => {
    setSetting((cur) => ({ ...cur, [name]: value }));
  };

  const saveProduct = async (platform: PlatformKey) => {
    setMessage(""); setError("");
    const affiliateUrl = cleanExternalUrl(links[platform]);
    const imgFile = images[platform];
    if (!affiliateUrl || !imgFile) {
      setError(`Vui lòng nhập link và ảnh cho ${platform}.`);
      return;
    }
    setLoadingKey(platform);
    try {
      const imageUrl = await uploadBanner(imgFile);
      const res = await fetch("/api/admin/affiliate/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: defaultProductTitle,
          description: defaultProductDescription,
          affiliateUrl,
          imageUrl,
          enabled: true,
        }),
      });
      if (!res.ok) { setError(await readErrorMessage(res, "Không thể thêm sản phẩm.")); return; }
      const data = await res.json();
      setProducts((cur) => [data.product, ...cur]);
      setLinks((cur) => ({ ...cur, [platform]: "" }));
      setImages((cur) => ({ ...cur, [platform]: null }));
      setMessage(`Đã thêm sản phẩm ${PLATFORMS.find(p => p.key === platform)?.label}.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi kết nối.");
    } finally {
      setLoadingKey(null);
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

  function getMarketplaceLabel(url: string) {
    try {
      const host = new URL(cleanExternalUrl(url)).hostname.toLowerCase();
      if (host.includes("shopee")) return { label: "Shopee", color: "#ee4d2d" };
      if (host.includes("tiktok")) return { label: "TikTok", color: "#010101" };
      if (host.includes("lazada")) return { label: "Lazada", color: "#0f146d" };
    } catch { /* ok */ }
    return { label: "Khác", color: "#64748b" };
  }

  return (
    <div className="aff-layout">
      <div className="aff-main">
        {message && <div className="alert alert-success mb-0">{message}</div>}
        {error   && <div className="alert alert-danger  mb-0">{error}</div>}

        {/* Status bar */}
        <section className={`aff-status-bar ${setting.enabled ? "on" : "off"}`}>
          <div className="aff-status-info">
            <span className="aff-status-dot" />
            <div>
              <strong>{setting.enabled ? "Affiliate đang hoạt động" : "Affiliate đã tắt"}</strong>
              <p>
                {setting.enabled
                  ? "Sản phẩm hiện theo thứ tự: Shopee → TikTok → Lazada · cứ 10 phút đọc hiện 1 lần."
                  : "Người đọc sẽ không thấy quảng cáo affiliate."}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={setting.enabled}
            className={`aff-toggle ${setting.enabled ? "on" : ""}`}
            onClick={async () => {
              const next = !setting.enabled;
              updateSetting("enabled", next);
              await fetch("/api/admin/affiliate", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...setting, enabled: next, effect: "fade" }),
              });
            }}
            disabled={loadingKey !== null}
          />
        </section>

        {/* Thống kê clicks */}
        <div className="aff-stats-bar">
          <div className="aff-stats-items">
            <div className="aff-stat-item">
              <span>Hôm nay</span>
              <strong>{stats?.todayClicks ?? "—"}</strong>
            </div>
            <div className="aff-stat-divider" />
            <div className="aff-stat-item">
              <span>7 ngày</span>
              <strong>{stats?.weekClicks ?? "—"}</strong>
            </div>
            <div className="aff-stat-divider" />
            <div className="aff-stat-item">
              <span>Tháng này</span>
              <strong>{stats?.monthClicks ?? "—"}</strong>
            </div>
            <div className="aff-stat-divider" />
            <div className="aff-stat-item highlight">
              <span>Tổng cộng</span>
              <strong>{stats?.totalClicks ?? "—"}</strong>
            </div>
          </div>
          <button type="button" className="aff-refresh-btn" onClick={fetchStats} title="Làm mới">
            ↻
          </button>
        </div>

        {/* Thêm sản phẩm theo từng sàn */}
        <section className="admin-create-card">
          <div className="aff-config-header">
            <div className="aff-config-icon add"><FaPlus /></div>
            <div>
              <h3>Thêm sản phẩm affiliate</h3>
              <p>Nhập link và ảnh riêng cho từng sàn.</p>
            </div>
          </div>

          <div className="aff-platform-list">
            {PLATFORMS.map(({ key, label, color, placeholder }) => {
              const imgFile = images[key];
              const preview = imgFile ? URL.createObjectURL(imgFile) : null;
              const isLoading = loadingKey === key;
              return (
                <div key={key} className="aff-platform-row">
                  <span className="aff-mp-badge" style={{ background: color }}>{label}</span>

                  <div className="admin-slug-input aff-link-input">
                    <input
                      value={links[key]}
                      onChange={(e) => setLinks((cur) => ({ ...cur, [key]: e.target.value }))}
                      placeholder={placeholder}
                      disabled={isLoading}
                    />
                    <FaLink />
                  </div>

                  <div
                    className="aff-image-inline"
                    onClick={() => fileRefs[key].current?.click()}
                    role="button" tabIndex={0}
                    title="Upload ảnh"
                  >
                    {preview
                      ? <img src={preview} alt="preview" />
                      : <><FaCloudUploadAlt /><span>Ảnh</span></>
                    }
                  </div>

                  <button
                    type="button"
                    className="aff-save-btn"
                    onClick={() => saveProduct(key)}
                    disabled={isLoading || !links[key] || !imgFile}
                  >
                    <FaPlus /> {isLoading ? "..." : "Lưu"}
                  </button>

                  <input
                    ref={fileRefs[key]}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    hidden
                    onChange={(e) => setImages((cur) => ({ ...cur, [key]: e.target.files?.[0] || null }))}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Danh sách sản phẩm */}
        <section className="admin-create-card">
          <div className="aff-config-header">
            <div className="aff-config-icon list"><FaImage /></div>
            <div>
              <h3>Danh sách sản phẩm</h3>
              <p>{products.length} sản phẩm · thứ tự hiện: Shopee → TikTok → Lazada</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="aff-empty-state">
              <FaImage />
              <p>Chưa có sản phẩm affiliate. Thêm ít nhất một sản phẩm để popup hoạt động.</p>
            </div>
          ) : (
            <div className="aff-product-list">
              {products.map((product, idx) => {
                const mp = getMarketplaceLabel(product.affiliateUrl);
                return (
                  <div className={`aff-product-card ${product.enabled ? "" : "disabled"}`} key={product.id}>
                    <div className="aff-product-thumb">
                      <img src={product.imageUrl} alt={product.title} />
                      <span className="aff-order-badge">{idx + 1}</span>
                    </div>
                    <div className="aff-product-info">
                      <div className="aff-product-top">
                        <span className="aff-mp-badge" style={{ background: mp.color }}>{mp.label}</span>
                        <span className={`aff-status-chip ${product.enabled ? "on" : "off"}`}>
                          {product.enabled ? "Đang bật" : "Đã tắt"}
                        </span>
                        {stats && (
                          <span className="aff-click-count">
                            🖱️ {stats.clicksByProduct[product.id] ?? 0} click
                          </span>
                        )}
                      </div>
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="aff-product-url"
                      >
                        {displayUrl(product.affiliateUrl)}
                      </a>
                    </div>
                    <div className="aff-product-btns">
                      <button
                        type="button"
                        className={`aff-toggle-btn ${product.enabled ? "on" : ""}`}
                        onClick={() => toggleProduct(product)}
                      >
                        {product.enabled ? "Tắt" : "Bật"}
                      </button>
                      <button
                        type="button"
                        className="aff-delete-btn"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Preview */}
      <aside className="aff-preview-col">
        <div className="aff-preview-header">
          <div>
            <h3>Xem trước popup</h3>
            <p>Giao diện popup người đọc thấy.</p>
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
                Mời Quý độc giả <strong>CLICK VÀO LINK LIÊN KẾT HOẶC ẢNH</strong> bên dưới để ủng hộ tác giả!
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
              </div>
              <div className="aff-modal-preview-copy">
                <strong>{previewProduct?.title || "Chưa có sản phẩm"}</strong>
                <span>{previewProduct?.description || "Thêm sản phẩm để popup hoạt động."}</span>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </div>
  );
}
