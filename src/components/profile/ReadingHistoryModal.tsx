"use client";

import { useState } from "react";
import Link from "next/link";
import { FaHistory, FaTimes } from "react-icons/fa";

export interface ReadingHistoryItem {
  storyId: string;
  title: string;
  chapter: string;
  time: string;
  progress: number;
  href: string;
}

interface ReadingHistoryModalProps {
  histories: ReadingHistoryItem[];
}

export default function ReadingHistoryModal({ histories }: ReadingHistoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="profile-menu-button" type="button" onClick={() => setIsOpen(true)}>
        <FaHistory /> Lịch sử đọc
      </button>

      {isOpen && (
        <div className="reading-modal-backdrop" role="presentation">
          <section className="reading-modal" role="dialog" aria-modal="true" aria-labelledby="reading-history-title">
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
              {histories.length === 0 ? (
                <div className="reading-history-empty">
                  <h3>Chưa có lịch sử đọc</h3>
                  <p>Lịch sử sẽ được lưu khi bạn đăng nhập và mở một chương truyện.</p>
                </div>
              ) : (
                histories.map((item) => (
                  <Link href={item.href} className="reading-history-item" key={item.storyId}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.chapter} - {item.time}</p>
                    </div>
                    <span className="reading-progress">{item.progress}%</span>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
