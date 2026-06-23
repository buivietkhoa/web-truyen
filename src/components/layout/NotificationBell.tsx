"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaBell, FaBookOpen, FaCheckDouble } from "react-icons/fa";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  href: string;
  readAt: string | null;
  createdAt: string;
}

function formatNotificationTime(value: string) {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));

  if (elapsedSeconds < 60) return "Vừa xong";
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)} phút trước`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)} giờ trước`;
  if (elapsedSeconds < 604800) return `${Math.floor(elapsedSeconds / 86400)} ngày trước`;

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export default function NotificationBell() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/user/notifications", { cache: "no-store" });
      if (!response.ok) return;

      const data = await response.json();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();

    const handleFocus = () => void loadNotifications();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const markRead = (notificationId: string) => {
    const target = notifications.find((notification) => notification.id === notificationId);
    if (!target || target.readAt) return;

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      )
    );
    setUnreadCount((current) => Math.max(0, current - 1));

    void fetch("/api/user/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
      keepalive: true,
    });
  };

  const markAllRead = async () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, readAt: notification.readAt || new Date().toISOString() }))
    );
    setUnreadCount(0);

    await fetch("/api/user/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
  };

  return (
    <div className="notification-bell" ref={wrapperRef}>
      <button
        type="button"
        className={`notification-trigger${open ? " active" : ""}`}
        aria-label={unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Thông báo"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <section className="notification-dropdown" aria-label="Danh sách thông báo">
          <div className="notification-head">
            <div>
              <strong>Thông báo</strong>
              <span>{unreadCount > 0 ? `${unreadCount} chưa đọc` : "Đã đọc tất cả"}</span>
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={() => void markAllRead()}>
                <FaCheckDouble /> Đọc tất cả
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <p className="notification-state">Đang tải thông báo...</p>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <FaBell />
                <strong>Chưa có thông báo</strong>
                <p>Hãy yêu thích truyện để nhận tin khi có chương mới.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  href={notification.href}
                  className={`notification-item${notification.readAt ? "" : " unread"}`}
                  key={notification.id}
                  onClick={() => {
                    markRead(notification.id);
                    setOpen(false);
                  }}
                >
                  <span className="notification-item-icon"><FaBookOpen /></span>
                  <span className="notification-item-copy">
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                    <small>{formatNotificationTime(notification.createdAt)}</small>
                  </span>
                  {!notification.readAt && <i aria-label="Chưa đọc" />}
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
