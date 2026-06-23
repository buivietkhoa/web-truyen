"use client";

import { useEffect } from "react";

export default function SearchTracker({ query }: { query: string }) {
  useEffect(() => {
    if (query.trim().length < 2) return;
    fetch("/api/analytics/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      keepalive: true,
    }).catch(() => {});
  }, [query]);

  return null;
}
