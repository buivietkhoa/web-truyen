"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const SS_KEY = "aff_v6";

interface AffState {
  order: number[];
  phase: number;               // số lần click link thành công
  pendingShow: boolean;        // user ấn X → popup hiện ở chương tiếp (>= 2)
  lockedChapterIds: string[];  // chapterId bị ẩn nội dung (ấn X)
  doneChapterIds: string[];    // chapterId đã click link thành công
}

export function getAffState(storyId: string): AffState | null {
  try {
    const raw = sessionStorage.getItem(`${SS_KEY}_${storyId}`);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<AffState>;
    if (Array.isArray(p.order) && typeof p.phase === "number") {
      return {
        order: p.order,
        phase: p.phase,
        pendingShow: Boolean(p.pendingShow),
        lockedChapterIds: Array.isArray(p.lockedChapterIds) ? p.lockedChapterIds : [],
        doneChapterIds: Array.isArray(p.doneChapterIds) ? p.doneChapterIds : [],
      };
    }
    return null;
  } catch { return null; }
}

function saveState(storyId: string, state: AffState) {
  try { sessionStorage.setItem(`${SS_KEY}_${storyId}`, JSON.stringify(state)); }
  catch { /* ok */ }
}

function createState(storyId: string, length: number): AffState {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const state: AffState = {
    order, phase: 0,
    pendingShow: false,
    lockedChapterIds: [],
    doneChapterIds: [],
  };
  saveState(storyId, state);
  return state;
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

export default function AffiliateTimedPopup({
  products,
  storyId,
  chapterId,
  chapterNumber,
  effect,
}: Props) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (products.length === 0) return;

    // Chương 1 hoặc chapter < 2: không bao giờ hiện popup
    if (chapterNumber < 2) return;

    let state = getAffState(storyId);
    if (!state || state.order.length !== products.length) {
      state = createState(storyId, products.length);
    }

    // Đã click đủ 3 link → dừng hoàn toàn
    if (state.phase >= products.length) return;

    // Chương này đã click link rồi → không cần popup nữa
    if (state.doneChapterIds.includes(chapterId)) return;

    // Chương này đang bị khoá (ấn X) → khi vào lại, xoá khỏi lockedChapterIds
    // để popup có thể hiện lại (khi refresh)
    if (state.lockedChapterIds.includes(chapterId)) {
      const updated: AffState = {
        ...state,
        lockedChapterIds: state.lockedChapterIds.filter(id => id !== chapterId),
      };
      saveState(storyId, updated);
      state = updated;
      // Tiếp tục để hiện popup
    }

    // Hiện popup nếu: pendingShow=true (chương trước ấn X) hoặc chương chẵn
    const shouldShow = state.pendingShow || chapterNumber % 2 === 0;
    if (!shouldShow) return;

    const product = products[state.order[state.phase]];
    if (!product) return;

    setActiveProduct(product);
    setModalOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Blur khi popup mở
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

  // Ấn X → khoá chương này + pendingShow=true
  const handleClose = () => {
    const state = getAffState(storyId) ?? createState(storyId, products.length);
    saveState(storyId, {
      ...state,
      pendingShow: true,
      lockedChapterIds: state.lockedChapterIds.includes(chapterId)
        ? state.lockedChapterIds
        : [...state.lockedChapterIds, chapterId],
    });
    setModalOpen(false);
    window.dispatchEvent(new CustomEvent("aff-chapter-locked", { detail: { chapterId } }));
  };

  // Ấn link → phase++, pendingShow=false, đánh dấu done
  const handleAffiliateClick = () => {
    const state = getAffState(storyId) ?? createState(storyId, products.length);
    saveState(storyId, {
      ...state,
      phase: state.phase + 1,
      pendingShow: false,
      doneChapterIds: state.doneChapterIds.includes(chapterId)
        ? state.doneChapterIds
        : [...state.doneChapterIds, chapterId],
    });
    setModalOpen(false);
    window.dispatchEvent(new CustomEvent("aff-chapter-done", { detail: { chapterId } }));
  };

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
