"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBookOpen, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface HeroStory {
  slug: string;
  title: string;
  category: string;
  coverImage: string;
  description: string;
}

interface HeroSliderProps {
  stories: HeroStory[];
}

export default function HeroSlider({ stories }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (stories.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => window.clearInterval(timer);
  }, [stories.length]);

  if (stories.length === 0) {
    return null;
  }

  const activeSlide = stories[activeIndex] || stories[0];
  const detailUrl = `/truyen/${activeSlide.slug}`;

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="hero-slider"
      style={{ backgroundImage: `url(${activeSlide.coverImage})` }}
    >
      <Link
        href={detailUrl}
        className="hero-slide-link"
        aria-label={`Xem chi tiết truyện ${activeSlide.title}`}
      />

      {stories.length > 1 && (
        <>
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
        </>
      )}

      <div className="hero-slider-content">
        <span className="hot-badge">{activeSlide.category}</span>
        <h1>{activeSlide.title}</h1>
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

      {stories.length > 1 && (
        <div className="hero-dots">
          {stories.map((slide, index) => (
            <button
              key={slide.slug}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={index === activeIndex ? "active" : ""}
              aria-label={`Chuyển tới slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
