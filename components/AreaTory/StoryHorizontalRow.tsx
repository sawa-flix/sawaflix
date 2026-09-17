'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StoryCard, { StoryItem } from './StoryCard';

interface StoryHorizontalRowProps {
  id?: string;
  title: string;
  subtitle?: string;
  stories: StoryItem[];
  statsMap?: Record<string, { likesCount: number; viewsCount: number; commentsCount: number }>;
}

export default function StoryHorizontalRow({
  id,
  title,
  subtitle,
  stories,
  statsMap = {},
}: StoryHorizontalRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, stories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -640 : 640;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!stories || stories.length === 0) return null;

  return (
    <section id={id} className="space-y-3.5 scroll-mt-24">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[color:var(--foreground)] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[color:var(--muted-foreground)] text-xs sm:text-sm font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Navigation Buttons (desktop) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${title} left`}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              canScrollLeft
                ? 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)] cursor-pointer active:scale-95'
                : 'border-[color:var(--border)] bg-transparent text-[color:var(--muted-foreground)] opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label={`Scroll ${title} right`}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              canScrollRight
                ? 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)] cursor-pointer active:scale-95'
                : 'border-[color:var(--border)] bg-transparent text-[color:var(--muted-foreground)] opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide py-2 px-0.5 scroll-smooth snap-x snap-mandatory focus:outline-none"
        tabIndex={0}
      >
        {stories.map((story, index) => {
          const stats = statsMap[story._id] || statsMap[story.slug?.current || ''];
          return (
            <StoryCard
              key={story._id}
              story={story}
              index={index}
              stats={stats}
            />
          );
        })}
      </div>
    </section>
  );
}
