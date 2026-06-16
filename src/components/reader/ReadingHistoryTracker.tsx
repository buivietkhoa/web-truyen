"use client";

import { useEffect } from "react";

interface ReadingHistoryTrackerProps {
  storyId: string;
  chapterId: string;
}

export default function ReadingHistoryTracker({ storyId, chapterId }: ReadingHistoryTrackerProps) {
  useEffect(() => {
    let lastSavedProgress = -1;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const getProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      return scrollableHeight <= 0 ? 100 : (window.scrollY / scrollableHeight) * 100;
    };

    const saveProgress = (value: number, keepalive = false) => {
      const progress = Math.max(0, Math.min(100, Math.round(value)));
      if (progress === lastSavedProgress) return;
      lastSavedProgress = progress;

      fetch("/api/user/reading-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, chapterId, progress }),
        keepalive,
      }).catch(() => {});
    };

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => saveProgress(getProgress()), 700);
    };
    const handlePageHide = () => saveProgress(getProgress(), true);

    saveProgress(getProgress());
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
      saveProgress(getProgress(), true);
    };
  }, [storyId, chapterId]);

  return null;
}
