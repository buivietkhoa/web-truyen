"use client";

import { useEffect, useMemo, useState } from "react";
import { FaExternalLinkAlt, FaTimes } from "react-icons/fa";

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

  if (!open) {
    return null;
  }

  return (
    <div className="affiliate-gate-overlay">
      <section className={`affiliate-gate-card ${setting.effect}`} role="dialog" aria-modal="true">
        <button type="button" className="affiliate-gate-close" onClick={closeModal} aria-label="Đóng quảng cáo">
          <FaTimes />
        </button>

        {setting.bannerImage && <img src={setting.bannerImage} alt={setting.title} />}

        <div className="affiliate-gate-body">
          <h2>{setting.title}</h2>
          <p>{setting.description}</p>
          <small>{secondsLeft > 0 ? "Nút sẽ mở khóa sau" : "Bạn có thể mở link affiliate"}</small>
          <strong>{String(secondsLeft).padStart(2, "0")}</strong>
          <a
            href={setting.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={secondsLeft > 0 ? "disabled" : ""}
            style={{
              background: setting.buttonColor,
              fontSize: `${setting.fontSize}px`,
            }}
            onClick={(event) => {
              if (secondsLeft > 0) {
                event.preventDefault();
                return;
              }

              closeModal();
            }}
          >
            {setting.buttonText}
            <FaExternalLinkAlt />
          </a>
        </div>
      </section>
    </div>
  );
}
