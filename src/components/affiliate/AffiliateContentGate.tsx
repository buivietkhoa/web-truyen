"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaTimes } from "react-icons/fa";

interface AffiliateSetting {
  productId: string;
  affiliateUrl: string;
  title: string;
  description: string;
  bannerImage: string | null;
  waitSeconds: number;
  effect: string;
}

interface Props {
  content: string | null;
  chapterId: string;
  chapterNumber: number;
  freeChapters?: number;
  setting: AffiliateSetting | null;
}

function createDisplayUrl(value: string) {
  try {
    const url = new URL(value);
    const path = `${url.pathname}${url.search}`.replace(/\/$/, "");
    const compactPath = path.length > 18 ? `${path.slice(0, 18)}...` : path;
    return `${url.hostname}${compactPath}`;
  } catch {
    return value.length > 34 ? `${value.slice(0, 34)}...` : value;
  }
}

export default function AffiliateContentGate({
  content,
  chapterId,
  chapterNumber,
  freeChapters = 1,
  setting,
}: Props) {
  const router = useRouter();
  const requiresGate = setting !== null && chapterNumber > freeChapters;
  const displayUrl = useMemo(
    () => createDisplayUrl(setting?.affiliateUrl || ""),
    [setting?.affiliateUrl]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(setting?.waitSeconds ?? 0);
  const [unlocking, setUnlocking] = useState(false);
  const unlocked = !requiresGate || content !== null;

  useEffect(() => {
    if (!requiresGate || unlocked) {
      return;
    }

    const timer = window.setTimeout(() => setModalOpen(true), 400);
    return () => window.clearTimeout(timer);
  }, [requiresGate, unlocked]);

  useEffect(() => {
    if (!modalOpen || secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [modalOpen, secondsLeft]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const openModal = () => {
    setSecondsLeft(setting?.waitSeconds ?? 0);
    setModalOpen(true);
  };

  const handleAffiliateClick = async () => {
    if (!setting || unlocking) return;
    setUnlocking(true);

    try {
      const response = await fetch("/api/affiliate/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, productId: setting.productId }),
        keepalive: true,
      });

      if (!response.ok) return;
      setModalOpen(false);
      router.refresh();
    } finally {
      setUnlocking(false);
    }
  };

  if (!requiresGate || unlocked) {
    return (
      <section
        className="reader-content"
        dangerouslySetInnerHTML={{ __html: content || "" }}
      />
    );
  }

  return (
    <>
      <div className="aff-locked-panel">
        <div className="aff-locked-icon">
          <FaLock />
        </div>
        <h3>Chương này cần mở khóa</h3>
        <p>Ủng hộ để tiếp tục đọc toàn bộ chương truyện.</p>
        <button type="button" className="aff-locked-btn" onClick={openModal}>
          Mở khóa ngay
        </button>
      </div>

      {modalOpen && setting && (
        <div
          className="aff-overlay"
          role="presentation"
          onClick={(event) => event.target === event.currentTarget && setModalOpen(false)}
        >
          <section
            className={`aff-card aff-card-${setting.effect}`}
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
                <strong>CLICK vào LINK LIÊN KẾT HOẶC ẢNH</strong> bên dưới{" "}
                <span className="aff-card-cta-text">MỞ ỨNG DỤNG SHOPEE</span>{" "}
                để tiếp tục đọc toàn bộ chương truyện!
              </p>

              <a
                href={secondsLeft > 0 ? undefined : setting.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`aff-card-url-bar ${secondsLeft > 0 ? "waiting" : ""}`}
                onClick={secondsLeft > 0 ? (event) => event.preventDefault() : handleAffiliateClick}
              >
                {displayUrl}
              </a>

              {secondsLeft > 0 && (
                <div className="aff-card-wait compact">
                  <span>Mở khóa sau</span>
                  <strong>{String(secondsLeft).padStart(2, "0")}</strong>
                  <span>giây</span>
                </div>
              )}

              {setting.bannerImage ? (
                <a
                  href={secondsLeft > 0 ? undefined : setting.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={`aff-card-banner-link ${secondsLeft > 0 ? "waiting" : ""}`}
                  onClick={secondsLeft > 0 ? (event) => event.preventDefault() : handleAffiliateClick}
                >
                  <img
                    src={setting.bannerImage}
                    alt="Ảnh sản phẩm"
                    className="aff-card-banner"
                  />
                </a>
              ) : (
                <div className="aff-card-no-image">
                  <h3>{setting.title}</h3>
                  <p>{setting.description}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
