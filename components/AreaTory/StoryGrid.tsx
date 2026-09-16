'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import StoryHorizontalRow from './StoryHorizontalRow';
import { StoryItem } from './StoryCard';
import { getStories, getCategories } from '@/lib/sanity/queries';

interface CategoryItem {
  _id: string;
  title: string;
  slug: { current: string };
  color?: string;
}

// Fixed category pill presets matching user screenshot
const PRESET_PILLS = [
  { id: 'for-you', label: 'For You', slug: 'for-you' },
  { id: 'cinema', label: 'Cinema', slug: 'cinema' },
  { id: 'music', label: 'Music', slug: 'music' },
  { id: 'culture', label: 'Culture', slug: 'culture' },
  { id: 'heritage', label: 'Heritage', slug: 'heritage' },
  { id: 'tourism', label: 'Tourism', slug: 'tourism' },
  { id: 'announcement', label: 'Announcement', slug: 'announcement' },
];

export default function StoryGrid() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('for-you');
  const [loading, setLoading] = useState(true);
  const [statsMap, setStatsMap] = useState<
    Record<string, { likesCount: number; viewsCount: number; commentsCount: number }>
  >({});

  // Fetch stories & categories
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        // Try direct sanityFetch first, or fallback to internal API route
        let storiesData: StoryItem[] | null = null;
        let categoriesData: CategoryItem[] | null = null;

        try {
          const [s, c] = await Promise.all([getStories(), getCategories()]);
          storiesData = s;
          categoriesData = c;
        } catch (sanityErr) {
          console.warn('[StoryGrid] Direct sanity query failed, trying API route:', sanityErr);
          const res = await fetch('/api/stories').then((r) => r.json()).catch(() => null);
          if (res?.stories) {
            storiesData = res.stories;
            categoriesData = res.categories;
          }
        }

        if (isMounted) {
          if (storiesData && storiesData.length > 0) {
            setStories(storiesData);

            // Fetch live stats from Neon DB
            const storyIds = storiesData.map((s) => s._id);
            fetch('/api/stories/batch-stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ storyIds }),
            })
              .then((r) => r.json())
              .then((data) => {
                if (isMounted && data?.stats) {
                  setStatsMap(data.stats);
                }
              })
              .catch(() => {});
          }

          if (categoriesData && categoriesData.length > 0) {
            setCategories(categoriesData);
          }
        }
      } catch (err) {
        console.error('[StoryGrid] Fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge categories from Sanity with any extra categories present in stories
  const allCategoryPills = useMemo(() => {
    const list = [{ id: 'for-you', label: 'For You', slug: 'for-you' }];
    const seen = new Set(['for-you']);

    // Add preset pills first if matching categories exist
    PRESET_PILLS.forEach((p) => {
      if (!seen.has(p.slug)) {
        seen.add(p.slug);
        list.push({ id: p.id, label: p.label, slug: p.slug });
      }
    });

    // Add any dynamic categories from Sanity
    categories.forEach((cat) => {
      const slug = cat.slug?.current || cat.title.toLowerCase();
      if (!seen.has(slug)) {
        seen.add(slug);
        list.push({ id: cat._id, label: cat.title, slug });
      }
    });

    return list;
  }, [categories]);

  // Group stories by category
  const categorizedStories = useMemo(() => {
    const map: Record<string, { title: string; stories: StoryItem[] }> = {
      cinema: { title: 'Cinema & Movies', stories: [] },
      music: { title: 'Music & Sounds', stories: [] },
      culture: { title: 'Culture & Traditions', stories: [] },
      heritage: { title: 'Heritage & History', stories: [] },
      tourism: { title: 'Tourism & Travel', stories: [] },
      announcement: { title: 'Announcements & Community', stories: [] },
    };

    stories.forEach((story) => {
      const catSlug = story.category?.slug?.current?.toLowerCase();
      if (catSlug && map[catSlug]) {
        map[catSlug].stories.push(story);
      } else if (catSlug) {
        if (!map[catSlug]) {
          map[catSlug] = {
            title: story.category?.title || catSlug.charAt(0).toUpperCase() + catSlug.slice(1),
            stories: [],
          };
        }
        map[catSlug].stories.push(story);
      }
    });

    return map;
  }, [stories]);

  // Handle pill click
  const handlePillClick = (slug: string) => {
    setActiveCategory(slug);
    if (slug === 'for-you') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.getElementById(`section-${slug}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Top Category Filter Pills — Single horizontal row, sleek dark style */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-0.5 select-none">
        {allCategoryPills.map((pill) => {
          const isActive = activeCategory === pill.slug;
          return (
            <button
              key={pill.id}
              onClick={() => handlePillClick(pill.slug)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-md shadow-white/10 font-bold'
                  : 'bg-[#161822] text-zinc-400 border border-white/5 hover:border-white/20 hover:text-white hover:bg-[#1c1f2c]'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
          <p className="text-zinc-500 text-xs font-medium tracking-wide">
            Loading stories from Area Tory...
          </p>
        </div>
      )}

      {/* No stories empty state */}
      {!loading && stories.length === 0 && (
        <div className="text-center py-20 bg-[#12141C] border border-white/5 rounded-2xl p-8">
          <h3 className="text-white font-bold text-base mb-1">No stories available</h3>
          <p className="text-zinc-500 text-xs">
            Stories will appear here once published from the admin panel.
          </p>
        </div>
      )}

      {/* Stacked Categorized Sections */}
      {!loading && stories.length > 0 && (
        <div className="space-y-12">
          {/* Section 1: Top Stories (Latest Stories from Admin) */}
          <StoryHorizontalRow
            id="section-top-stories"
            title="Top Stories"
            subtitle="Stay updated with what matters in our culture, community and country."
            stories={stories.slice(0, 16)}
            statsMap={statsMap}
          />

          {/* Section 2: Cinema */}
          {categorizedStories.cinema?.stories.length > 0 && (
            <StoryHorizontalRow
              id="section-cinema"
              title={categorizedStories.cinema.title}
              subtitle="Behind the scenes, premieres, and the rise of Cameroonian cinema."
              stories={categorizedStories.cinema.stories}
              statsMap={statsMap}
            />
          )}

          {/* Section 3: Music */}
          {categorizedStories.music?.stories.length > 0 && (
            <StoryHorizontalRow
              id="section-music"
              title={categorizedStories.music.title}
              subtitle="Sounds, artists, and musical journeys from across Cameroon."
              stories={categorizedStories.music.stories}
              statsMap={statsMap}
            />
          )}

          {/* Section 4: Culture */}
          {categorizedStories.culture?.stories.length > 0 && (
            <StoryHorizontalRow
              id="section-culture"
              title={categorizedStories.culture.title}
              subtitle="Preserving identity, traditions, and sacred cultural celebrations."
              stories={categorizedStories.culture.stories}
              statsMap={statsMap}
            />
          )}

          {/* Section 5: Heritage */}
          {categorizedStories.heritage?.stories.length > 0 && (
            <StoryHorizontalRow
              id="section-heritage"
              title={categorizedStories.heritage.title}
              subtitle="Historical deep dives and generational wisdom."
              stories={categorizedStories.heritage.stories}
              statsMap={statsMap}
            />
          )}

          {/* Section 6: Tourism */}
          {categorizedStories.tourism?.stories.length > 0 && (
            <StoryHorizontalRow
              id="section-tourism"
              title={categorizedStories.tourism.title}
              subtitle="Discover breathtaking destinations and cultural landmarks."
              stories={categorizedStories.tourism.stories}
              statsMap={statsMap}
            />
          )}

          {/* Section 7: Announcement */}
          {categorizedStories.announcement?.stories.length > 0 && (
            <StoryHorizontalRow
              id="section-announcement"
              title={categorizedStories.announcement.title}
              subtitle="Official announcements, community updates, and creator programs."
              stories={categorizedStories.announcement.stories}
              statsMap={statsMap}
            />
          )}

          {/* Additional dynamic categories if any */}
          {Object.entries(categorizedStories).map(([slug, cat]) => {
            if (
              ['cinema', 'music', 'culture', 'heritage', 'tourism', 'announcement'].includes(slug) ||
              cat.stories.length === 0
            ) {
              return null;
            }
            return (
              <StoryHorizontalRow
                key={slug}
                id={`section-${slug}`}
                title={cat.title}
                stories={cat.stories}
                statsMap={statsMap}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
