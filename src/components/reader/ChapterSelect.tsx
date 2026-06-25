"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";

interface ChapterOption {
  id: string;
  title: string;
  number: number;
}

interface ChapterSelectProps {
  truyenId: string;
  chuongs: ChapterOption[];
  currentChapterId: string;
}

export default function ChapterSelect({ truyenId, chuongs, currentChapterId }: ChapterSelectProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const current = chuongs.find((c) => c.id === currentChapterId);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll đến chapter hiện tại khi mở
  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLButtonElement>("[data-active='true']");
    active?.scrollIntoView({ block: "center" });
  }, [open]);

  const handleSelect = (id: string) => {
    setOpen(false);
    router.push(`/doc-truyen/${truyenId}/${id}`);
  };

  return (
    <div className="chapter-select-wrap" ref={ref}>
      <span className="chapter-select-label">Chọn chương</span>

      <button
        type="button"
        className={`chapter-select-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{current ? `Chương ${current.number}: ${current.title}` : "Chọn chương"}</span>
        <FaChevronDown className="chapter-select-arrow" />
      </button>

      {open && (
        <div className="chapter-select-dropdown" ref={listRef} role="listbox">
          {chuongs.map((c) => (
            <button
              key={c.id}
              type="button"
              role="option"
              data-active={c.id === currentChapterId}
              aria-selected={c.id === currentChapterId}
              className={`chapter-select-option ${c.id === currentChapterId ? "active" : ""}`}
              onClick={() => handleSelect(c.id)}
            >
              <span className="chapter-select-num">{c.number}</span>
              <span className="chapter-select-title">{c.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
