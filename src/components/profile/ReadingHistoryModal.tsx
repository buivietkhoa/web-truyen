"use client";

import { useState } from "react";
import Link from "next/link";
import { FaHistory, FaTimes } from "react-icons/fa";

const readingHistory = [
  {
    title: "Thần Đạo Đan Tôn",
    chapter: "Chương 1245",
    time: "Đọc 12 phút trước",
    progress: "24%",
    href: "/truyen/than-dao-dan-ton",
  },
  {
    title: "Phàm Nhân Tu Tiên",
    chapter: "Chương 156",
    time: "Đọc hôm qua",
    progress: "8%",
    href: "/truyen/pham-nhan-tu-tien",
  },
  {
    title: "Vũ Luyện Điên Phong",
    chapter: "Chương 82",
    time: "Đọc 2 ngày trước",
    progress: "15%",
    href: "/truyen/vu-luyen-dien-phong",
  },
  {
    title: "Tuyệt Thế Đường Môn",
    chapter: "Chương 38",
    time: "Đọc tuần trước",
    progress: "41%",
    href: "/truyen/tuyet-the-duong-mon",
  },
];

export default function ReadingHistoryModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="profile-menu-button"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <FaHistory /> Lịch sử đọc
      </button>

      {isOpen && (
        <div className="reading-modal-backdrop" role="presentation">
          <section
            className="reading-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-history-title"
          >
            <div className="reading-modal-head">
              <div>
                <h2 id="reading-history-title">Lịch sử đọc</h2>
                <p>Theo dõi các truyện bạn đã mở gần đây.</p>
              </div>

              <button
                type="button"
                className="reading-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng lịch sử đọc"
              >
                <FaTimes />
              </button>
            </div>

            <div className="reading-history-list">
              {readingHistory.map((item) => (
                <Link href={item.href} className="reading-history-item" key={item.title}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.chapter} · {item.time}</p>
                  </div>

                  <span>{item.progress}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
