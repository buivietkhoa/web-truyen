"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL = 30_000;

export default function UserPresenceTracker() {
  useEffect(() => {
    const sendHeartbeat = () => {
      if (document.visibilityState !== "visible") return;
      void fetch("/api/user/presence", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
      });
    };

    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    document.addEventListener("visibilitychange", sendHeartbeat);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", sendHeartbeat);
    };
  }, []);

  return null;
}
