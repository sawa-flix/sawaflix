'use client'
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import {
  Play, ChevronLeft, ChevronRight,
  Volume2, VolumeX, MessageCircle, Share2, Heart, Loader2,
  X, Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useVideos } from '@/hooks/useVideos';
import { useComments } from '@/hooks/useComments';
import { useVideoStats } from '@/hooks/useVideoStats';
import { YouTubePlayer } from '../YoutubePlayer';
import { youtubeApi } from '@/services/youtubeApi';
import SawaflixLogo from '../SawaflixLogo';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",    label: "Sawas",   query: "Cameroon music hits 2026" },
  { id: "music",  label: "Music",   query: "Cameroun music official video" },
  { id: "comedy", label: "Comedy",  query: "Cameroun comedy series" },
  { id: "news",   label: "News",    query: "Cameroun news today" },
];

function formatCount(n) {
  if (!n) return '0';
  const num = parseInt(n, 10);
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + 'K';
  return String(num);
}

function fmtTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Search Result Card ───────────────────────
const SearchResultCard = ({ video, onPlay }) => (
  <div
    onClick={() => onPlay(video)}
    className="group relative cursor-pointer rounded-2xl overflow-hidden bg-[#181b24] border border-white/8 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5"
    style={{ aspectRatio: '9/14' }}
  >
    <div className="absolute inset-0">
      <Image
        src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
        alt={video.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
    </div>

    <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-250">
      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl">
        <Play size={22} className="text-red-600 ml-1" fill="currentColor" />
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
      <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest truncate mb-0.5">
        {video.channelTitle}
      </p>
      <h3 className="text-white text-sm font-bold line-clamp-2 leading-snug">
        {video.title}
      </h3>
      {video.likeCount && (
        <div className="flex items-center gap-1 mt-1.5">
          <Heart size={10} className="text-white/60 fill-white/60" />
          <span className="text-white/60 text-[10px] font-bold">{formatCount(video.likeCount)}</span>
        </div>
      )}
    </div>
  </div>
);

// ─── HTML5 Player ─────────────────────────────────────────────────────────────
const HTML5Player = ({ videoId, videoUrl, isActive, isPaused, isMuted, onProgress, onPlayerReady }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // Provide the YouTube-like API to the parent
    if (onPlayerReady) {
      onPlayerReady({
        seekTo: (time) => { el.currentTime = time; },
        playVideo: () => { el.play().catch(() => {}); },
        pauseVideo: () => { el.pause(); },
        getCurrentTime: () => el.currentTime,
        getDuration: () => el.duration || 0,
        mute: () => { el.muted = true; },
        unMute: () => { el.muted = false; }
      });
    }
  }, [onPlayerReady]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    
    if (isActive && !isPaused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive, isPaused]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = isMuted;
  }, [isMuted]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      className="w-full h-full object-cover"
      playsInline
      loop
      onTimeUpdate={(e) => {
        const ct = e.target.currentTime;
        const dur = e.target.duration || 1;
        if (onProgress) {
          const remaining = Math.max(0, Math.floor(dur - ct));
          const mins = Math.floor(remaining / 60);
          const secs = remaining % 60;
          const timeLeft = `${mins}:${String(secs).padStart(2, '0')}`;
          onProgress((ct / dur) * 100, timeLeft, ct, dur);
        }
      }}
    />
  );
};

