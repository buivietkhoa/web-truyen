"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  storyId: string;
}

export default function ViewTracker({ storyId }: ViewTrackerProps) {
  useEffect(() => {
    fetch("/api/views/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId }),
    }).catch(() => {});
  }, [storyId]);

  return null;
}
