"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { FaCog, FaMinus, FaPause, FaPlay, FaPlus, FaStop } from "react-icons/fa";

type TtsState = "idle" | "speaking" | "paused";
const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function ReaderToolbar({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState(20);
  const [ttsState, setTtsState] = useState<TtsState>("idle");
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function loadVoices() {
      const all = window.speechSynthesis.getVoices();
      // Deduplicate by voiceURI
      const seen = new Set<string>();
      const unique = all.filter((v) => {
        if (seen.has(v.voiceURI)) return false;
        seen.add(v.voiceURI);
        return true;
      });
      // Vietnamese first, then the rest
      const vi = unique.filter((v) => v.lang.startsWith("vi"));
      const others = unique.filter((v) => !v.lang.startsWith("vi"));
      const list = [...vi, ...others];
      setVoices(list);
      setSelectedVoiceUri((prev) => prev || (list[0]?.voiceURI ?? ""));
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
      if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
    };
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
    utterance.rate = speed;
    const voice = voices.find((v) => v.voiceURI === selectedVoiceUri);
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      setTtsState("idle");
      if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
    };
    utterance.onerror = () => {
      setTtsState("idle");
      if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setTtsState("speaking");

    // Workaround: Android Chrome tự dừng TTS sau ~15s
    if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
    resumeTimerRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 5000);
  }

  function handlePause() {
    window.speechSynthesis.pause();
    setTtsState("paused");
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
    setTtsState("idle");
  }

  return (
    <div
      className="reader-shell"
      style={{ "--reader-font-size": `${fontSize}px` } as CSSProperties}
    >
      {showSettings && (
        <div className="reader-tts-settings">
          <div className="tts-settings-row">
            <span className="tts-settings-label">Tốc độ</span>
            <div className="tts-speed-group">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`tts-speed-btn${speed === s ? " active" : ""}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="tts-settings-row">
            <span className="tts-settings-label">Giọng đọc</span>
            {voices.length === 0 ? (
              <span className="tts-no-voice">Không tìm thấy giọng đọc</span>
            ) : (
              <select
                className="tts-voice-select"
                value={selectedVoiceUri}
                onChange={(e) => setSelectedVoiceUri(e.target.value)}
              >
                {voices.some((v) => v.lang.startsWith("vi")) && (
                  <optgroup label="🇻🇳 Tiếng Việt">
                    {voices.filter((v) => v.lang.startsWith("vi")).map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Ngôn ngữ khác">
                  {voices.filter((v) => !v.lang.startsWith("vi")).map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                  ))}
                </optgroup>
              </select>
            )}
          </div>
          {voices.length > 0 && !voices.some((v) => v.lang.startsWith("vi")) && (
            <p className="tts-vi-hint">
              Chưa có giọng tiếng Việt. Cài thêm tại: <em>Settings → Time &amp; Language → Speech → Add voices → Vietnamese</em>
            </p>
          )}
        </div>
      )}

      <div className="reader-floating-tools">
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
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Cài đặt giọng đọc"
            title="Cài đặt giọng đọc"
            className={`tts-btn settings${showSettings ? " active" : ""}`}
          >
            <FaCog />
          </button>
        </div>

        <div className="reader-tools-divider" />

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
