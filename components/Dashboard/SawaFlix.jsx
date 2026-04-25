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
import Link from 'next/link';
import Image from 'next/image';
import { useVideos } from '@/hooks/useVideos';
import { YouTubePlayer } from '../YoutubePlayer';

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

  const currentCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
  const { videos, loading, error } = useVideos(currentCategoryObj?.query || CATEGORIES[0].query);

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
    if (videos.length > 0) {
      setHeroIndex((prev) => (prev + 1) % Math.min(videos.length, 3));
    }
  }, [videos.length]);

  const toggleHeroPlay = () => {
    setHeroPlaying(!heroPlaying);
  };

  // 5-second auto-slide effect for 'motions' on entry
  useEffect(() => {
    if (!heroPlaying || !videos.length) return;

    const interval = setInterval(() => {
      nextHeroVideo();
    }, 25000); // Increased to 25 seconds for longer previews

    return () => clearInterval(interval);
  }, [heroPlaying, nextHeroVideo, videos.length]);

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

        {/* Category Navigation - Scrollable & Responsive */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar pb-6 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-3xl p-1.5 rounded-full border border-white/10 shadow-2xl scale-100 sm:scale-110">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${activeCategory === cat.id
                    ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section - Video Carousel */}
        <section className="relative h-[70vh] sm:h-[75vh] lg:h-[80vh] rounded-[2.5rem] overflow-hidden mb-20 group shadow-2xl border border-white/5 bg-black">
          {videos.length > 0 && (
            <>
              {/* High-quality Thumbnail Backdrop (Fades out when video plays) */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={videos[heroIndex].thumbnail}
                  alt={videos[heroIndex].title}
                  fill
                  className="object-cover opacity-60 scale-105 blur-sm transition-opacity duration-1000"
                  priority
                />
              </div>

              {/* Video Player Layer */}
              <div className="absolute inset-0 z-10">
                <YouTubePlayer
                  videoId={videos[heroIndex].id}
                  isActive={heroPlaying}
                  isMuted={true}
                  onPlayerReady={(player) => {
                    if (heroPlaying) player.playVideo();
                  }}
                />
              </div>
            </>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-black/20 to-transparent pointer-events-none z-10" />
          
          <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <h1 className="text-5xl sm:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
              Sawa<span className="text-red-600">Flix</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8 font-black uppercase tracking-widest drop-shadow-md max-w-xl">
              {videos.length > 0 ? videos[heroIndex].title : "Loading Vibe..."}
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
            onClick={() => setHeroIndex(prev => (prev === 0 ? Math.min(videos.length, 3) - 1 : prev - 1))}
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

          {/* Carousel Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {videos.slice(0, 3).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`transition-all duration-500 rounded-full ${heroIndex === idx ? 'w-10 h-2 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        </section>

        {/* Discovery Feed - TikTok Style */}
        <section ref={discoverRef} className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-white flex items-center gap-4">
              <span className="w-1.5 h-10 bg-red-600 rounded-full" />
              Discover Content
            </h2>
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
