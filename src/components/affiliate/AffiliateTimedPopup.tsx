"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const SS_KEY = "aff_v8";
const TRIGGER_CHAPTERS = [2, 4, 6];

interface AffState {
  phase: number;             // 0-2: đang ở sản phẩm nào
  pendingShow: boolean;      // X đã ấn → popup theo sang chapter tiếp
  lockedChapterIds: string[];
  doneKeys: string[];        // `${chapterId}:${phase}` đã click link
}

export function getAffState(storyId: string): AffState | null {
  try {
    const raw = sessionStorage.getItem(`${SS_KEY}_${storyId}`);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<AffState>;
    if (typeof p.phase === "number") {
      return {
        phase: p.phase,
        pendingShow: Boolean(p.pendingShow),
        lockedChapterIds: Array.isArray(p.lockedChapterIds) ? p.lockedChapterIds : [],
        doneKeys: Array.isArray(p.doneKeys) ? p.doneKeys : [],
      };
    }
    return null;
  } catch { return null; }
}

function saveState(storyId: string, state: AffState) {
  try { sessionStorage.setItem(`${SS_KEY}_${storyId}`, JSON.stringify(state)); }
  catch { /* ok */ }
}

function emptyState(): AffState {
  return { phase: 0, pendingShow: false, lockedChapterIds: [], doneKeys: [] };
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

    const state = getAffState(storyId) ?? emptyState();

    // Đã xong hết 3 sản phẩm
    if (state.phase >= products.length) return;

    // Chapter này đã click link ở phase này rồi
    if (state.doneKeys.includes(`${chapterId}:${state.phase}`)) return;

    // Hiện popup nếu: đang pending (X đã ấn trước đó) HOẶC đây là trigger chapter của phase hiện tại
    const isTrigger = chapterNumber === TRIGGER_CHAPTERS[state.phase];
    if (!state.pendingShow && !isTrigger) return;

    const product = products[state.phase];
    if (!product) return;

    setActiveProduct(product);
    setModalOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

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

  // Ấn X → khóa chapter này + popup theo sang chapter tiếp
  const handleClose = () => {
    const state = getAffState(storyId) ?? emptyState();
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

  // Click link → phase++, mở khóa tất cả chapter, pendingShow=false
  const handleAffiliateClick = () => {
    const state = getAffState(storyId) ?? emptyState();
    const doneKey = `${chapterId}:${state.phase}`;
    saveState(storyId, {
      phase: state.phase + 1,
      pendingShow: false,
      lockedChapterIds: [],
      doneKeys: state.doneKeys.includes(doneKey)
        ? state.doneKeys
        : [...state.doneKeys, doneKey],
    });
    setModalOpen(false);
    window.dispatchEvent(new CustomEvent("aff-chapter-unlocked"));
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
            <strong>
              CLICK vào LINK LIÊN KẾT{activeProduct.bannerImage ? " HOẶC ẢNH" : ""}
            </strong>{" "}
            bên dưới để ủng hộ tác giả!
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
