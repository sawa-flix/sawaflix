'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

interface ViewerPresence {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

interface MovieViewerPresenceProps {
  movieId: string;
  mode: 'track' | 'display' | 'track-display';
  active?: boolean;
}

export function MovieViewerPresence({ movieId, mode, active = true }: MovieViewerPresenceProps) {
  const [viewers, setViewers] = useState<ViewerPresence[]>([]);

  useEffect(() => {
    if (!movieId || (mode !== 'display' && !active)) {
      setViewers([]);
      return;
    }

    const supabase = createClient();
    let disposed = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const updateViewers = () => {
      if (!channel || disposed) return;
      const state = channel.presenceState<ViewerPresence>();
      const uniqueViewers = new Map<string, ViewerPresence>();
      Object.values(state).flat().forEach((viewer) => {
        if (viewer.userId) uniqueViewers.set(viewer.userId, viewer);
      });
      setViewers(Array.from(uniqueViewers.values()));
    };

    const connect = async () => {
      let viewer: ViewerPresence | null = null;
      let presenceKey = `guest-${crypto.randomUUID()}`;

      if (mode !== 'display') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || disposed) return;

        const { data: profile } = await supabase
          .from('users')
          .select('username, profile_image_url, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        const metadata = user.user_metadata || {};
        viewer = {
          userId: user.id,
          name: profile?.username || metadata.full_name || metadata.name || 'SawaFlix member',
          avatarUrl: profile?.profile_image_url || profile?.avatar_url || metadata.avatar_url || metadata.picture || null,
        };
        presenceKey = `${user.id}:${crypto.randomUUID()}`;
      }

      if (disposed) return;
      channel = supabase.channel(`movie-viewers:${movieId}`, { config: { presence: { key: presenceKey } } });
      channel.on('presence', { event: 'sync' }, updateViewers);
      channel.on('presence', { event: 'join' }, updateViewers);
      channel.on('presence', { event: 'leave' }, updateViewers);
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && viewer && mode !== 'display') {
          await channel?.track(viewer);
          updateViewers();
        }
      });
    };

    void connect();

    return () => {
      disposed = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [active, mode, movieId]);

  if (mode === 'track' || viewers.length === 0) return null;

  const visibleViewers = viewers.slice(0, 3);
  const names = visibleViewers.map((viewer) => viewer.name);
  const namedViewers = names.length > 1
    ? `${names.slice(0, 2).join(', ')}${names.length > 2 ? `, ${names[2]}` : ''}`
    : names[0];
  const otherCount = Math.max(0, viewers.length - visibleViewers.length);

  return (
    <div className="mt-1 flex min-w-0 items-center gap-2" aria-label={`${viewers.length} people watching this movie`}>
      <div className="flex shrink-0 -space-x-2" aria-hidden="true">
        {visibleViewers.map((viewer) => (
          <span key={viewer.userId} title={viewer.name} className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-[color:var(--surface)] bg-[color:var(--surface-hover)] text-[9px] font-bold text-[color:var(--foreground)]">
            {viewer.avatarUrl ? (
              <Image src={viewer.avatarUrl} alt="" fill sizes="24px" unoptimized className="object-cover" />
            ) : (
              viewer.name.slice(0, 1).toUpperCase()
            )}
          </span>
        ))}
      </div>
      <p className="min-w-0 truncate text-[10px] leading-tight text-[color:var(--muted-foreground)]">
        <span className="font-semibold text-[color:var(--foreground)]">Watching with {namedViewers}</span>
        {otherCount > 0 && <span> and {otherCount.toLocaleString()} {otherCount === 1 ? 'other' : 'others'}</span>}
      </p>
    </div>
  );
}
