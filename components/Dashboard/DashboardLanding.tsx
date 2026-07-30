'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Play, ChevronRight, ChevronLeft, Film, Search, TrendingUp } from 'lucide-react';
import { MOVIES_DATA } from '../Movie/constants';
import { sanityFetch, urlFor } from '@/lib/sanity/client';
import { getStories, getCategories } from '@/lib/sanity/queries';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PILL_TABS = [
  { id: 'all',          label: 'For You' },
  { id: 'reels',        label: 'Reels' },
  { id: 'news',         label: 'News' },
  { id: 'music',        label: 'Music' },
  { id: 'comedy',       label: 'Comedy' },
  { id: 'tourism',      label: 'Tourism' },
  { id: 'heritage',     label: 'Heritage' },
  { id: 'culture',      label: 'Culture' },
  { id: 'cinema',       label: 'Cinema' },
  { id: 'announcement', label: 'Announcement' }
];

function formatCount(n: string | number | undefined): string {
  if (!n) return '0';
  const num = parseInt(String(n), 10);
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return String(num);
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Recently';
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

interface DashboardLandingProps {
  onPlayReel: (video: any) => void;
  reels: any[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function DashboardLanding({ onPlayReel, reels, activeCategory, onCategoryChange }: DashboardLandingProps) {
  const router = useRouter();
  const [bannerMovie, setBannerMovie] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [storyCategories, setStoryCategories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  const reelsRef = useRef<HTMLDivElement>(null);
  const reelsScrollRef = useRef<HTMLDivElement>(null);
  const moviesScrollRef = useRef<HTMLDivElement>(null);
  const longFormScrollRef = useRef<HTMLDivElement>(null);

  // Initialize and rotate banner every 10 minutes
  useEffect(() => {
    const getRandomMovie = () => MOVIES_DATA[Math.floor(Math.random() * MOVIES_DATA.length)];
    setBannerMovie(getRandomMovie());
    const interval = setInterval(() => {
      setBannerMovie(getRandomMovie());
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle playing the banner movie
  const handleBannerPlay = () => {
    if (bannerMovie) {
      router.push(`/dashboard/movie`);
    }
  };

  // Fetch Sanity Stories using getStories() like StoryGrid does
  useEffect(() => {
    const fetchStories = async () => {
      setLoadingStories(true);
      try {
        const [storiesData, categoriesData] = await Promise.all([
          getStories(),
          getCategories()
        ]);
        if (storiesData) setStories(storiesData);
        if (categoriesData) setStoryCategories(categoriesData);
      } catch (err) {
        console.error('Failed to fetch stories:', err);
      } finally {
        setLoadingStories(false);
      }
    };
    fetchStories();
  }, []);

  // Filter stories by global activeCategory
  const filteredStories = useMemo(() => {
    if (activeCategory === 'all' || activeCategory === 'reels') return stories;
    return stories.filter(
      (s) => s.category?.slug?.current === activeCategory || s.category?.title?.toLowerCase() === activeCategory
    );
  }, [stories, activeCategory]);

  // Image fallback logic from StoryGrid
  const getImageUrl = (image: any, fallbackIndex: number) => {
    if (image?.asset) {
      return urlFor(image).width(800).height(500).fit('crop').url();
    }
    const fallbacks = [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542601906990-b4d3fb852ba3?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=1964&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    ];
    return fallbacks[fallbackIndex % fallbacks.length];
  };

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.scrollBy({ left: 300, behavior: 'smooth' });
  };



  const filteredReels = useMemo(() => {
    return reels || [];
  }, [reels]);

  // Long-form videos (news, comedy, etc.) — filter for non-short content
  const longFormVideos = useMemo(() => {
    return (reels || []).filter((v: any) => {
      const title = (v.title || '').toLowerCase();
      return title.includes('news') || title.includes('comedy') || title.includes('interview')
        || title.includes('documentary') || title.includes('movie') || title.includes('film')
        || title.includes('report') || title.includes('show');
    }).slice(0, 10);
  }, [reels]);

  // Trending news — random subset of stories
  const trendingNews = useMemo(() => {
    if (!stories.length) return [];
    const shuffled = [...stories].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [stories]);

  // Handle scroll for reels
  const handleScrollToReels = () => {
    reelsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Stable random progress values for continue watching (avoid hydration mismatch)
  const [progressValues, setProgressValues] = useState<number[]>([]);
  useEffect(() => {
    setProgressValues(MOVIES_DATA.slice(0, 8).map(() => Math.floor(Math.random() * 60) + 20));
  }, []);



  return (
    <div className="w-full pb-12" style={{ zoom: 0.9 }}>
      {/* Navigation Pills — sticky */}
      <div className="sticky top-0 z-40 bg-[color:var(--background)]/95 backdrop-blur-xl py-3 mb-6 flex items-center gap-3 overflow-x-auto no-scrollbar border-b border-[color:var(--border)]/60 px-2 sm:px-6 lg:px-8">
        {PILL_TABS.map((tab, idx) => (
          <button
            key={`${tab.id}-${idx}`}
            onClick={() => onCategoryChange(tab.id)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium tracking-tight transition-all duration-300 flex-shrink-0 ${
              activeCategory === tab.id
                ? 'bg-[#CE1126] text-white shadow-[0_0_15px_rgba(206,17,38,0.3)]'
                : 'bg-transparent text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)]/70 hover:text-[color:var(--foreground)] border border-[color:var(--border)]/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-2 sm:px-6 lg:px-8 flex flex-col gap-10">

        {/* ═══ Dynamic Hero Banner — clean image, no text overlay ═══ */}
        {bannerMovie && (
          <section className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl sm:rounded-[2rem] overflow-hidden group shadow-2xl border border-white/5 bg-black">
            <Image
              src={bannerMovie.image}
              alt={bannerMovie.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              unoptimized
              priority
              sizes="100vw"
            />
            {/* Subtle bottom gradient only */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14]/60 via-transparent to-transparent" />

            {/* Play button */}
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <button
                onClick={handleBannerPlay}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 cursor-pointer"
              >
                <div className="absolute inset-0 bg-[#CE1126] rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                <Play size={32} className="text-white relative z-10 ml-2 fill-current" />
              </button>
            </div>

            {/* Bottom-left movie title badge — intentionally white over image */}
            <div className="absolute bottom-4 left-4 z-10">
              <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/10">
                {bannerMovie.title}
              </span>
            </div>
          </section>
        )}


        {/* ═══ Sawa Reels Section ═══ */}
        <section ref={reelsRef} className="scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
              <Image src="/sawaplay.png" alt="Sawa" fill sizes="24px" className="object-contain" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)] tracking-tight">Sawa Reels</h2>
            </div>
            <button onClick={() => onCategoryChange('reels')} className="text-[#CE1126] text-sm font-bold hover:text-red-400 transition-colors">View all</button>
          </div>

          <div className="relative group/slider">
            <div
              ref={reelsScrollRef}
              className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4"
            >
              {filteredReels.length > 0 ? filteredReels.map((reel: any) => (
                <div
                  key={reel.id}
                  onClick={() => onPlayReel(reel)}
                  className="relative w-[140px] sm:w-[180px] aspect-[9/16] flex-shrink-0 snap-start rounded-xl overflow-hidden cursor-pointer group/card border border-white/5 hover:border-white/20 transition-colors"
                >
                  <Image
                    src={reel.thumbnail || `https://i.ytimg.com/vi/${reel.id}/maxresdefault.jpg`}
                    alt={reel.title}
                    fill
                    className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute top-2 right-2 flex items-center gap-1 text-white/90 text-xs font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                    <Play size={10} className="fill-current" />
                    {formatCount(reel.viewCount)}
                  </div>

                  {/* Intentionally white — sits on a photo overlay rather than a themed surface */}
                  <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1">
                    <h3 className="text-white text-sm font-bold line-clamp-2 leading-tight drop-shadow-md">
                      {reel.title}
                    </h3>
                    <p className="text-white/70 text-xs truncate">
                      @{reel.channelTitle?.replace(/\s+/g, '_').toLowerCase()}
                    </p>
                  </div>

                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                      <Play size={24} className="text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="w-full py-12 text-center text-[color:var(--muted-foreground)] text-sm">
                  No reels found for this category.
                </div>
              )}
            </div>

            <button onClick={() => scrollLeft(reelsScrollRef)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity z-10">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scrollRight(reelsScrollRef)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity z-10">
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        {/* ═══ Long-Form Videos (News, Comedy, etc.) ═══ */}
        {longFormVideos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#CE1126]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)] tracking-tight">News & Comedy</h2>
              </div>
              <button onClick={() => onCategoryChange('news')} className="text-[#CE1126] text-sm font-bold hover:text-red-400 transition-colors">View all</button>
            </div>

            <div className="relative group/slider">
              <div
                ref={longFormScrollRef}
                className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4"
              >
                {longFormVideos.map((video: any) => (
                  <div
                    key={video.id}
                    onClick={() => onPlayReel(video)}
                    className="relative w-[260px] sm:w-[300px] flex-shrink-0 snap-start flex flex-col gap-3 cursor-pointer group/card"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 group-hover/card:border-white/20 transition-colors">
                      <Image
                        src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
                        alt={video.title}
                        fill
                        className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                          <Play size={24} className="text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 px-1">
                      <h3 className="text-[color:var(--foreground)] text-sm font-bold truncate">{video.title}</h3>
                      <p className="text-[color:var(--muted-foreground)] text-xs truncate">{video.channelTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => scrollLeft(longFormScrollRef)} className="absolute left-2 top-[40%] -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity z-10">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scrollRight(longFormScrollRef)} className="absolute right-2 top-[40%] -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity z-10">
                <ChevronRight size={20} />
              </button>
            </div>
          </section>
        )}

        {/* ═══ Top Stories Section ═══ */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)] tracking-tight">Top Stories</h2>
              <p className="text-[color:var(--muted-foreground)] text-sm">Stay updated with what matters in our culture, community and country.</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6 sm:overflow-visible">
            {loadingStories ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[260px] sm:w-auto flex-shrink-0 aspect-[4/5] rounded-xl bg-[color:var(--surface)]/70 animate-pulse snap-start" />
              ))
            ) : filteredStories.length > 0 ? (
              filteredStories.slice(0, 8).map((story: any, index: number) => {
                const dateText = formatRelativeTime(story.publishedAt);
                
                return (
                  <div
                    key={story._id}
                    className="w-[260px] sm:w-auto flex-shrink-0 snap-start group relative bg-[color:var(--surface)]/70 border border-[color:var(--border)]/60 rounded-2xl overflow-hidden hover:border-red-600/30 transition-all flex flex-col"
                  >
                    <div className="relative h-40 sm:h-48 overflow-hidden flex-shrink-0">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${getImageUrl(story.mainImage, index)})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                      <div className="absolute top-3 left-3">
                        <span
                          className="px-2 py-0.5 text-white text-[9px] font-bold rounded-md tracking-widest backdrop-blur-md uppercase"
                          style={{ backgroundColor: (story.category?.color || "#E50914") + "E6" }}
                        >
                          {story.category?.title || "Story"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                      <h3 className="text-sm sm:text-base font-bold text-[color:var(--foreground)] mb-2 group-hover:text-red-500 transition-colors leading-snug line-clamp-2">
                        {story.title}
                      </h3>

                      <div className="flex items-center gap-2 text-[color:var(--muted-foreground)] text-[10px] font-bold tracking-widest mt-auto pt-2">
                        <span>{dateText}</span>
                        <div className="w-1 h-1 rounded-full bg-[color:var(--border)]" />
                        <span>{story.readTime || "3 min read"}</span>
                      </div>
                      
                      {/* Hidden link that covers the card for clicking */}
                      <Link href={`/dashboard/blogs/${story.slug?.current || story._id}`} className="absolute inset-0 z-10" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-10 text-center text-[color:var(--muted-foreground)] bg-[color:var(--surface)]/70 rounded-xl border border-[color:var(--border)]/40 w-full">
                No stories found for this category.
              </div>
            )}
          </div>
        </section>

        {/* ═══ Continue Watching Section ═══ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)] tracking-tight">Continue Watching</h2>
            </div>
            <button onClick={() => onCategoryChange('cinema')} className="text-[#CE1126] text-sm font-bold hover:text-red-400 transition-colors">View all</button>
          </div>

          <div className="relative group/slider">
            <div
              ref={moviesScrollRef}
              className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4"
            >
              {MOVIES_DATA.slice(0, 8).map((movie: any, idx: number) => (
                <div
                  key={movie.id}
                  className="relative w-[260px] sm:w-[300px] flex-shrink-0 snap-start flex flex-col gap-3 cursor-pointer group/card"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 group-hover/card:border-white/20 transition-colors">
                    <Image
                      src={movie.image}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors" />

                    {/* Red progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-[#CE1126]" style={{ width: progressValues[idx] ? `${progressValues[idx]}%` : '0%' }} />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                        <Play size={24} className="text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 px-1">
                    <h3 className="text-[color:var(--foreground)] text-sm font-bold truncate group-hover/card:text-[color:var(--foreground)]/80 transition-colors">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-[color:var(--muted-foreground)] text-xs">
                      <span>{movie.genres[0]}</span>
                      <span>•</span>
                      <span>{movie.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => scrollLeft(moviesScrollRef)} className="absolute left-2 top-[40%] -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity z-10">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scrollRight(moviesScrollRef)} className="absolute right-2 top-[40%] -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity z-10">
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
