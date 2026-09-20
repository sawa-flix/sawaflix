'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Check } from 'lucide-react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useCommentSidebar } from './CommentSidebarContext';
import { useAuthModal } from '@/contexts/AuthModalContext';

interface InteractorUser {
  id: string;
  name: string;
  avatar: string;
}

interface StoryInteractionBarProps {
  storyId: string;
  storyTitle: string;
  initialLikes: number;
  initialComments: number;
  initialIsLiked?: boolean;
  initialInteractors?: InteractorUser[];
}

const DEFAULT_COMMUNITY_AVATARS: InteractorUser[] = [
  { id: 'comm-1', name: 'Brenda Bih', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 'comm-2', name: 'Ewane Manga', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: 'comm-3', name: 'Nathalie Ngo', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80' },
];

export default function StoryInteractionBar({
  storyId,
  storyTitle,
  initialLikes,
  initialComments,
  initialIsLiked = false,
  initialInteractors = [],
}: StoryInteractionBarProps) {
  const { user, isAuthenticated } = useAuthSession();
  const { openAuthModal } = useAuthModal();

  const [liked, setLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [interactors, setInteractors] = useState<InteractorUser[]>(() => {
    if (initialInteractors && initialInteractors.length > 0) return initialInteractors;
    if (initialLikes > 0) return DEFAULT_COMMUNITY_AVATARS.slice(0, Math.min(initialLikes, 3));
    return [];
  });
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Synchronize state if initialLikes or initialIsLiked changes on props
  useEffect(() => {
    setLiked(initialIsLiked);
    setLikesCount(initialLikes);
    if (initialInteractors && initialInteractors.length > 0) {
      setInteractors(initialInteractors);
    } else if (initialLikes > 0 && interactors.length === 0) {
      setInteractors(DEFAULT_COMMUNITY_AVATARS.slice(0, Math.min(initialLikes, 3)));
    }
  }, [initialLikes, initialIsLiked, initialInteractors]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      openAuthModal('to like this story on Area Tory');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));

    // Optimistic UI update
    setLiked(nextLiked);
    setLikesCount(nextCount);

    // Optimistically update interactors avatar stack with current user
    const currentUserId = user?.id || 'me';
    const currentUserAvatar =
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
    const currentUserName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      'You';

    if (nextLiked) {
      setInteractors((prev) => {
        const filtered = prev.filter((p) => p.id !== currentUserId);
        return [{ id: currentUserId, name: currentUserName, avatar: currentUserAvatar }, ...filtered];
      });
    } else {
      setInteractors((prev) => prev.filter((p) => p.id !== currentUserId));
    }

    try {
      const res = await fetch(`/api/stories/${encodeURIComponent(storyId)}/like`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (typeof data.liked === 'boolean') setLiked(data.liked);
      if (typeof data.likesCount === 'number') setLikesCount(data.likesCount);
    } catch (err) {
      console.error('[StoryInteractionBar] Like failed:', err);
      // Revert optimistic update
      setLiked(!nextLiked);
      setLikesCount(likesCount);
      if (nextLiked) {
        setInteractors((prev) => prev.filter((p) => p.id !== currentUserId));
      }
    } finally {
      setIsLiking(false);
    }
  };

  // Open/toggle comment sidebar via context
  const { toggle, isOpen } = useCommentSidebar();
  const handleOpenComments = () => {
    toggle(storyId, storyTitle, initialComments);
  };

  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({
          title: storyTitle,
          text: `Check out "${storyTitle}" on SawaFlix Area Tory!`,
          url: currentUrl,
        });
      } else {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // User cancelled share sheet
    }
  };

  const displayedInteractors = interactors.slice(0, 3);
  const remainingCount = Math.max(0, likesCount - displayedInteractors.length);

  const interactorTooltip = interactors.length > 0
    ? `Liked by ${interactors.map(u => u.name).join(', ')}${remainingCount > 0 ? ` and ${remainingCount} others` : ''}`
    : 'People who liked and interacted with this story';

  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none flex-wrap">
      {/* Primary Like Group: Button + Overlapping Avatar Stack */}
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleLike}
          className={`group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer shadow-sm ${
            liked
              ? 'bg-red-500/15 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(229,9,20,0.25)] ring-1 ring-red-500/30'
              : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20'
          }`}
          aria-label={liked ? 'Unlike story' : 'Like story'}
          title="Like story"
        >
          <motion.div
            animate={liked ? { scale: [1, 1.35, 0.92, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-center gap-1.5"
          >
            <Image
              src="/logos_and_pwas/like.png"
              alt="Like with Cameroon Flag"
              width={24}
              height={24}
              priority
              className={`w-5 h-5 object-contain transition-transform duration-200 select-none ${
                liked
                  ? 'scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                  : 'opacity-85 group-hover:opacity-100 group-hover:scale-105'
              }`}
            />
          </motion.div>
          <span className="text-xs font-bold font-mono tracking-tight text-white/90">
            {likesCount.toLocaleString()}
          </span>
        </motion.button>

        {/* Overlapping User Avatars beside Like Button */}
        {displayedInteractors.length > 0 && (
          <div
            className="flex items-center -space-x-2 pl-0.5"
            title={interactorTooltip}
          >
            {displayedInteractors.map((interactor, idx) => (
              <div
                key={interactor.id || idx}
                className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full ring-2 ring-[#0B0E14] overflow-hidden bg-zinc-800 transition-transform duration-200 hover:scale-115 hover:z-10 cursor-pointer shadow-md"
              >
                <Image
                  src={interactor.avatar}
                  alt={interactor.name || 'Community Member'}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {remainingCount > 0 && (
              <div
                className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full ring-2 ring-[#0B0E14] bg-zinc-800/90 border border-white/10 text-[9px] font-bold text-gray-300 shadow-md font-mono"
                title={`${remainingCount} more people liked this story`}
              >
                +{remainingCount > 99 ? '99+' : remainingCount}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Jump to Comments Button (Opens Reels-style comments panel) */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleOpenComments}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer shadow-sm ${
          isOpen
            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
            : 'border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20'
        }`}
        aria-label={isOpen ? 'Close comments panel' : 'View comments'}
        title={isOpen ? 'Close comments panel' : 'Open comments panel'}
      >
        <MessageCircle className={`w-4 h-4 ${isOpen ? 'text-black' : 'text-gray-400 group-hover:text-white'}`} />
        <span className={`text-xs font-bold font-mono tracking-tight ${isOpen ? 'text-black font-extrabold' : 'text-white/90'}`}>
          {initialComments.toLocaleString()}
        </span>
      </motion.button>

      {/* Native / Clipboard Share Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleShare}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer shadow-sm"
        title="Share this story"
        aria-label="Share story"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">Copied!</span>
          </>
        ) : (
          <Share2 className="w-4 h-4 text-gray-400 hover:text-white" />
        )}
      </motion.button>
    </div>
  );
}

