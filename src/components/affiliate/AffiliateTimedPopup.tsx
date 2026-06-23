"use client";

import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";

const STORAGE_INDEX = "aff_rotation_v2_index";
const STORAGE_LAST_SHOWN = "aff_rotation_v2_last_shown";
const DISPLAY_COOLDOWN_MS = 10 * 60 * 1000;

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
  waitSeconds,
  effect,
}: Props) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(waitSeconds);

  // On every chapter change: decide whether to show popup
  useEffect(() => {
    if (products.length === 0 || chapterNumber <= 1) return;

    let currentIndex = 0;

    try {
      const lastShownAt = Number(localStorage.getItem(STORAGE_LAST_SHOWN) || "0");
      const cooldownRemaining = DISPLAY_COOLDOWN_MS - (Date.now() - lastShownAt);

      if (lastShownAt > 0 && cooldownRemaining > 0) return;

      const storedIndex = Number(localStorage.getItem(STORAGE_INDEX) || "0");
      currentIndex = Number.isFinite(storedIndex) ? storedIndex : 0;
    } catch {
      // Storage is optional; the popup still works in strict private browsing.
    }

    const timer = window.setTimeout(() => {
      const productIndex = currentIndex % products.length;

      try {
        localStorage.setItem(STORAGE_INDEX, String((productIndex + 1) % products.length));
        localStorage.setItem(STORAGE_LAST_SHOWN, String(Date.now()));
      } catch {
        // Storage is optional; the popup still works without it.
      }

      setActiveProduct(products[productIndex]);
      setSecondsLeft(waitSeconds);
      setModalOpen(true);
    }, 500);

    return () => window.clearTimeout(timer);
  // chapterId is the trigger — re-run whenever the user navigates to a new chapter
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Countdown timer
  useEffect(() => {
    if (!modalOpen || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [modalOpen, secondsLeft]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const displayUrl = useMemo(
    () => createDisplayUrl(activeProduct?.affiliateUrl || ""),
    [activeProduct]
  );
  const trackedUrl = activeProduct
    ? `/api/affiliate/click?productId=${encodeURIComponent(activeProduct.productId)}&storyId=${encodeURIComponent(storyId)}&chapterId=${encodeURIComponent(chapterId)}`
    : "";

  if (!modalOpen || !activeProduct) return null;

  return (
    <div
      className="aff-overlay"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
    >
      <section
        className={`aff-card aff-card-${effect}`}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="aff-card-close"
          onClick={() => setModalOpen(false)}
          aria-label="Đóng"
        >
          <FaTimes />
        </button>

        <div className="aff-card-body">
          <p className="aff-card-instruction">
            Mời Quý độc giả{" "}
            <strong>CLICK vào LINK LIÊN KẾT HOẶC ẢNH</strong> bên dưới để ủng
            hộ tác giả!
          </p>

          <a
            href={secondsLeft > 0 ? undefined : trackedUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`aff-card-url-bar ${secondsLeft > 0 ? "waiting" : ""}`}
            onClick={
              secondsLeft > 0 ? (e) => e.preventDefault() : undefined
            }
          >
            {displayUrl}
          </a>

          {secondsLeft > 0 && (
            <div className="aff-card-wait compact">
              <span>Có thể đóng sau</span>
              <strong>{String(secondsLeft).padStart(2, "0")}</strong>
              <span>giây</span>
            </div>
          )}

          {activeProduct.bannerImage ? (
            <a
              href={secondsLeft > 0 ? undefined : trackedUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`aff-card-banner-link ${secondsLeft > 0 ? "waiting" : ""}`}
              onClick={
                secondsLeft > 0 ? (e) => e.preventDefault() : undefined
              }
            >
              <img
                src={activeProduct.bannerImage}
                alt="Ảnh sản phẩm"
                className="aff-card-banner"
              />
            </a>
          ) : (
            <div className="aff-card-no-image">
              <h3>{activeProduct.title}</h3>
              <p>{activeProduct.description}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