// ─── Video Feed Item ──────────────────────────────────────────────────────────
const VideoFeedItem = ({ video, isActive, isMuted, setIsMuted }) => {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [isPaused, setIsPaused]     = useState(false);
  const [isLiked, setIsLiked]       = useState(false);
  const [likeCount, setLikeCount]   = useState(parseInt(video.likeCount) || 0);
  const [tapFlash, setTapFlash]     = useState(null);
  const [shareToast, setShareToast] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [progress, setProgress]     = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const scrubberRef   = useRef(null);

  const playerRef     = useRef(null);
  const lastTapRef    = useRef({ time: 0, side: null });
  const flashTimer    = useRef(null);

  const { stats }  = useVideoStats(isActive ? video.id : null);
  const { comments, loading: commentsLoading, isOpen: commentOpen, setIsOpen: setCommentOpen, addComment }
    = useComments(isActive ? video.id : null);

  // Determine if this is a Sawaflix-origin video or YouTube
  const videoOrigin = video.origin === 'sawaflix' ? 'sawaflix' : 'youtube';

  const displayLikes    = isActive && stats ? (parseInt(stats.likeCount) || likeCount) : likeCount;
  const displayComments = isActive && stats ? stats.commentCount : video.commentCount;

  const flash = (type) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setTapFlash(type);
    flashTimer.current = setTimeout(() => setTapFlash(null), 800);
  };
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  const seekToPercent = useCallback((pct) => {
    const player = playerRef.current;
    if (!player || !duration) return;
    const newTime = Math.max(0, Math.min((pct / 100) * duration, duration));
    player.seekTo(newTime, true);
    setProgress(pct);
    setCurrentTime(newTime);
  }, [duration]);

  const getPercentFromEvent = (e) => {
    const bar = scrubberRef.current;
    if (!bar) return 0;
    const rect  = bar.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    return pct;
  };

  const onScrubStart = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    seekToPercent(getPercentFromEvent(e));
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove  = (e) => seekToPercent(getPercentFromEvent(e));
    const onEnd   = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, seekToPercent]);

  const handleVideoTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const side = x < rect.width / 2 ? 'left' : 'right';
    const now  = Date.now();
    const last = lastTapRef.current;

    if (now - last.time < 300 && last.side === side) {
      lastTapRef.current = { time: 0, side: null };
      const player = playerRef.current;
      if (player && typeof player.getCurrentTime === 'function') {
        const cur = player.getCurrentTime();
        if (side === 'right') { player.seekTo(cur + 10, true); flash('fwd'); }
        else                  { player.seekTo(Math.max(cur - 10, 0), true); flash('bwd'); }
      } else {
        flash(side === 'right' ? 'fwd' : 'bwd');
      }
    } else {
      lastTapRef.current = { time: now, side };
      setTimeout(() => {
        if (Date.now() - lastTapRef.current.time >= 290) {
          setIsPaused(p => { flash(p ? 'play' : 'pause'); return !p; });
        }
      }, 300);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount(c => nextLiked ? c + 1 : Math.max(c - 1, 0));
    
    // Call the server action completely outside the state updater function
    youtubeApi.likeVideo(video.id, videoOrigin).catch(() => {
      // revert on failure
      setIsLiked(!nextLiked);
      setLikeCount(c => !nextLiked ? c + 1 : Math.max(c - 1, 0));
    });
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    try {
      if (navigator.share) { await navigator.share({ title: video.title, url }); }
      else { await navigator.clipboard.writeText(url); setShareToast(true); setTimeout(() => setShareToast(false), 2500); }
    } catch {}
  };

  return (
    <div className="relative w-full h-[85vh] bg-black rounded-3xl overflow-hidden mb-6 shadow-2xl border border-white/5 group/vid flex flex-col lg:flex-row">
      {/* ── Main Video Area ── */}
      <motion.div 
        animate={{ 
          width: commentOpen && isDesktop ? 'calc(100% - 400px)' : '100%',
          scale: commentOpen && !isDesktop ? 0.85 : 1,
          y: commentOpen && !isDesktop ? '-20%' : '0%'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative h-full overflow-hidden flex-1"
      >
        <motion.div 
          animate={{ 
            scale: commentOpen && isDesktop ? 0.9 : 1,
            x: commentOpen && isDesktop ? '-2%' : '0%'
          }}
          className="absolute inset-0 z-0 flex items-center justify-center bg-black"
          onClick={() => setIsPaused(!isPaused)}
        >
          {videoOrigin === 'youtube' ? (
            <YouTubePlayer
              videoId={video.id}
              isActive={isActive}
              isPaused={isPaused}
              isMuted={isMuted}
              onPlayerReady={p => { playerRef.current = p; if (isActive) p.playVideo(); }}
              onProgress={(pct, _tLeft, ct, dur) => {
                if (!isDragging) {
                  setProgress(pct);
                  setCurrentTime(ct);
                  setDuration(dur);
                }
              }}
            />
          ) : (
            <HTML5Player
              videoId={video.id}
              videoUrl={video.videoUrl}
              isActive={isActive}
              isPaused={isPaused}
              isMuted={isMuted}
              onPlayerReady={p => { playerRef.current = p; if (isActive) p.playVideo(); }}
              onProgress={(pct, _tLeft, ct, dur) => {
                if (!isDragging) {
                  setProgress(pct);
                  setCurrentTime(ct);
                  setDuration(dur);
                }
              }}
            />
          )}
        </motion.div>

        {/* Tap overlay */}
        <div onClick={handleVideoTap} className="absolute inset-0 z-10 cursor-pointer" />

        {/* Tap flash feedback */}
        {tapFlash && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            {(tapFlash === 'play' || tapFlash === 'pause') && (
              <div className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center animate-ping-once">
                {tapFlash === 'pause'
                  ? <div className="flex gap-1.5"><div className="w-3 h-9 bg-white rounded-sm"/><div className="w-3 h-9 bg-white rounded-sm"/></div>
                  : <Play size={38} className="text-white ml-1" fill="currentColor" />
                }
              </div>
            )}
            {(tapFlash === 'fwd' || tapFlash === 'bwd') && (
              <div className={`absolute top-1/2 -translate-y-1/2 ${tapFlash === 'fwd' ? 'right-10' : 'left-10'} flex flex-col items-center gap-1 animate-ping-once`}>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-black">{tapFlash === 'fwd' ? '▶▶' : '◀◀'}</span>
                </div>
                <span className="text-white text-xs font-black bg-black/40 rounded-full px-2 py-0.5">
                  {tapFlash === 'fwd' ? '+10s' : '-10s'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent pointer-events-none z-10" />

        {shareToast && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/10 pointer-events-none">
            Link copied!
          </div>
        )}

        {/* Mute toggle */}
        <button
          onClick={e => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="absolute top-5 right-5 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 z-30 pointer-events-auto"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Video Info & Controls Overlay */}
        <AnimatePresence>
          {(!commentOpen || isDesktop) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 z-30 flex flex-col pointer-events-none"
            >
              <div className="flex items-end justify-between gap-3 px-5 pb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 font-bold text-xs uppercase tracking-widest truncate mb-0.5">{video.channelTitle}</p>
                  <h3 className="text-white text-base font-bold leading-snug line-clamp-2">{video.title}</h3>
                </div>
                <div className="flex flex-col items-center gap-5 shrink-0 pointer-events-auto">
                  <button onClick={handleLike} className="flex flex-col items-center gap-1">
                    <div className={`p-3 rounded-full transition-all duration-200 ${isLiked ? 'bg-white scale-110' : 'bg-white/10 backdrop-blur-md hover:bg-white/20'}`}>
                      <Heart size={20} className={isLiked ? 'text-red-600 fill-red-600' : 'text-white'} />
                    </div>
                    <span className="text-[11px] font-black text-white drop-shadow">{formatCount(displayLikes)}</span>
                  </button>
                  <button onClick={e => { e.stopPropagation(); setCommentOpen(true); }} className="flex flex-col items-center gap-1">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                    <span className="text-[11px] font-black text-white drop-shadow">{formatCount(displayComments)}</span>
                  </button>
                  <button onClick={handleShare} className="flex flex-col items-center gap-1">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors">
                      <Share2 size={20} className="text-white" />
                    </div>
                    <span className="text-[11px] font-black text-white drop-shadow">Share</span>
                  </button>
                </div>
              </div>

              {/* Scrubber */}
              <div onClick={e => e.stopPropagation()} className="w-full px-4 pb-4 pointer-events-auto">
                <div ref={scrubberRef} className="relative w-full h-5 flex items-center cursor-pointer group/scrub" onMouseDown={onScrubStart} onTouchStart={onScrubStart}>
                  <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-none" style={{ width: `${progress}%` }} />
                  </div>
                  <div className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg -translate-x-1/2 transition-opacity ${isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover/scrub:opacity-100'}`} style={{ left: `${progress}%` }} />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setIsPaused(p => !p)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    {isPaused ? <Play size={18} className="text-white ml-0.5" fill="currentColor" /> : <div className="flex gap-0.5"><div className="w-1.5 h-4 bg-white rounded-sm"/><div className="w-1.5 h-4 bg-white rounded-sm"/></div>}
                  </button>
                  <span className="text-white text-xs font-mono tabular-nums">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Comment Section ── */}
      <AnimatePresence>
        {commentOpen && (
          <>
            {!isDesktop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCommentOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              />
            )}

            <motion.div 
              initial={isDesktop ? { x: '100%' } : { y: '100%' }}
              animate={isDesktop ? { x: 0 } : { y: 0 }}
              exit={isDesktop ? { x: '100%' } : { y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag={isDesktop ? false : "y"}
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => { if (info.offset.y > 150) setCommentOpen(false); }}
              className={`fixed lg:relative z-50 bg-[#0F1117] border-white/10 flex flex-col shadow-2xl ${
                isDesktop ? 'h-full w-[400px] border-l' : 'bottom-0 left-0 right-0 rounded-t-[2.5rem] border-t h-[75vh]'
              }`}
            >
              {!isDesktop && (
                <div className="w-full flex justify-center py-3">
                  <div className="w-10 h-1.5 bg-white/20 rounded-full" />
                </div>
              )}

              <div className="flex items-center justify-between px-6 pb-4 pt-2 border-b border-white/5">
                <h3 className="text-white font-black text-lg">Comments</h3>
                <button onClick={() => setCommentOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>
                ) : comments.length > 0 ? comments.map(c => (
                  <div key={c.id} className="flex gap-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white/10 ring-2 ring-white/5">
                      <Image src={c.authorProfileImage} alt={c.author} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-sm">{c.author}</span>
                        <span className="text-white/40 text-xs">{formatCount(c.likeCount)} likes</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-white/20">
                    <MessageCircle size={40} className="mb-2 opacity-30" />
                    <p className="text-sm">No comments yet. Be first!</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#161922] border-t border-white/5 pb-10 lg:pb-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="flex-1 bg-white/5 text-white rounded-full px-5 py-3 outline-none focus:ring-2 ring-white/20 text-sm border border-white/10"
                  />
                  <button
                    onClick={async () => {
                      const text = newComment.trim();
                      if (!text) return;
                      setNewComment('');
                      // Optimistic update — show comment immediately in UI
                      if (addComment) {
                        addComment({
                          id: `local-${Date.now()}`,
                          author: 'You',
                          authorProfileImage: '/default-avatar.png',
                          text,
                          likeCount: '0',
                          publishedAt: new Date().toISOString()
                        });
                      }
                      try {
                        await youtubeApi.commentOnVideo(video.id, text, videoOrigin);
                      } catch (err) {
                        console.error('Comment failed:', err);
                      }
                    }}
                    disabled={!newComment.trim()}
                    className="bg-blue-600 text-white p-3 rounded-full font-bold hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-blue-600/20"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Dashboard Content ───────────────────────────────────────────────────────────
function SawaFlixContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isMuted, setIsMuted]               = useState(true);
  const [activeVideoId, setActiveVideoId]   = useState(null);
  const [heroIndex, setHeroIndex]           = useState(0);
  const [heroPlaying, setHeroPlaying]       = useState(false);
  const [isHeroMuted, setIsHeroMuted]       = useState(true);
  const [selectedVideo, setSelectedVideo]   = useState(null);



  const observerRef  = useRef(null);
  const videoRefs    = useRef(new Map());
  const discoverRef  = useRef(null);

  const router       = useRouter();
  const searchParams = useSearchParams();
  const urlQuery     = searchParams.get('q') || '';

  const currentCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
  const fetchQuery = urlQuery || currentCategoryObj?.query || CATEGORIES[0].query;

  const { videos, loading, error, loadMore, hasMore } = useVideos(fetchQuery);

  const heroSource       = videos.length > 0 ? videos.slice(0, 5) : [];
  const currentHeroVideo = heroSource[heroIndex % Math.max(heroSource.length, 1)];

  useEffect(() => {
    if (urlQuery) {
      const t = setTimeout(() => {
        if (discoverRef.current) {
          const top = discoverRef.current.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 250);
      return () => clearTimeout(t);
    }
  }, [urlQuery]);

  useEffect(() => { setSelectedVideo(null); }, [urlQuery]);

  useEffect(() => {
    if (!videos.length) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute('data-video-id');
          if (id) setActiveVideoId(id);
          
          // Infinite Scroll: If this is the last video, load more!
          if (id === videos[videos.length - 1]?.id && hasMore) {
             loadMore();
          }
        }
      }),
      { threshold: 0.6 }
    );
    videoRefs.current.forEach(el => { if (el) observerRef.current.observe(el); });
    return () => observerRef.current?.disconnect();
  }, [videos, hasMore, loadMore]);

  const handleHeroNext = useCallback(() => {
    if (!heroSource.length) return;
    setHeroIndex(prev => (prev + 1) % heroSource.length);
  }, [heroSource.length]);
  const handleHeroPrev = useCallback(() => {
    setHeroIndex(prev => (prev === 0 ? Math.max(heroSource.length - 1, 0) : prev - 1));
  }, [heroSource.length]);

  useEffect(() => {
    if (!heroPlaying || !heroSource.length) return;
    const t = setInterval(handleHeroNext, 25000);
    return () => clearInterval(t);
  }, [heroPlaying, handleHeroNext, heroSource.length]);

  const scrollToDiscover = () => {
    setHeroPlaying(false);
    if (discoverRef.current) {
      discoverRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardClick = (video) => {
    setSelectedVideo(video);
    setActiveVideoId(video.id);
    setTimeout(() => {
      if (discoverRef.current) {
        const top = discoverRef.current.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 80);
  };

  const isSearchMode = !!urlQuery;

  const feedVideos = (() => {
    if (!isSearchMode || !selectedVideo) return videos;
    const rest = videos.filter(v => v.id !== selectedVideo.id);
    return [selectedVideo, ...rest];
  })();

  return (
    <div className="flex flex-col relative">
      {/* YouTube-style Top Loading Bar */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: [0, 0.4, 0.7, 0.9, 1], opacity: 1 }}
            transition={{ 
              duration: 2, 
              times: [0, 0.2, 0.5, 0.8, 1],
              ease: "easeInOut",
              repeat: Infinity
            }}
            className="fixed top-0 left-0 right-0 h-[3px] bg-red-600 z-[9999] origin-left shadow-[0_0_15px_rgba(220,38,38,0.6)]"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 p-2 sm:p-6 lg:p-8 pt-0 sm:pt-2">
        <div className="sticky top-0 z-40 bg-[#0B0E14] py-3 mb-3 flex items-center justify-start overflow-x-auto no-scrollbar border-b border-white/5">
          <div className="inline-flex items-center gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setHeroIndex(0); setSelectedVideo(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <section className="relative h-[85vh] sm:h-[75vh] lg:h-[80vh] rounded-[2.5rem] overflow-hidden mb-10 group shadow-2xl border border-white/5 bg-black">
          {currentHeroVideo && (
            <>
              <div className="absolute top-5 left-5 z-30 max-w-[55%] pointer-events-none">
                <p className="text-white/90 text-sm font-bold leading-snug line-clamp-2 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-1.5">
                  {currentHeroVideo?.title}
                </p>
              </div>
              {/* Permanent Base Background (Matches Landing Page) */}
              {/* Permanent Base Background (Matches Landing Page) */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src="/cameroon.jpg"
                  alt="SawaFlix Background"
                  className="w-full h-full object-cover transition-opacity duration-700"
                  loading="eager"
                  fetchPriority="high"
                />
                {/* Brand Overlay (Matches Landing Page opacity) */}
                <div className="absolute inset-0 bg-black/70" />
              </div>

              {/* Dynamic Video Thumbnail Overlay */}
              {currentHeroVideo?.thumbnail && currentHeroVideo.thumbnail.length > 5 && (
                <div className="absolute inset-0 z-[1]">
                  <Image
                    src={currentHeroVideo.thumbnail}
                    alt={currentHeroVideo.title}
                    fill
                    className="object-cover opacity-50 scale-100 transition-opacity duration-1000"
                    unoptimized
                  />
                </div>
              )}
              {heroPlaying && (
                <div className="absolute inset-0 z-10">
                  {currentHeroVideo?.origin === 'youtube' ? (
                    <YouTubePlayer
                      videoId={currentHeroVideo.id}
                      isActive={heroPlaying}
                      isMuted={isHeroMuted}
                      onPlayerReady={p => { if (heroPlaying) p.playVideo(); }}
                    />
                  ) : (
                    <HTML5Player
                      videoId={currentHeroVideo.id}
                      videoUrl={currentHeroVideo.videoUrl}
                      isActive={heroPlaying}
                      isMuted={isHeroMuted}
                      onPlayerReady={p => { if (heroPlaying) p.playVideo(); }}
                    />
                  )}
                </div>
              )}
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-black/20 to-transparent pointer-events-none z-10" />

          {!heroPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <button
                onClick={scrollToDiscover}
                className="group/play cursor-pointer z-40 flex items-center gap-4 px-10 py-5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl"
              >
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 transition-transform duration-500 group-hover/play:rotate-[360deg]">
                  <Image
                    src="/sawaplay.png"
                    alt="Play"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white text-xl sm:text-3xl font-black uppercase tracking-[0.1em] leading-tight">
                    Play Now
                  </span>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-0.5">
                    Stream the latest vibes
                  </span>
                </div>
              </button>
            </div>
          )}



          <button
            onClick={handleHeroPrev}
            className="absolute left-5 top-1/2 -translate-y-1/2 p-3.5 bg-black/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-white/10 z-30"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={handleHeroNext}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-3.5 bg-black/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-white/10 z-30"
          >
            <ChevronRight size={22} />
          </button>

          {heroSource.length > 1 && (
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30">
              {heroSource.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`transition-all duration-500 rounded-full ${
                    heroIndex % heroSource.length === idx
                      ? 'w-8 h-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                      : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        <section id="discover-section" ref={discoverRef} className="mb-12 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
            <div className="flex items-center">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
                {isSearchMode && !selectedVideo
                  ? <div className="flex items-center gap-3">
                      <span className="w-1.5 h-9 bg-red-600 rounded-full" />
                      <>Results for <span className="text-white/60 font-medium">"{urlQuery}"</span></>
                    </div>
                  : isSearchMode && selectedVideo
                  ? <div className="flex items-center gap-3">
                      <span className="w-1.5 h-9 bg-red-600 rounded-full" />
                      <>Watching <span className="text-white/60 font-medium">"{urlQuery}"</span></>
                    </div>
                  : (
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                        <Image src="/sawaplay.png" alt="Sawa" fill className="object-contain" />
                      </div>
                      <span className="text-white font-black text-lg sm:text-[26px] tracking-tight leading-none opacity-90">
                        {currentCategoryObj?.label}
                      </span>
                    </div>
                  )
                }
              </h2>
            </div>

            {isSearchMode && selectedVideo && (
              <button
                onClick={() => setSelectedVideo(null)}
                className="flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 hover:text-white text-xs font-black uppercase tracking-widest border border-white/5 transition-all shadow-lg active:scale-95"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <p className="text-white/30 font-black uppercase tracking-widest text-xs">
                {isSearchMode ? `Searching for "${urlQuery}"…` : 'Loading Latest Vibes…'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-white/5">
              <p className="text-white/60 font-black mb-2 uppercase tracking-widest text-xs">Error</p>
              <p className="text-white/40 text-sm max-w-xs mx-auto">{error}</p>
            </div>
          ) : isSearchMode && !selectedVideo ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map(v => (
                <SearchResultCard key={v.id} video={v} onPlay={handleCardClick} />
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {feedVideos.map(video => (
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
        </section>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes ping-once {
          0%   { transform: scale(0.6); opacity: 1; }
          70%  { transform: scale(1.15); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .animate-ping-once { animation: ping-once 0.7s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default function SawaFlix() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
      </div>
    }>
      <SawaFlixContent />
    </Suspense>
  );
}
