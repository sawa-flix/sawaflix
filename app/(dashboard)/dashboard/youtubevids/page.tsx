'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Volume2, VolumeX, MessageCircle,
  Send, X, Check, Loader2, ThumbsUp, ThumbsDown,
  Share2, ArrowLeft, Menu
} from 'lucide-react';
import { useVideos } from '@/hooks/useVideos';
import { useVideoStats } from '@/hooks/useVideoStats';
import { useComments } from '@/hooks/useComments';
import { YouTubePlayer } from '../../../../components/YoutubePlayer';
import { formatCount } from '@/utils/formatCount';


//types
const CATEGORIES = [
  { id: "all", label: "All 237", query: "Cameroon content latest" },
  { id: "music", label: "Music", query: "Cameroon music hits latest" },
  { id: "comedy", label: "Comedy", query: "Cameroun comedie latest" },
  { id: "news", label: "News", query: "Cameroon news latest" },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

interface VideoProgress {
  progress: number;
  timeLeft: string;
}
export default function CameroonReelsPage() {
  // UI State
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [followedChannels, setFollowedChannels] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [progressMap, setProgressMap] = useState<Map<string, VideoProgress>>(new Map());
  
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q');
  const [currentQuery, setCurrentQuery] = useState<string>(CATEGORIES[0].query);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const videoContainerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  const { videos, loading, error, hasMore, isRefreshing, refresh } =
    useVideos(currentQuery);

  const { stats: activeStats } = useVideoStats(activeVideoId);

  const {
    comments,
    loading: commentsLoading,
    isOpen: isCommentOpen,
    setIsOpen: setIsCommentOpen,
  } = useComments(activeVideoId);

  useEffect(() => {
    const storedLikes = localStorage.getItem('likedVideos');
    const storedFollows = localStorage.getItem('followedChannels');
    if (storedLikes) setLikedVideos(JSON.parse(storedLikes));
    if (storedFollows) setFollowedChannels(JSON.parse(storedFollows));
  }, []);

  useEffect(() => {
    localStorage.setItem('likedVideos', JSON.stringify(likedVideos));
  }, [likedVideos]);

  useEffect(() => {
    localStorage.setItem('followedChannels', JSON.stringify(followedChannels));
  }, [followedChannels]);


  const handleLike = useCallback((videoId: string) => {
    if (likedVideos.includes(videoId)) return;
    setLikedVideos(prev => [...prev, videoId]);
  }, [likedVideos]);

  const handleFollow = useCallback((channelId: string) => {
    if (followedChannels.includes(channelId)) return;
    setFollowedChannels(prev => [...prev, channelId]);
  }, [followedChannels]);

  const handleSubmitComment = useCallback(() => {
    if (!newComment.trim()) return;
    console.log('[Comment] Submitting for video', activeVideoId, ':', newComment);
    setNewComment("");
  }, [newComment, activeVideoId]);

  const handleProgress = useCallback((videoId: string, progress: number, timeLeft: string) => {
    setProgressMap(prev => {
      const next = new Map(prev);
      next.set(videoId, { progress, timeLeft });
      return next;
    });
  }, []);

  const handleCategorySelect = useCallback((id: CategoryId) => {
    try {
      const cat = CATEGORIES.find(c => c.id === id);
      if (cat) {
        setActiveCategory(id);
        setCurrentQuery(cat.query);
        setMenuOpen(false);
      }
    } catch (err) {
      console.error('[Dashboard] Error selecting category:', err);
    }
  }, []);

  // Handle URL search query
  useEffect(() => {
    try {
      if (urlQuery) {
        console.log('[Dashboard] Search query detected:', urlQuery);
        setActiveCategory("all" as any); // Reset category visual
        setCurrentQuery(urlQuery);
      }
    } catch (err) {
      console.error('[Dashboard] Error handling URL query:', err);
    }
  }, [urlQuery]);

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
      { threshold: 0.6, rootMargin: '0px' }
    );

    videoContainerRefs.current.forEach(container => {
      if (container) observerRef.current?.observe(container);
    });

    return () => observerRef.current?.disconnect();
  }, [videos]);

  const registerVideoContainer = useCallback((videoId: string, element: HTMLDivElement | null) => {
    if (element) {
      videoContainerRefs.current.set(videoId, element);
    } else {
      videoContainerRefs.current.delete(videoId);
    }
  }, []);

  //Error State

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center px-4">
          <p className="text-red-500 text-xl mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 rounded-full font-semibold hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-3 bg-linear-to-b from-black/80 to-transparent">
        <button
          className="p-1.5 text-white"
          aria-label="Go back"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={22} />
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button
            className="p-1.5 text-white"
            aria-label="Menu"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="absolute inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-14 right-4 z-50 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl w-44 animate-in fade-in slide-in-from-top-2 duration-200">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors ${activeCategory === cat.id
                  ? 'bg-red-600 text-white'
                  : 'text-white/80 hover:bg-white/10'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Video Feed ── */}
      <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {videos.map((video, index) => {
          const isActive = activeVideoId === video.id;
          const isLiked = likedVideos.includes(video.id);
          const isFollowed = followedChannels.includes(video.channelId);
          const videoProgress = progressMap.get(video.id) ?? { progress: 0, timeLeft: "0:00" };

          const likeCount = isActive && activeStats ? activeStats.likeCount : video.likeCount;
          const commentCount = isActive && activeStats ? activeStats.commentCount : video.commentCount;

          return (
            <div
              key={video.id}
              ref={(el) => registerVideoContainer(video.id, el)}
              data-video-id={video.id}
              className="video-container h-screen w-full snap-start relative bg-black"
            >
              {/* YouTube Player */}
              <YouTubePlayer
                videoId={video.id}
                isActive={isActive}
                isMuted={isMuted}
                onProgress={(progress, timeLeft) => handleProgress(video.id, progress, timeLeft)}
              />

              {/* Loading Overlay (first video refresh) */}
              {index === 0 && isRefreshing && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                  <Loader2 className="animate-spin text-red-600" size={48} />
                </div>
              )}

              {/* Progress Bar */}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full z-40">
                  <div className="h-[3px] w-full bg-white/20">
                    <div
                      className="h-full bg-red-600 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                      style={{ width: `${videoProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ── Right-side Action Buttons (YouTube-style, bottom-right) ── */}
              <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-30">

                {/* Like */}
                <button
                  onClick={() => handleLike(video.id)}
                  className="flex flex-col items-center gap-1 group"
                  aria-label="Like"
                >
                  <ThumbsUp
                    size={26}
                    className={`transition-all duration-200 drop-shadow-md ${isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-white'
                      }`}
                  />
                  <span className="text-white text-[11px] font-bold drop-shadow-md">
                    {formatCount(likeCount)}
                  </span>
                </button>

                {/* Dislike */}
                <button
                  className="flex flex-col items-center gap-1"
                  aria-label="Dislike"
                >
                  <ThumbsDown size={26} className="text-white drop-shadow-md" />
                  <span className="text-white text-[11px] font-bold drop-shadow-md">Dislike</span>
                </button>

                {/* Comments */}
                <button
                  onClick={() => setIsCommentOpen(true)}
                  className="flex flex-col items-center gap-1"
                  aria-label="Comments"
                >
                  <MessageCircle size={26} className="text-white drop-shadow-md" />
                  <span className="text-white text-[11px] font-bold drop-shadow-md">
                    {formatCount(commentCount)}
                  </span>
                </button>

                {/* Share */}
                <button
                  className="flex flex-col items-center gap-1"
                  aria-label="Share"
                >
                  <Share2 size={26} className="text-white drop-shadow-md" />
                  <span className="text-white text-[11px] font-bold drop-shadow-md">Share</span>
                </button>

                {/* Channel thumbnail / follow */}
                <button
                  onClick={() => handleFollow(video.channelId)}
                  className="flex flex-col items-center gap-1"
                  aria-label={isFollowed ? "Following" : "Follow"}
                >
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-black text-white shadow-lg overflow-hidden transition-all ${isFollowed ? 'border-zinc-500 bg-zinc-700' : 'border-red-500 bg-red-600'
                    }`}>
                    {isFollowed ? <Check size={18} /> : '237'}
                  </div>
                </button>
              </div>

              {/* Mute / Unmute */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-16 right-4 z-30 bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/60 transition"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              {/* Video Info Overlay (bottom-left, YouTube-style) */}
              <div className="absolute bottom-35 left-3 z-20 max-w-[72%]">
                {/* Channel row */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shrink-0">
                    237
                  </div>
                  <p className="text-white font-bold text-sm drop-shadow-md truncate">
                    @{video.channelTitle}
                  </p>
                  <span className="text-white/60 text-[10px] font-semibold border border-white/30 rounded px-1.5 py-0.5 shrink-0">
                    Subscribe
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-white/90 text-sm line-clamp-2 leading-relaxed drop-shadow-md">
                  {video.title}
                </h2>

                {/* Time left */}
                {isActive && (
                  <p className="text-white/40 text-[10px] mt-1 font-mono">
                    {videoProgress.timeLeft}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {loading && !isRefreshing && (
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-sm font-medium animate-pulse">Loading more 237 vibes...</p>
          </div>
        )}

        {/* End of content */}
        {!hasMore && videos.length > 0 && !loading && (
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white/50 gap-2">
            <p className="text-sm">You have seen it all! 🎉</p>
            <p className="text-xs">Check back later for more content</p>
          </div>
        )}
      </div>

      {/* Comment Drawer */}
      {isCommentOpen && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="grow" onClick={() => setIsCommentOpen(false)} />
          <div className="bg-zinc-900 w-full rounded-t-[2.5rem] p-6 h-[70vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-extrabold text-xl">Comments</h3>
              <button
                onClick={() => setIsCommentOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X size={28} />
              </button>
            </div>

            {commentsLoading ? (
              <div className="grow flex flex-col items-center justify-center text-zinc-500 gap-3">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="grow overflow-y-auto space-y-4 mb-4 pr-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-zinc-800">
                      <Image
                        src={comment.authorProfileImage}
                        alt={comment.author}
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized={comment.authorProfileImage.includes('googleusercontent.com')}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{comment.author}</span>
                        <span className="text-zinc-500 text-xs">{formatCount(comment.likeCount)} likes</span>
                      </div>
                      <p className="text-white/80 text-sm mt-1 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grow flex flex-col items-center justify-center text-zinc-500 gap-3">
                <MessageCircle size={48} className="opacity-20" />
                <p className="text-sm italic">No comments yet</p>
                <p className="text-xs">Be the first to comment!</p>
              </div>
            )}

            <div className="flex gap-3 border-t border-zinc-800 pt-5">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                placeholder="Share your thoughts..."
                className="bg-zinc-800 text-white rounded-2xl px-5 py-3 grow outline-none focus:ring-2 ring-red-600 transition-all text-sm"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="bg-red-600 text-white px-6 rounded-2xl font-bold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}