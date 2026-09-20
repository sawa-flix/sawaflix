'use client';

import type { ComponentType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Inbox } from 'lucide-react';
import type { MediaGridItem } from '@/types/profile';

export type MediaGridVariant = 'poster' | 'list' | 'card';

interface ProfileMediaGridProps {
  /** poster = Netflix-style poster grid, list = Spotify-style rows, card = square card grid (playlists). */
  variant: MediaGridVariant;
  items: MediaGridItem[];
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: ComponentType<{ size?: number; className?: string }>;
}

function EmptyState({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Icon size={24} className="text-white/40" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export function ProfileMediaGrid({ variant, items, emptyTitle, emptyDescription, emptyIcon }: ProfileMediaGridProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} Icon={emptyIcon ?? Inbox} />;
  }

  if (variant === 'list') {
    return (
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href ?? '#'}
            className="group flex items-center gap-3 py-3 transition-colors hover:bg-white/5"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
              {item.thumbnail && <Image src={item.thumbnail} alt={item.title} fill unoptimized className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{item.title}</p>
              {item.subtitle && <p className="truncate text-xs text-gray-500">{item.subtitle}</p>}
            </div>
            <Play size={16} className="shrink-0 text-white/0 transition-colors group-hover:text-white/60" />
          </Link>
        ))}
      </div>
    );
  }

  const gridClass =
    variant === 'poster'
      ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
      : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4';

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href ?? '#'}
          className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#0E121A] transition-colors hover:border-white/20"
        >
          <div className={`relative w-full ${variant === 'poster' ? 'aspect-[2/3]' : 'aspect-square'}`}>
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-white/5" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="line-clamp-2 text-xs font-bold text-white">{item.title}</p>
              {item.subtitle && <p className="mt-0.5 truncate text-[11px] text-white/60">{item.subtitle}</p>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
