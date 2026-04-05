'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Heart, MessageCircle, UserPlus, Send, X, Check, Loader2 } from 'lucide-react';
import { useVideos } from '@/hooks/useVideos';
import { useVideoStats } from '@/hooks/useVideoStats';
import { useComments } from '@/hooks/useComments';
import { YouTubePlayer } from '../../../../components/YoutubePlayer';
import { formatCount } from '@/utils/formatCount';

const CATEGORIES = [
  { id: "all", label: "All 237", query: "Cameroon content latest" },
  { id: "music", label: "Music", query: "Cameroon music hits latest" },
  { id: "comedy", label: "Comedy", query: "Cameroun comedie latest" },
  { id: "news", label: "News", query: "Cameroon news latest" },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

export default function CameroonReelsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [followedChannels, setFollowedChannels] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [progressMap, setProgressMap] = useState<Map<string, { progress: number; timeLeft: string }>>(new Map());

  const observerRef = useRef<IntersectionObserver | null>(null);
  const videoContainerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  const { videos, loading, error, hasMore, isRefreshing } = useVideos(currentCategory?.query || "Cameroon music");
  const { stats: activeStats } = useVideoStats(activeVideoId);
  const { comments, loading: commentsLoading, isOpen: isCommentOpen, setIsOpen: setIsCommentOpen } = useComments(activeVideoId);

  useEffect(() => {
    const storedLikes = localStorage.getItem('likedVideos');
    const storedFollows = localStorage.getItem('followedChannels');
    if (storedLikes) setLikedVideos(JSON.parse(storedLikes));
    if (storedFollows) setFollowedChannels(JSON.parse(storedFollows));
  }, []);

  useEffect(() => { localStorage.setItem('likedVideos', JSON.stringify(likedVideos)); }, [likedVideos]);
  useEffect(() => { localStorage.setItem('followedChannels', JSON.stringify(followedChannels)); }, [followedChannels]);

  // Like: toggled on/off
  const handleLike = useCallback((videoId: string) => {
    setLikedVideos(prev =>
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  }, []);

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
      const newMap = new Map(prev);
      newMap.set(videoId, { progress, timeLeft });
      return newMap;
    });
  }, []);

  useEffect(() => {
    if (!videos.length) return;
    if (observerRef.current) observerRef.current.disconnect();
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
    videoContainerRefs.current.forEach((container) => {
      if (container) observerRef.current?.observe(container);
    });
    return () => observerRef.current?.disconnect();
  }, [videos]);

  const registerVideoContainer = useCallback((videoId: string, element: HTMLDivElement | null) => {
    if (element) videoContainerRefs.current.set(videoId, element);
    else videoContainerRefs.current.delete(videoId);
  }, []);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center px-6 space-y-4">
          <p className="text-red-400 text-base font-light">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-full text-sm font-semibold tracking-wide"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-zinc-950 overflow-hidden relative">

      {/* ── Category bar ───────────────────────────── */}
      <div className="absolute top-0 left-0 w-full z-50 flex gap-2 px-4 pt-12 pb-4 overflow-x-auto no-scrollbar bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase whitespace-nowrap
              border transition-all duration-200
              ${activeCategory === cat.id
                ? "bg-red-600 border-red-500 text-white shadow-[0_0_18px_rgba(220,38,38,0.5)]"
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70"
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Video feed ─────────────────────────────── */}
      <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {videos.map((video, index) => {
          const isActive = activeVideoId === video.id;
          const isLiked = likedVideos.includes(video.id);
          const isFollowed = followedChannels.includes(video.channelId);
          const videoProgress = progressMap.get(video.id) || { progress: 0, timeLeft: "0:00" };
          const likeCount = isActive && activeStats ? activeStats.likeCount : video.likeCount;
          const commentCount = isActive && activeStats ? activeStats.commentCount : video.commentCount;

          return (
            <div
              key={video.id}
              ref={(el) => registerVideoContainer(video.id, el)}
              data-video-id={video.id}
              className="h-screen w-full snap-start relative bg-black overflow-hidden"
            >
              {/* Player */}
              <YouTubePlayer
                videoId={video.id}
                isActive={isActive}
                isMuted={isMuted}
                onProgress={(progress, timeLeft) => handleProgress(video.id, progress, timeLeft)}
              />

              {/* Refreshing overlay */}
              {index === 0 && isRefreshing && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Loader2 className="animate-spin text-red-500" size={44} />
                </div>
              )}

              {/* Top gradient */}
              <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />

              {/* Progress bar */}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full z-40 h-[2px] bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-amber-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${videoProgress.progress}%` }}
                  />
                </div>
              )}

              {/* ── Right action bar ── */}
              <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-5">

                {/* Like */}
                <button
                  onClick={() => handleLike(video.id)}
                  className="flex flex-col items-center gap-1.5 group"
                  aria-label="Like"
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200
                    ${isLiked
                      ? "bg-red-600 border-red-500 shadow-[0_0_22px_rgba(220,38,38,0.65)] scale-110"
                      : "bg-black/30 border-white/10 backdrop-blur-md group-hover:bg-white/10"
                    }
                  `}>
                    <Heart
                      size={22}
                      strokeWidth={isLiked ? 0 : 1.75}
                      className={`transition-all duration-200 ${isLiked ? "fill-white text-white" : "text-white"}`}
                    />
                  </div>
                  <span className="text-white/70 text-[10px] font-semibold tracking-wide">
                    {formatCount(likeCount)}
                  </span>
                </button>

                {/* Comment */}
                <button
                  onClick={() => setIsCommentOpen(true)}
                  className="flex flex-col items-center gap-1.5 group"
                  aria-label="Comments"
                >
                  <div className="w-12 h-12 rounded-full bg-black/30 border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <MessageCircle size={22} strokeWidth={1.75} className="text-white" />
                  </div>
                  <span className="text-white/70 text-[10px] font-semibold tracking-wide">
                    {formatCount(commentCount)}
                  </span>
                </button>

                {/* Follow */}
                <button
                  onClick={() => handleFollow(video.channelId)}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-90
                    ${isFollowed
                      ? "bg-zinc-800 border-white/10"
                      : "bg-red-600 border-red-500 shadow-[0_0_16px_rgba(220,38,38,0.45)] hover:bg-red-500"
                    }
                  `}
                  aria-label={isFollowed ? "Following" : "Follow"}
                >
                  {isFollowed
                    ? <Check size={20} strokeWidth={2.5} className="text-white/60" />
                    : <UserPlus size={20} strokeWidth={1.75} className="text-white" />
                  }
                </button>
              </div>

              {/* ── Video info ── */}
              <div className="absolute bottom-7 left-4 z-20 max-w-[74%] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-600 border border-red-400/30 flex items-center justify-center text-[9px] font-black text-white shrink-0">
                    237
                  </div>
                  <span className="text-white text-[13px] font-semibold tracking-tight drop-shadow">
                    @{video.channelTitle}
                  </span>
                </div>
                <p className="text-white/75 text-[12px] font-light leading-relaxed line-clamp-2 drop-shadow">
                  {video.title}
                </p>
                {isActive && (
                  <p className="text-white/30 text-[10px] font-mono tracking-widest">
                    {videoProgress.timeLeft} left
                  </p>
                )}
              </div>

              {/* Mute */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-[106px] right-4 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          );
        })}

        {/* Loading */}
        {loading && !isRefreshing && (
          <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
            <Loader2 className="animate-spin text-red-600" size={36} />
            <p className="text-[10px] text-white/30 font-medium tracking-[0.2em] uppercase animate-pulse">
              Loading 237 vibes…
            </p>
          </div>
        )}

        {/* End of feed */}
        {!hasMore && videos.length > 0 && !loading && (
          <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-1.5">
            <p className="text-white/25 text-sm">You've seen it all 🎉</p>
            <p className="text-white/15 text-[11px]">Check back later for more content</p>
          </div>
        )}
      </div>

      {/* ── Comment drawer ─────────────────────────── */}
      {isCommentOpen && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/70 backdrop-blur-sm">
          <div className="grow" onClick={() => setIsCommentOpen(false)} />
          <div className="bg-zinc-900 w-full rounded-t-3xl h-[70vh] flex flex-col border-t border-white/[0.06] shadow-2xl">

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-8 h-[3px] rounded-full bg-white/15" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center px-5 py-3 border-b border-white/[0.06] shrink-0">
              <h3 className="text-white text-[15px] font-bold tracking-tight">Comments</h3>
              <button
                onClick={() => setIsCommentOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.07] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Comments */}
            {commentsLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/25">
                <Loader2 className="animate-spin" size={28} />
                <p className="text-xs tracking-widest uppercase">Loading…</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 no-scrollbar">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-zinc-800 ring-1 ring-white/[0.07]">
                      <Image
                        src={comment.authorProfileImage}
                        alt={comment.author}
                        fill
                        className="object-cover"
                        sizes="32px"
                        unoptimized={comment.authorProfileImage.includes('googleusercontent.com')}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[12px] font-semibold">{comment.author}</span>
                        <span className="text-white/25 text-[10px]">{formatCount(comment.likeCount)} likes</span>
                      </div>
                      <p className="text-white/65 text-[12px] mt-0.5 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-white/20">
                <MessageCircle size={38} strokeWidth={1} />
                <p className="text-sm">No comments yet</p>
                <p className="text-[11px] text-white/10">Be the first to comment</p>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2.5 px-4 pt-3 pb-7 border-t border-white/[0.06] shrink-0">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                placeholder="Share your thoughts…"
                className="flex-1 bg-zinc-800 text-white text-[13px] rounded-full px-4 py-2.5 outline-none border border-white/[0.07] focus:border-red-600/50 transition-colors placeholder:text-white/20"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shrink-0 hover:bg-red-500 active:scale-95 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}