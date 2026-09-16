'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';
import { urlFor } from '@/lib/sanity/client';
import { formatCount } from '@/utils/formatCount';

export interface StoryItem {
  _id: string;
  title: string;
  slug?: { current: string };
  excerpt?: string;
  mainImage?: any;
  publishedAt?: string;
  readTime?: string;
  featured?: boolean;
  likes?: number;
  comments?: number;
  views?: number;
  category?: {
    _id?: string;
    title?: string;
    slug?: { current: string };
    color?: string;
  };
  author?: {
    _id?: string;
    name?: string;
    avatar?: any;
    role?: string;
  };
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb852ba3?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
];

interface StoryCardProps {
  story: StoryItem;
  index?: number;
  stats?: { likesCount?: number; commentsCount?: number; viewsCount?: number };
}

export default function StoryCard({ story, index = 0, stats }: StoryCardProps) {
  const [imgError, setImgError] = useState(false);

  // Determine image URL
  const getCardImage = (): string => {
    if (!imgError && story.mainImage?.asset) {
      try {
        const url = urlFor(story.mainImage).width(720).height(450).fit('crop').url();
        if (url) return url;
      } catch {
        // fallback
      }
    }
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  // Format relative date or display "Recently"
  const getDisplayDate = (dateStr?: string): string => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) return 'Recently';
      if (diffDays <= 30) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const likes = stats?.likesCount ?? story.likes ?? 0;
  const comments = stats?.commentsCount ?? story.comments ?? 0;
  const views = stats?.viewsCount ?? story.views ?? 0;
  const slugTarget = story.slug?.current || story._id;

  return (
    <Link
      href={`/dashboard/blogs/${slugTarget}`}
      className="group relative flex-shrink-0 w-[270px] sm:w-[300px] md:w-[320px] bg-[#12141C] hover:bg-[#161924] border border-white/5 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl flex flex-col snap-start cursor-pointer select-none"
    >
      {/* Thumbnail Area */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-zinc-900">
        <img
          src={getCardImage()}
          alt={story.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Subtle Dark Vignette at bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-transparent to-black/30 pointer-events-none" />

        {/* Top-Left: Story Pill Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-zinc-300 rounded-md border border-white/10">
            {story.category?.title || 'Story'}
          </span>
        </div>

        {/* Top-Right: Read Time Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 text-[10px] font-medium bg-black/60 backdrop-blur-md text-zinc-300 rounded-md border border-white/10">
            {story.readTime || '3 min'}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-sm sm:text-[15px] font-bold text-white leading-snug line-clamp-2 group-hover:text-red-500 transition-colors mb-2">
            {story.title}
          </h3>

          {/* Published relative time */}
          <p className="text-[11px] text-zinc-500 font-medium mb-3">
            {getDisplayDate(story.publishedAt)}
          </p>
        </div>

        {/* Bottom Reaction & Views Bar */}
        <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-zinc-400 text-xs font-medium">
          {/* Reactions */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-white transition-colors" title="Reactions">
              <span className="text-xs">🇨🇲</span>
              <span className="font-mono text-[11px] text-zinc-300 font-semibold">{formatCount(likes)}</span>
            </span>

            <span className="flex items-center gap-1 hover:text-white transition-colors" title="Comments">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-mono text-[11px] text-zinc-400 font-semibold">{formatCount(comments)}</span>
            </span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1 text-zinc-500" title="Views">
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-mono text-[11px] font-semibold text-zinc-400">{formatCount(views)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
