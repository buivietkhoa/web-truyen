"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

interface ReaderToolbarProps {
  children: ReactNode;
}

export default function ReaderToolbar({ children }: ReaderToolbarProps) {
  const [fontSize, setFontSize] = useState(20);

  return (
    <div
      className="reader-shell"
      style={{ "--reader-font-size": `${fontSize}px` } as CSSProperties}
    >
      <div className="reader-floating-tools">
        <button type="button" onClick={() => setFontSize((size) => Math.max(16, size - 2))} aria-label="Giảm cỡ chữ">
          <FaMinus />
        </button>
        <span>{fontSize}px</span>
        <button type="button" onClick={() => setFontSize((size) => Math.min(30, size + 2))} aria-label="Tăng cỡ chữ">
          <FaPlus />
        </button>
      </div>
      {children}
    </div>
  );
}
