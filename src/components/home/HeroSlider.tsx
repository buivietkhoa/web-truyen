"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBookOpen, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { danhSachTruyen } from "@/data/truyen";

const slides = [
  {
    badge: "TRUYỆN HOT",
    story: danhSachTruyen.find(
      (truyen) => truyen.id === "kiem-nghich-thuong-khung"
    )!,
    description:
      "Hành trình của một thiếu niên cầm kiếm, vượt qua phong ba võ lâm để chạm tới đỉnh cao kiếm đạo.",
  },
  {
    badge: "MỚI CẬP NHẬT",
    story: danhSachTruyen.find((truyen) => truyen.id === "than-dao-dan-ton")!,
    description:
      "Một đan đạo thiên tài trọng sinh, bắt đầu lại con đường tu luyện và từng bước bước lên đỉnh cao.",
  },
  {
    badge: "ĐỀ CỬ",
    story: danhSachTruyen.find((truyen) => truyen.id === "pham-nhan-tu-tien")!,
    description:
      "Một người bình thường bước vào tiên đạo, dùng nghị lực và trí tuệ để vượt qua vô số kiếp nạn.",
  },
];

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const detailUrl = `/truyen/${activeSlide.story.id}`;

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = window.setInterval(goToNext, 4000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="hero-slider"
      style={{ backgroundImage: `url(${activeSlide.story.anhBia})` }}
    >
      <Link
        href={detailUrl}
        className="hero-slide-link"
        aria-label={`Xem chi tiết truyện ${activeSlide.story.ten}`}
      />

      <button
        className="hero-arrow hero-arrow-left"
        type="button"
        onClick={goToPrev}
        aria-label="Chuyển về slide trước"
      >
        <FaChevronLeft />
      </button>

      <button
        className="hero-arrow hero-arrow-right"
        type="button"
        onClick={goToNext}
        aria-label="Chuyển sang slide sau"
      >
        <FaChevronRight />
      </button>

      <div className="hero-slider-content">
        <span className="hot-badge">{activeSlide.badge}</span>
        <h1>{activeSlide.story.ten}</h1>
        <p>{activeSlide.description}</p>

        <div className="hero-actions">
          <Link href={detailUrl} className="btn btn-primary">
            <FaBookOpen className="mr-2" />
            Đọc ngay
          </Link>

          <Link href={detailUrl} className="btn btn-outline-light">
            Chi tiết
          </Link>
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.story.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={index === activeIndex ? "active" : ""}
            aria-label={`Chuyển tới slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
