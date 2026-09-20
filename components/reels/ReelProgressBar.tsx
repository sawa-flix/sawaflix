'use client';

import { useEffect, useRef } from 'react';

interface ReelProgressBarProps {
  getPlayer: () => any;
  isActive: boolean;
  isScrubbing: boolean;
}

export function ReelProgressBar({ getPlayer, isActive, isScrubbing }: ReelProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    // If not the active video, or if currently dragging the scrubber, pause updates
    if (!isActive || isScrubbing) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      return;
    }

    const updateLoop = () => {
      const player = getPlayer();
      if (player && barRef.current) {
        let currentTime = 0;
        let duration = 0;
        try {
          currentTime = player.getCurrentTime?.() ?? 0;
          duration = player.getDuration?.() ?? 0;
        } catch {
          // ignore
        }
        
        if (duration > 0) {
          const percent = Math.min(100, (currentTime / duration) * 100);
          barRef.current.style.width = `${percent}%`;
        }
      }
      reqRef.current = requestAnimationFrame(updateLoop);
    };

    reqRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [getPlayer, isActive, isScrubbing]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 z-30 bg-white/20 pointer-events-none">
      <div 
        ref={barRef} 
        className="h-full bg-white opacity-80"
        style={{ width: '0%', transition: isScrubbing ? 'none' : 'width 100ms linear' }}
      />
    </div>
  );
}

