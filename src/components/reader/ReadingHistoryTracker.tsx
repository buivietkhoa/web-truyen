"use client";

import { useEffect } from "react";

interface ReadingHistoryTrackerProps {
  storyId: string;
  chapterId: string;
  chapterNumber: number;
}

export default function ReadingHistoryTracker({ storyId, chapterId, chapterNumber }: ReadingHistoryTrackerProps) {
  useEffect(() => {
    let lastSavedProgress = -1;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let durationSaved = false;
    const startedAt = Date.now();

    const trackReadingEvent = (eventType: "VIEW" | "NEXT_CHAPTER" | "DURATION", durationSeconds = 0, keepalive = false) => {
      fetch("/api/analytics/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, chapterId, eventType, durationSeconds }),
        keepalive,
      }).catch(() => {});
    };

    trackReadingEvent("VIEW");
    try {
      const previous = JSON.parse(localStorage.getItem("last_read_chapter") || "null") as { storyId?: string; chapterNumber?: number } | null;
      if (previous?.storyId === storyId && previous.chapterNumber === chapterNumber - 1) {
        trackReadingEvent("NEXT_CHAPTER");
      }
      localStorage.setItem("last_read_chapter", JSON.stringify({ storyId, chapterNumber }));
    } catch {
      // Reading analytics still works when browser storage is unavailable.
    }

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
    const saveDuration = () => {
      if (durationSaved) return;
      durationSaved = true;
      trackReadingEvent("DURATION", Math.max(1, Math.round((Date.now() - startedAt) / 1000)), true);
    };
    const handlePageHide = () => {
      saveProgress(getProgress(), true);
      saveDuration();
    };

    saveProgress(getProgress());
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
      saveProgress(getProgress(), true);
      saveDuration();
    };
  }, [storyId, chapterId, chapterNumber]);

  return null;
}
