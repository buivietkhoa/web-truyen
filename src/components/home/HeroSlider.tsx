"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBookOpen, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const slides = [
  {
    badge: "TRUYỆN HOT",
    title: "Kiếm Đạo Độc Tôn: Bí Mật Của Cửu Giới",
    description:
      "Hành trình của một thiếu niên bình thường tình cờ nhặt được thanh kiếm cổ, từ đó khai mở con đường trở thành chí tôn...",
    image: "https://picsum.photos/900/520?random=101",
    detailUrl: "/truyen/kiem-nghich-thuong-khung",
  },
  {
    badge: "MỚI CẬP NHẬT",
    title: "Thần Đạo Đan Tôn",
    description:
      "Một đan đạo thiên tài trọng sinh, bắt đầu lại con đường tu luyện và từng bước bước lên đỉnh cao.",
    image: "https://picsum.photos/900/520?random=102",
    detailUrl: "/truyen/than-dao-dan-ton",
  },
  {
    badge: "ĐỀ CỬ",
    title: "Phàm Nhân Tu Tiên",
    description:
      "Một người bình thường bước vào tiên đạo, dùng nghị lực và trí tuệ để vượt qua vô số kiếp nạn.",
    image: "https://picsum.photos/900/520?random=103",
    detailUrl: "/truyen/pham-nhan-tu-tien",
  },
];

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

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
      style={{ backgroundImage: `url(${activeSlide.image})` }}
    >
      <Link
        href={activeSlide.detailUrl}
        className="hero-slide-link"
        aria-label={`Xem chi tiết truyện ${activeSlide.title}`}
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

        <h1>{activeSlide.title}</h1>

        <p>{activeSlide.description}</p>

        <div className="hero-actions">
          <Link href={activeSlide.detailUrl} className="btn btn-primary">
            <FaBookOpen className="mr-2" />
            Đọc ngay
          </Link>

          <Link href={activeSlide.detailUrl} className="btn btn-outline-light">
            Chi tiết
          </Link>
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
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
