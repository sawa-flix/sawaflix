'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';

interface ReelControlsProps {
  getPlayer: () => any;
  isActive: boolean;
  isPaused: boolean;
  onTogglePlay: () => void;
  onBackward: () => void;
  onForward: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function ReelControls({
  getPlayer,
  isActive,
  isPaused,
  onTogglePlay,
  onBackward,
  onForward,
}: ReelControlsProps) {
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const updateTime = () => {
      const player = getPlayer();
      if (player) {
        try {
          const cur = player.getCurrentTime?.() ?? 0;
          const dur = player.getDuration?.() ?? 0;
          setTime((prev) => {
            if (Math.floor(prev.current) !== Math.floor(cur) || Math.floor(prev.duration) !== Math.floor(dur)) {
              return { current: cur, duration: dur };
            }
            return prev;
          });
        } catch {
          // ignore
        }
      }
      reqRef.current = requestAnimationFrame(updateTime);
    };

    reqRef.current = requestAnimationFrame(updateTime);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [getPlayer, isActive]);

  return (
    <>
      {/* Central Big Play Icon when Paused */}
      {isActive && isPaused && (
        <div 
          onClick={onTogglePlay}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-[color:var(--surface)]/95 backdrop-blur-md border border-[color:var(--border)] flex items-center justify-center text-[color:var(--foreground)] shadow-2xl scale-100 hover:scale-110 transition-transform">
            <Play size={28} fill="currentColor" className="ml-1" />
          </div>
        </div>
      )}

      {/* Floating Controls Bar at Bottom Above Progress Bar */}
      <div className="absolute bottom-4 left-3 right-16 z-30 flex items-center gap-1.5 pointer-events-auto">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          aria-label={isPaused ? 'Play video' : 'Pause video'}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--surface)]/95 hover:bg-[color:var(--surface-hover)] text-[color:var(--foreground)] backdrop-blur-md border border-[color:var(--border)] transition-all shadow-md active:scale-95 cursor-pointer"
        >
          {isPaused ? <Play size={13} fill="currentColor" className="ml-0.5" /> : <Pause size={13} fill="currentColor" />}
        </button>

        {/* Rewind 10 seconds */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBackward();
          }}
          aria-label="Rewind 10 seconds"
          title="Back 10s"
          className="flex h-7 px-2 items-center justify-center gap-1 rounded-full bg-[color:var(--surface)]/95 hover:bg-[color:var(--surface-hover)] text-[color:var(--foreground)] backdrop-blur-md border border-[color:var(--border)] transition-all shadow-md active:scale-95 text-xs font-bold cursor-pointer"
        >
          <Rewind size={13} />
          <span className="text-[10px] tracking-tight">-10s</span>
        </button>

        {/* Forward 10 seconds */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onForward();
          }}
          aria-label="Skip forward 10 seconds"
          title="Forward 10s"
          className="flex h-7 px-2 items-center justify-center gap-1 rounded-full bg-[color:var(--surface)]/95 hover:bg-[color:var(--surface-hover)] text-[color:var(--foreground)] backdrop-blur-md border border-[color:var(--border)] transition-all shadow-md active:scale-95 text-xs font-bold cursor-pointer"
        >
          <FastForward size={13} />
          <span className="text-[10px] tracking-tight">+10s</span>
        </button>

        {/* Elapsed / Total Duration Pill */}
        {time.duration > 0 && (
          <div className="flex items-center px-2 py-0.5 rounded-full bg-[color:var(--surface)]/95 backdrop-blur-md border border-[color:var(--border)] text-[10px] font-mono text-[color:var(--foreground)] shadow-sm ml-auto">
            <span>{formatTime(time.current)}</span>
            <span className="mx-1 text-[color:var(--muted-foreground)]">/</span>
            <span className="text-[color:var(--muted-foreground)]">{formatTime(time.duration)}</span>
          </div>
        )}
      </div>
    </>
  );
}
