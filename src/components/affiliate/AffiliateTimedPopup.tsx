"use client";

import { useEffect, useState } from "react";
import { FaLock, FaTimes } from "react-icons/fa";

/**
 * State lưu vào localStorage theo storyId:
 * {
 *   order: [2, 0, 1]   — thứ tự random của 3 sản phẩm (tạo 1 lần, giữ mãi)
 *   clicked: [2, 4]    — danh sách chương user đã CLICK link thành công
 * }
 *
 * Khi clicked.length === products.length → dừng hoàn toàn.
 * Click X không được tính vào clicked → reload sẽ hiện lại.
 */
/**
 * Dùng sessionStorage → tự xóa khi đóng browser.
 * Mỗi lần mở browser mới, chapter 2 sẽ hiện popup lại từ đầu.
 */
const SS_KEY = "aff_s1";

interface AffState {
  order: number[];     // thứ tự hiển thị sản phẩm (random mỗi session)
  clicked: number[];   // chương đã click thành công trong session này
}

function ssKey(storyId: string) {
  return `${SS_KEY}_${storyId}`;
}

function readState(storyId: string): AffState | null {
  try {
    const raw = sessionStorage.getItem(ssKey(storyId));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<AffState>;
    if (Array.isArray(p.order) && Array.isArray(p.clicked)) {
      return { order: p.order, clicked: p.clicked };
    }
    return null;
  } catch {
    return null;
  }
}

function writeState(storyId: string, state: AffState) {
  try {
    sessionStorage.setItem(ssKey(storyId), JSON.stringify(state));
  } catch { /* private browsing */ }
}

/** Tạo state lần đầu trong session: shuffle random thứ tự sản phẩm */
function createState(storyId: string, length: number): AffState {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const state: AffState = { order, clicked: [] };
  writeState(storyId, state);
  return state;
}

// ─────────────────────────────────────────────

interface Product {
  productId: string;
  affiliateUrl: string;
  title: string;
  description: string;
  bannerImage: string | null;
}

interface Props {
  products: Product[];
  storyId: string;
  chapterId: string;
  chapterNumber: number;
  waitSeconds: number;
  effect: string;
}

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

  useEffect(() => {
    if (products.length === 0) return;

    // Chỉ trigger ở chương chẵn >= 2 (chương 2, 4, 6)
    if (chapterNumber < 2 || chapterNumber % 2 !== 0) return;

    // Đọc hoặc tạo state từ localStorage
    let state = readState(storyId);
    if (!state || state.order.length !== products.length) {
      state = createState(storyId, products.length);
    }

    // Đã click đủ 3 sàn → dừng hoàn toàn
    if (state.clicked.length >= products.length) return;

    // Chương này đã click rồi → không hiện lại
    if (state.clicked.includes(chapterNumber)) return;

    // Lấy sản phẩm tiếp theo theo thứ tự random đã lưu
    const productIndex = state.order[state.clicked.length];
    const product = products[productIndex];
    if (!product) return;

    // Hiện ngay, không delay
    setActiveProduct(product);
    setLocked(false);
    setModalOpen(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Khoá cuộn + blur content khi popup mở
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

  const trackedUrl = activeProduct
    ? `/api/affiliate/click?productId=${encodeURIComponent(activeProduct.productId)}&storyId=${encodeURIComponent(storyId)}&chapterId=${encodeURIComponent(chapterId)}`
    : "";

  /**
   * Ấn X → khoá chương
   * KHÔNG ghi vào localStorage → reload sẽ hiện popup lại cho chương này
   */
  const handleClose = () => {
    setModalOpen(false);
    setLocked(true);
  };

  /**
   * Ấn link → đánh dấu chương này đã click thành công
   * Ghi chapterNumber vào clicked[] trong localStorage
   */
  const handleAffiliateClick = () => {
    const state = readState(storyId);
    if (state && !state.clicked.includes(chapterNumber)) {
      writeState(storyId, {
        ...state,
        clicked: [...state.clicked, chapterNumber],
      });
    }
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
              <img
                src={activeProduct.bannerImage}
                alt="Ảnh sản phẩm"
                className="aff-card-banner"
              />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
