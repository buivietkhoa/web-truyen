"use client";

import { useEffect, useState } from "react";
import { getAffState } from "@/components/affiliate/AffiliateTimedPopup";

interface Props {
  chapterId: string;
  storyId: string;
}

export default function ChapterContent({ chapterId, storyId }: Props) {
  const [html, setHtml]       = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked]   = useState(false);

  function isLocked() {
    const state = getAffState(storyId);
    if (!state) return false;
    // Không khoá nếu đã click link rồi
    if (state.doneChapterIds.includes(chapterId)) return false;
    return state.lockedChapterIds.includes(chapterId);
  }

  useEffect(() => {
    const currentlyLocked = isLocked();
    setLocked(currentlyLocked);

    if (currentlyLocked) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setHtml(null);

    fetch(`/api/chapter/${chapterId}/content`)
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setHtml(data.content ?? ""))
      .catch(() => setHtml("<p>Không thể tải nội dung chương này.</p>"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Lắng nghe event khoá/mở khoá từ popup
  useEffect(() => {
    const onLocked = (e: Event) => {
      if ((e as CustomEvent<{ chapterId: string }>).detail.chapterId === chapterId) {
        setLocked(true);
      }
    };
    const onDone = (e: Event) => {
      if ((e as CustomEvent<{ chapterId: string }>).detail.chapterId === chapterId) {
        setLocked(false);
      }
    };
    window.addEventListener("aff-chapter-locked", onLocked);
    window.addEventListener("aff-chapter-done", onDone);
    return () => {
      window.removeEventListener("aff-chapter-locked", onLocked);
      window.removeEventListener("aff-chapter-done", onDone);
    };
  }, [chapterId]);

  if (loading) {
    return (
      <div className="reader-content">
        <div className="chapter-loading-skeleton" />
        <div className="chapter-loading-skeleton" />
        <div className="chapter-loading-skeleton short" />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="chapter-locked-inline">
        <p>
          Chương này đã bị khoá. Bạn vui lòng ấn vào <strong>Popup</strong> để mở khoá nội dung.
          Lỡ ấn x thì vui lòng <strong>tải lại trang</strong> để hiện popup.
        </p>
      </div>
    );
  }

  return (
    <section
      className="reader-content"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html ?? "" }}
    />
  );
}
