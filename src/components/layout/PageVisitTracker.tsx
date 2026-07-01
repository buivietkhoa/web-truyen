"use client";

import { useEffect } from "react";

export default function PageVisitTracker() {
  useEffect(() => {
    fetch("/api/visit", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
