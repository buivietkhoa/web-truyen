"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface FavoriteStory {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  latestChapterNumber: number | null;
}

interface FavoriteStoriesCarouselProps {
  stories: FavoriteStory[];
}

export default function FavoriteStoriesCarousel({
  stories,
}: FavoriteStoriesCarouselProps) {
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
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  const renderStory = (story: FavoriteStory, duplicate = false) => (
    <div
      className={`profile-favorite-slide${duplicate ? " profile-favorite-copy" : ""}`}
      key={`${duplicate ? "copy-" : ""}${story.id}`}
      aria-hidden={duplicate || undefined}
    >
      <Link
        href={`/truyen/${story.slug}`}
        className="profile-story-card"
        tabIndex={duplicate ? -1 : undefined}
      >
        <img src={story.coverImage} alt={duplicate ? "" : story.title} loading="lazy" />
        <h3>{story.title}</h3>
        <p>
          {story.latestChapterNumber
            ? `Chương ${story.latestChapterNumber}`
            : "Chưa có chương"}
        </p>
      </Link>
    </div>
  );

  return (
    <div
      ref={carouselRef}
      className="profile-favorites-carousel"
      onPointerDown={pause}
      onPointerUp={resume}
      onPointerCancel={resume}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="profile-favorites-track">
        {stories.map((story) => renderStory(story))}
        {stories.length > 1 && stories.map((story) => renderStory(story, true))}
      </div>
    </div>
  );
}
