"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { FaMinus, FaPause, FaPlay, FaPlus, FaStop } from "react-icons/fa";

interface ReaderToolbarProps {
  children: ReactNode;
}

type TtsState = "idle" | "speaking" | "paused";

export default function ReaderToolbar({ children }: ReaderToolbarProps) {
  const [fontSize, setFontSize] = useState(20);
  const [ttsState, setTtsState] = useState<TtsState>("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  function getChapterText() {
    return document.querySelector(".reader-content")?.textContent?.trim() ?? "";
  }

  function handlePlay() {
    if (ttsState === "paused") {
      window.speechSynthesis.resume();
      setTtsState("speaking");
      return;
    }

    window.speechSynthesis.cancel();
    const text = getChapterText();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 1;
    utterance.onend = () => setTtsState("idle");
    utterance.onerror = () => setTtsState("idle");
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setTtsState("speaking");
  }

  function handlePause() {
    window.speechSynthesis.pause();
    setTtsState("paused");
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    setTtsState("idle");
  }

  return (
    <div
      className="reader-shell"
      style={{ "--reader-font-size": `${fontSize}px` } as CSSProperties}
    >
      <div className="reader-floating-tools">
        {/* TTS */}
        <div className="reader-tts-group">
          {ttsState === "idle" && (
            <button type="button" onClick={handlePlay} aria-label="Nghe đọc truyện" title="Nghe đọc truyện" className="tts-btn play">
              <FaPlay />
            </button>
          )}
          {ttsState === "speaking" && (
            <>
              <button type="button" onClick={handlePause} aria-label="Tạm dừng" title="Tạm dừng" className="tts-btn pause">
                <FaPause />
              </button>
              <button type="button" onClick={handleStop} aria-label="Dừng đọc" title="Dừng đọc" className="tts-btn stop">
                <FaStop />
              </button>
            </>
          )}
          {ttsState === "paused" && (
            <>
              <button type="button" onClick={handlePlay} aria-label="Tiếp tục" title="Tiếp tục đọc" className="tts-btn play">
                <FaPlay />
              </button>
              <button type="button" onClick={handleStop} aria-label="Dừng đọc" title="Dừng đọc" className="tts-btn stop">
                <FaStop />
              </button>
            </>
          )}
        </div>

        <div className="reader-tools-divider" />

        {/* Font size */}
        <button type="button" onClick={() => setFontSize((s) => Math.max(16, s - 2))} aria-label="Giảm cỡ chữ">
          <FaMinus />
        </button>
        <span>{fontSize}px</span>
        <button type="button" onClick={() => setFontSize((s) => Math.min(30, s + 2))} aria-label="Tăng cỡ chữ">
          <FaPlus />
        </button>
      </div>
      {children}
    </div>
  );
}
