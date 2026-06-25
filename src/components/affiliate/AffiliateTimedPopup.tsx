"use client";

import { useEffect, useRef, useState } from "react";
import { FaLock, FaTimes } from "react-icons/fa";

/** localStorage: số link đã hiện cho từng truyện */
function shownKey(storyId: string) { return `aff_shown_${storyId}`; }
/** sessionStorage: thứ tự random cho từng truyện trong session này */
function orderKey(storyId: string) { return `aff_order_${storyId}`; }

function readInt(key: string, storage: Storage = localStorage): number {
  try { const v = Number(storage.getItem(key) || "0"); return Number.isFinite(v) ? v : 0; }
  catch { return 0; }
}
function writeInt(key: string, value: number, storage: Storage = localStorage) {
  try { storage.setItem(key, String(value)); } catch { /* ok */ }
}

/** Shuffle mảng và lưu thứ tự vào sessionStorage để nhất quán trong session */
function getOrCreateOrder(storyId: string, length: number): number[] {
  try {
    const saved = sessionStorage.getItem(orderKey(storyId));
    if (saved) {
      const parsed: number[] = JSON.parse(saved);
      if (parsed.length === length) return parsed;
    }
    // Tạo thứ tự random mới
    const order = Array.from({ length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    sessionStorage.setItem(orderKey(storyId), JSON.stringify(order));
    return order;
  } catch {
    return Array.from({ length }, (_, i) => i);
  }
}

interface Product {
  productId: string;
  affiliateUrl: string;
  title: string;
  description: string;
  bannerImage: string | null;
}

interface Props {
  products: Product[];   // đã là [Shopee, TikTok, Lazada] từ server
  storyId: string;
  chapterId: string;
  chapterNumber: number;
  waitSeconds: number;
  effect: string;
}

export default function AffiliateTimedPopup({
  products,
  storyId,
  chapterId,
  chapterNumber,
  effect,
}: Props) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen]         = useState(false);
  const [locked, setLocked]               = useState(false);
  const orderRef = useRef<number[] | null>(null);

  // Hiện popup ở chương chẵn: 2, 4, 6
  useEffect(() => {
    if (products.length === 0) return;

    // Chỉ trigger ở chương 2, 4, 6 (chẵn >= 2)
    if (chapterNumber < 2 || chapterNumber % 2 !== 0) return;

    // Số link đã hiện cho truyện này (tối đa = số sản phẩm)
    const shown = readInt(shownKey(storyId));
    if (shown >= products.length) return; // đã đủ 3 lần

    // Lấy thứ tự random (nhất quán trong session)
    if (!orderRef.current) {
      orderRef.current = getOrCreateOrder(storyId, products.length);
    }
    const productIndex = orderRef.current[shown];
    const product = products[productIndex];
    if (!product) return;

    const timer = window.setTimeout(() => {
      setActiveProduct(product);
      setLocked(false);
      setModalOpen(true);
    }, 600);

    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Khoá cuộn + blur content
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(".reader-container");
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      container?.classList.add("reader-blurred");
    } else {
      document.body.style.overflow = "";
      container?.classList.remove("reader-blurred");
    }
    return () => {
      document.body.style.overflow = "";
      document.querySelector(".reader-container")?.classList.remove("reader-blurred");
    };
  }, [modalOpen]);

  function createDisplayUrl(value: string) {
    try {
      const url = new URL(value);
      const path = `${url.pathname}${url.search}`.replace(/\/$/, "");
      const compact = path.length > 18 ? `${path.slice(0, 18)}...` : path;
      return `${url.hostname}${compact}`;
    } catch {
      return value.length > 34 ? `${value.slice(0, 34)}...` : value;
    }
  }

  const trackedUrl = activeProduct
    ? `/api/affiliate/click?productId=${encodeURIComponent(activeProduct.productId)}&storyId=${encodeURIComponent(storyId)}&chapterId=${encodeURIComponent(chapterId)}`
    : "";

  // Ấn X → khoá chương (không tăng shown → refresh sẽ hiện lại)
  const handleClose = () => {
    setModalOpen(false);
    setLocked(true);
  };

  // Ấn link → tăng shown, mở khoá
  const handleAffiliateClick = () => {
    const shown = readInt(shownKey(storyId));
    writeInt(shownKey(storyId), shown + 1);
    setModalOpen(false);
    setLocked(false);
  };

  // Màn hình khoá chương
  if (locked) {
    return (
      <div className="aff-locked-screen">
        <div className="aff-locked-screen-box">
          <FaLock className="aff-locked-screen-icon" />
          <h2>Chương đã bị khoá</h2>
          <p>
            Bạn đã đóng popup trước khi ủng hộ tác giả.
            <br />
            Vui lòng <strong>tải lại trang</strong> để tiếp tục đọc.
          </p>
          <button
            type="button"
            className="aff-locked-screen-btn"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  if (!modalOpen || !activeProduct) return null;

  return (
    <div className="aff-overlay" role="presentation">
      <section className={`aff-card aff-card-${effect}`} role="dialog" aria-modal="true">
        <button type="button" className="aff-card-close" onClick={handleClose} aria-label="Đóng">
          <FaTimes />
        </button>

        <div className="aff-card-body">
          <p className="aff-card-instruction">
            Mời Quý độc giả{" "}
            <strong>CLICK vào LINK LIÊN KẾT HOẶC ẢNH</strong> bên dưới
            để ủng hộ tác giả!
          </p>

          <a
            href={trackedUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="aff-card-url-bar"
            onClick={handleAffiliateClick}
          >
            {createDisplayUrl(activeProduct.affiliateUrl)}
          </a>

          {activeProduct.bannerImage && (
            <a
              href={trackedUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="aff-card-banner-link"
              onClick={handleAffiliateClick}
            >
              <img src={activeProduct.bannerImage} alt="Ảnh sản phẩm" className="aff-card-banner" />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
