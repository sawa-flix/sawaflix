'use client';

import { useCallback, useRef, useState } from 'react';

/** Press-and-hold delay (touch/pen only) before a hold becomes a scrub, distinguishing it from a tap or a swipe. */
const HOLD_MS = 180;
/** Seconds seeked per pixel of horizontal drag once scrubbing is engaged. */
const SEEK_SENSITIVITY = 0.15;
/** Movement (px) before the touch hold timer is cancelled — a decisive early move reads as a swipe, not a hold. */
const MOVE_CANCEL_THRESHOLD = 4;
/** Movement (px) before a mouse drag arms scrubbing — mouse has no swipe-to-scroll to guard against, so it engages on drag distance instead of a hold delay. */
const MOUSE_DRAG_THRESHOLD = 6;

interface UseScrubGestureOptions {
  /** Returns the live player instance (or null before it's ready) — no separate player is created here. */
  getPlayer: () => YT.Player | null;
  /** Called for a plain tap (press+release with no scrub engaged) — existing play/pause toggle. */
  onTap: () => void;
  /** Called after a completed scrub resumes playback — lets the caller clear any prior manual-pause state, so "resume on release" holds even if the reel was paused before the scrub began. */
  onScrubEnd?: () => void;
}

interface ScrubGestureResult {
  isScrubbing: boolean;
  scrubTime: number;
  duration: number;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onClick: (e: React.MouseEvent) => void;
  };
}

/**
 * TikTok-style scrub gesture. Touch/pen: press-and-hold, then drag
 * horizontally. Mouse: click-and-drag horizontally, no hold delay needed
 * (see below for why). Reuses whatever player instance `getPlayer` returns
 * (seekTo/pauseVideo/playVideo/getCurrentTime/getDuration on the existing
 * YT.Player) — no second player, no duplicated playback logic.
 *
 * Vertical swipe safety (touch/pen only — mouse has no swipe-to-scroll
 * gesture to guard against, since desktop reel navigation is the scroll
 * wheel, a separate input channel): the gesture only ever acts on movement
 * once (a) the hold delay has elapsed AND the pointer hasn't moved much yet
 * (a genuine press-and-hold), and (b) the caller has set
 * `touchAction: 'pan-y'` on the target element, which lets the browser keep
 * handling vertical drags as native scrolling — those never reach this hook
 * as a live gesture at all, arriving instead as an immediate
 * `pointercancel`. A large pointer move before the hold timer elapses also
 * cancels arming outright, so a fast
 * swipe never has a chance to engage scrubbing.
 */
export function useScrubGesture({ getPlayer, onTap, onScrubEnd }: UseScrubGestureOptions): ScrubGestureResult {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const baseTimeRef = useRef(0);
  const durationRef = useRef(0);
  const armedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const pointerTypeRef = useRef<string>('mouse');
  const justScrubbedRef = useRef(false);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const engageScrub = useCallback(() => {
    const player = getPlayer();
    if (!player) return;

    let currentTime = 0;
    let totalDuration = 0;
    try {
      currentTime = player.getCurrentTime?.() ?? 0;
      totalDuration = player.getDuration?.() ?? 0;
    } catch {
      return;
    }
    if (!totalDuration || totalDuration <= 0) return;

    armedRef.current = true;
    baseTimeRef.current = currentTime;
    durationRef.current = totalDuration;
    setDuration(totalDuration);
    setScrubTime(currentTime);
    setIsScrubbing(true);

    try {
      player.pauseVideo();
    } catch {
      // ignore — player may not be fully ready
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [getPlayer]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      armedRef.current = false;
      pointerIdRef.current = e.pointerId;
      pointerTypeRef.current = e.pointerType;

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore — capture is a nice-to-have, not required
      }

      clearHoldTimer();
      // Mouse has no swipe-to-scroll gesture to disambiguate from (reel
      // navigation on desktop is the scroll wheel, a separate input
      // channel), so it skips the hold delay entirely — arming happens
      // from drag distance instead, in onPointerMove below.
      if (e.pointerType !== 'mouse') {
        holdTimerRef.current = setTimeout(engageScrub, HOLD_MS);
      }
    },
    [engageScrub]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!armedRef.current) {
      if (pointerTypeRef.current === 'mouse') {
        // Click-and-drag: a deliberate horizontal drag arms scrubbing
        // immediately. A plain click (no real movement) still just
        // toggles play/pause via onClick, untouched.
        if (Math.abs(dx) > MOUSE_DRAG_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          engageScrub();
        }
        if (!armedRef.current) return;
      } else {
        if (Math.abs(dx) > MOVE_CANCEL_THRESHOLD || Math.abs(dy) > MOVE_CANCEL_THRESHOLD) {
          clearHoldTimer();
        }
        return;
      }
    }

    e.preventDefault();
    const target = Math.max(0, Math.min(durationRef.current, baseTimeRef.current + dx * SEEK_SENSITIVITY));
    setScrubTime(target);
  }, [engageScrub]);

  const endGesture = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      clearHoldTimer();
      pointerIdRef.current = null;

      if (!armedRef.current) return;
      armedRef.current = false;
      justScrubbedRef.current = true;

      const player = getPlayer();
      setScrubTime((finalTime) => {
        if (player) {
          try {
            player.seekTo(finalTime, true);
            player.playVideo();
          } catch {
            // ignore
          }
        }
        return finalTime;
      });
      setIsScrubbing(false);
      onScrubEnd?.();
    },
    [getPlayer, onScrubEnd]
  );

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      // A completed scrub shouldn't also toggle play/pause via the click
      // that follows pointerup.
      if (justScrubbedRef.current) {
        justScrubbedRef.current = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onTap();
    },
    [onTap]
  );

  return {
    isScrubbing,
    scrubTime,
    duration,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endGesture,
      onPointerCancel: endGesture,
      onClick,
    },
  };
}
