'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Search,
  Volume2,
  VolumeX,
  MessageCircle,
  Share2,
  Heart,
  Loader2
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useVideos } from '@/hooks/useVideos';
import { YouTubePlayer } from '../YoutubePlayer';
import { X as CloseIcon } from 'lucide-react';

// Simulation of real video content
const CATEGORIES = [
  { id: "all", label: "All 237", query: "Cameroon music hits 2026" },
  { id: "music", label: "Music", query: "Cameroun music official video" },
  { id: "comedy", label: "Comedy", query: "Cameroun comedy series" },
  { id: "news", label: "News", query: "Cameroun news today" },
];

const VideoFeedItem = ({ video, isActive, isMuted, setIsMuted }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-[85vh] bg-black rounded-3xl overflow-hidden mb-6 group/item snap-start shadow-2xl border border-white/5">
      <div className="absolute inset-0 z-0">
        <YouTubePlayer
          videoId={video.id}
          isActive={isActive}
          isMuted={isMuted}
          onPlayerReady={(player) => {
            if (isActive) player.playVideo();
          }}
        />
      </div>

      {/* Dynamic Overlays */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10">
        <div className="flex items-end justify-between">
          <div className="space-y-2 pointer-events-auto">
            <h3 className="text-xl font-bold text-white tracking-tight">{video.title}</h3>
            <p className="text-red-500 font-black text-sm uppercase tracking-widest">{video.channelTitle}</p>
          </div>

          <div className="flex flex-col gap-6 pointer-events-auto">
            <button className="flex flex-col items-center gap-1 group">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full group-hover:bg-red-600 transition-colors">
                <Heart size={20} className="text-white fill-current" />
              </div>
              <span className="text-[10px] font-black text-white">{video.likeCount || '0'}</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full group-hover:bg-blue-600 transition-colors">
                <MessageCircle size={20} className="text-white fill-current" />
              </div>
              <span className="text-[10px] font-black text-white">{video.commentCount || '0'}</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full group-hover:bg-purple-600 transition-colors">
                <Share2 size={20} className="text-white fill-current" />
              </div>
              <span className="text-[10px] font-black text-white">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mute Button Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-6 right-6 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 z-20"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
};

// Fallback content when network is slow or content is unavailable
const FALLBACK_VIDEOS = {
  music: [
    { id: "-L8hLkg21MQ", title: "Top Music Picks", channelTitle: "SawaFlix Music", thumbnail: "https://i.ytimg.com/vi/-L8hLkg21MQ/maxresdefault.jpg" },
    { id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito", channelTitle: "SawaFlix Music", thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg" },
    { id: "OPf0YbXqDm0", title: "Mark Ronson - Uptown Funk", channelTitle: "SawaFlix Music", thumbnail: "https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg" }
  ],
  news: [
    { id: "8jUJivE9xIY", title: "Latest News Update", channelTitle: "SawaFlix News", thumbnail: "https://i.ytimg.com/vi/8jUJivE9xIY/maxresdefault.jpg" },
    { id: "H96I8m8v20g", title: "Global News Today", channelTitle: "SawaFlix News", thumbnail: "https://i.ytimg.com/vi/H96I8m8v20g/maxresdefault.jpg" }
  ],
  comedy: [
    { id: "ppnaU3oezZU", title: "Top Comedy Hits", channelTitle: "SawaFlix Comedy", thumbnail: "https://i.ytimg.com/vi/ppnaU3oezZU/maxresdefault.jpg" },
    { id: "3MA0xds_Dk-qPCWN", title: "Hilarious Moments", channelTitle: "SawaFlix Comedy", thumbnail: "https://i.ytimg.com/vi/3MA0xds_Dk-qPCWN/maxresdefault.jpg" }
  ],
  all: [
    { id: "-L8hLkg21MQ", title: "Trending Highlights", channelTitle: "SawaFlix Featured", thumbnail: "https://i.ytimg.com/vi/-L8hLkg21MQ/maxresdefault.jpg" },
    { id: "8jUJivE9xIY", title: "News Flash", channelTitle: "SawaFlix News", thumbnail: "https://i.ytimg.com/vi/8jUJivE9xIY/maxresdefault.jpg" },
    { id: "ppnaU3oezZU", title: "Comedy Spotlight", channelTitle: "SawaFlix Comedy", thumbnail: "https://i.ytimg.com/vi/ppnaU3oezZU/maxresdefault.jpg" }
  ]
};

const SawaFlix = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroVideoRef = useRef(null);
  const [heroPlaying, setHeroPlaying] = useState(true);

  const observerRef = useRef(null);
  const videoRefs = useRef(new Map());
  const discoverRef = useRef(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('q');

  const currentCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
  
  // Dynamic query: use Search Query if present, otherwise use Category Query
  const fetchQuery = searchQuery || currentCategoryObj?.query || CATEGORIES[0].query;
  const { videos, loading, error } = useVideos(fetchQuery);

  // Determine current hero content (main videos or category-specific fallback)
  const heroSource = videos.length > 0 ? videos : (FALLBACK_VIDEOS[activeCategory] || FALLBACK_VIDEOS.all);
  const currentHeroVideo = heroSource[heroIndex % heroSource.length];

  useEffect(() => {
    if (!videos.length) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoId = entry.target.getAttribute('data-video-id');
            if (videoId) setActiveVideoId(videoId);
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach(el => {
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [videos]);

  const nextHeroVideo = useCallback(() => {
    setHeroIndex((prev) => (prev + 1) % heroSource.length);
  }, [heroSource.length]);

  const toggleHeroPlay = () => {
    setHeroPlaying(!heroPlaying);
  };

  // 5-second auto-slide effect for 'motions' on entry
  useEffect(() => {
    if (!heroPlaying) return;

    const interval = setInterval(() => {
      nextHeroVideo();
    }, 25000); // Increased to 25 seconds for longer previews

    return () => clearInterval(interval);
  }, [heroPlaying, nextHeroVideo]);

  const scrollToDiscover = () => {
    setHeroPlaying(false); // Stop carousel motions when navigating to feed
    discoverRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col overflow-x-hidden">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-6">

        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar pb-6 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-lg border text-[11px] font-bold transition-all duration-300 cursor-pointer tracking-widest ${
                  activeCategory === cat.id
                    ? "border-white text-white bg-white/10"
                    : "border-white/10 text-gray-400 hover:border-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section - Video Carousel */}
        <section className="relative h-[70vh] sm:h-[75vh] lg:h-[80vh] rounded-[2.5rem] overflow-hidden mb-20 group shadow-2xl border border-white/5 bg-black">
          {/* High-quality Thumbnail Backdrop (Fades out when video plays) */}
          <div className="absolute inset-0 z-0">
            <Image
              src={currentHeroVideo.thumbnail || `https://i.ytimg.com/vi/${currentHeroVideo.id}/maxresdefault.jpg`}
              alt={currentHeroVideo.title}
              fill
              className="object-cover opacity-60 scale-105 blur-sm transition-opacity duration-1000"
              priority
            />
          </div>

          {/* Video Player Layer */}
          <div className="absolute inset-0 z-10">
            <YouTubePlayer
              videoId={currentHeroVideo.id}
              isActive={heroPlaying}
              isMuted={true}
              onPlayerReady={(player) => {
                if (heroPlaying) player.playVideo();
              }}
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-black/20 to-transparent pointer-events-none z-10" />
          
          <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <h1 className="text-5xl sm:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
              Sawa<span className="text-red-600">Flix</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8 font-black uppercase tracking-widest drop-shadow-md max-w-xl">
              {loading && !videos.length ? "LOADING VIBE..." : currentHeroVideo.title}
            </p>

            <div className="flex items-center gap-6 pointer-events-auto">
              <button
                onClick={scrollToDiscover}
                className="bg-red-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-600/40 active:scale-95"
              >
                Play Now
              </button>
            </div>
          </div>

          {/* Edge Navigation Buttons */}
          <button 
            onClick={() => setHeroIndex(prev => (prev === 0 ? heroSource.length - 1 : prev - 1))}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-red-600 z-20 pointer-events-auto"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextHeroVideo}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-red-600 z-20 pointer-events-auto"
          >
            <ChevronRight size={24} />
          </button>

          {/* Watermark / Brand Identity */}
          <div className="absolute bottom-10 right-10 z-20 pointer-events-none text-right hidden sm:block">
            <h3 className="text-2xl font-black text-white leading-none tracking-tighter mb-1">
              Sawa<span className="text-red-600">Flix</span>
            </h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
              TRENDING HIGHLIGHTS
            </p>
          </div>

          {/* Carousel Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
            {heroSource.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`transition-all duration-500 rounded-full ${heroIndex % heroSource.length === idx ? 'w-10 h-2 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        </section>

        {/* Discovery Feed - TikTok Style */}
        <section ref={discoverRef} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <span className="w-1.5 h-10 bg-red-600 rounded-full" />
              <h2 className="text-3xl font-black text-white">
                {searchQuery ? (
                  <span className="flex items-center gap-3">
                    Search Results for <span className="text-red-600">"{searchQuery}"</span>
                  </span>
                ) : (
                  "Discover Content"
                )}
              </h2>
            </div>
            
            {searchQuery && (
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all border border-white/5"
              >
                <CloseIcon size={14} />
                Clear Search
              </button>
            )}
          </div>

          <div className="max-w-4xl mx-auto space-y-8 min-h-[50vh]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Latest Vibes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-950/20 rounded-[2.5rem] border border-red-900/30">
                <p className="text-red-500 font-black mb-2 uppercase tracking-widest text-xs">Playback Error</p>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">{error}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    ref={el => videoRefs.current.set(video.id, el)}
                    data-video-id={video.id}
                  >
                    <VideoFeedItem
                      video={video}
                      isActive={activeVideoId === video.id}
                      isMuted={isMuted}
                      setIsMuted={setIsMuted}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default SawaFlix;
