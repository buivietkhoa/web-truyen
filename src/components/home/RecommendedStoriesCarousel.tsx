"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface RecommendedStory {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  coverImage: string;
  views: number;
}

interface RecommendedStoriesCarouselProps {
  stories: RecommendedStory[];
}

export default function RecommendedStoriesCarousel({
  stories,
}: RecommendedStoriesCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel || stories.length < 2) {
      return;
    }

    let frameId = 0;
    let previousTime = performance.now();

    const animate = (time: number) => {
      const isMobile = window.matchMedia("(max-width: 575.98px)").matches;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (isMobile && !reduceMotion && !pausedRef.current) {
        const elapsed = Math.min(time - previousTime, 50);
        carousel.scrollLeft += elapsed * 0.025;

        const loopPoint = carousel.scrollWidth / 2;
        if (carousel.scrollLeft >= loopPoint) {
          carousel.scrollLeft -= loopPoint;
        }
      }

      previousTime = time;
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, [stories.length]);

  const pause = () => {
    pausedRef.current = true;

    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }
  };

  const resume = () => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 1200);
  };

  const renderStory = (story: RecommendedStory, duplicate = false) => (
    <div
      className={`recommend-carousel-slide${duplicate ? " recommend-carousel-copy" : ""}`}
      key={`${duplicate ? "copy-" : ""}${story.id}`}
      aria-hidden={duplicate || undefined}
    >
      <Link
        href={`/truyen/${story.slug}`}
        className="recommend-card"
        tabIndex={duplicate ? -1 : undefined}
      >
        <Image
          src={story.coverImage}
          alt={duplicate ? "" : story.title}
          width={70}
          height={90}
        />
        <div>
          <h4>{story.title}</h4>
          <p>
            {story.category} - {story.status}
          </p>
          <span>{story.views.toLocaleString("vi-VN")} lượt đọc</span>
        </div>
      </Link>
    </div>
  );

  return (
    <div
      ref={carouselRef}
      className="recommend-carousel"
      onPointerDown={pause}
      onPointerUp={resume}
      onPointerCancel={resume}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="recommend-list">
        {stories.map((story) => renderStory(story))}
        {stories.length > 1 &&
          stories.map((story) => renderStory(story, true))}
      </div>
    </div>
  );
}
