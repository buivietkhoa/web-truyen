"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBookOpen, FaEdit, FaTimes, FaUsers } from "react-icons/fa";

interface ActivityItem {
  id: string;
  type: "book" | "edit" | "user";
  title: string;
  actor: string;
  dateLabel: string;
  href: string;
}

interface Props {
  activities: ActivityItem[];
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  if (type === "book") return <FaBookOpen />;
  if (type === "edit") return <FaEdit />;
  return <FaUsers />;
}

function ActivityList({ activities, onNavigate }: Props & { onNavigate?: () => void }) {
  if (activities.length === 0) {
    return <div className="admin-empty compact"><h3>Chưa có hoạt động</h3><p>Không có hoạt động trong khoảng đã chọn.</p></div>;
  }

  return activities.map((item) => (
    <Link href={item.href} className="admin-activity-item" key={item.id} onClick={onNavigate}>
      <span className={item.type}><ActivityIcon type={item.type} /></span>
      <div className="admin-activity-copy">
        <strong>{item.title}</strong>
        <p><span>{item.actor}</span><time>{item.dateLabel}</time></p>
      </div>
    </Link>
  ));
}

export default function AdminRecentActivityPanel({ activities }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <section className="admin-panel admin-activity-panel">
      <div className="admin-panel-head">
        <div><p>Mới nhất</p><h2>Hoạt động gần đây</h2></div>
        <button type="button" className="admin-dashboard-link" onClick={() => setOpen(true)}>Xem nội dung</button>
      </div>
      <div className="admin-activity-list">
        <ActivityList activities={activities.slice(0, 4)} />
      </div>

      {open && (
        <div className="admin-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <section className="admin-modal admin-activity-modal" role="dialog" aria-modal="true" aria-labelledby="recent-activity-title">
            <header className="admin-modal-head">
              <div><p>Nhật ký hệ thống</p><h3 id="recent-activity-title">Hoạt động gần đây</h3></div>
              <button type="button" className="admin-modal-close" onClick={() => setOpen(false)} aria-label="Đóng"><FaTimes /></button>
            </header>
            <div className="admin-activity-modal-body">
              <ActivityList activities={activities} onNavigate={() => setOpen(false)} />
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
