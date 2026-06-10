"use client";

import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";

interface AffiliateGateModalProps {
  chapterId: string;
  setting: {
    affiliateUrl: string;
    buttonText: string;
    title: string;
    description: string;
    bannerImage: string | null;
    buttonColor: string;
    waitSeconds: number;
    fontSize: number;
    effect: string;
  };
}

export default function AffiliateGateModal({ chapterId, setting }: AffiliateGateModalProps) {
  const storageKey = useMemo(() => `affiliate-gate-seen:${chapterId}`, [chapterId]);
  const displayUrl = useMemo(() => {
    try {
      const url = new URL(setting.affiliateUrl);
      const path = `${url.pathname}${url.search}`.replace(/\/$/, "");
      const compactPath = path.length > 18 ? `${path.slice(0, 18)}...` : path;
      return `${url.hostname}${compactPath}`;
    } catch {
      return setting.affiliateUrl.length > 34 ? `${setting.affiliateUrl.slice(0, 34)}...` : setting.affiliateUrl;
    }
  }, [setting.affiliateUrl]);
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(setting.waitSeconds);

  useEffect(() => {
    if (window.sessionStorage.getItem(storageKey) === "1") {
      return;
    }

    const openTimer = window.setTimeout(() => {
      setOpen(true);
    }, 600);

    return () => window.clearTimeout(openTimer);
  }, [storageKey]);

  useEffect(() => {
    if (!open || secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, secondsLeft]);

  const closeModal = () => {
    window.sessionStorage.setItem(storageKey, "1");
    setOpen(false);
  };

  const handleAffiliateClick = () => {
    closeModal();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="affiliate-gate-overlay">
      <section className={`affiliate-gate-card ${setting.effect}`} role="dialog" aria-modal="true">
        <button type="button" className="affiliate-gate-close" onClick={closeModal} aria-label="Đóng quảng cáo">
          <FaTimes />
        </button>

        <div className="affiliate-gate-body">
          <p className="affiliate-gate-instruction">
            Mời Quý độc giả <strong>CLICK vào LINK LIÊN KẾT HOẶC ẢNH</strong> bên dưới{" "}
            <span>MỞ ỨNG DỤNG SHOPEE</span> để tiếp tục đọc toàn bộ chương truyện!
          </p>

          <a
            href={setting.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`affiliate-short-link ${secondsLeft > 0 ? "disabled" : ""}`}
            onClick={(event) => {
              if (secondsLeft > 0) {
                event.preventDefault();
                return;
              }

              handleAffiliateClick();
            }}
          >
            {displayUrl}
          </a>

          {secondsLeft > 0 && (
            <small className="affiliate-gate-countdown">
              Mở khóa sau {String(secondsLeft).padStart(2, "0")} giây
            </small>
          )}

          {setting.bannerImage ? (
            <a
              href={setting.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`affiliate-product-image ${secondsLeft > 0 ? "disabled" : ""}`}
              onClick={(event) => {
                if (secondsLeft > 0) {
                  event.preventDefault();
                  return;
                }

                handleAffiliateClick();
              }}
            >
              <img src={setting.bannerImage} alt={setting.title} />
            </a>
          ) : (
            <div className="affiliate-product-placeholder">
              <h2>{setting.title}</h2>
              <p>{setting.description}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
