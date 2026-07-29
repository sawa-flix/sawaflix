import { useCallback, useEffect, useRef, useState } from 'react';

interface UseActiveReelOptions {
  /** Fraction of a card that must be visible before it's considered active. */
  threshold?: number;
}

/**
 * Tracks which reel card is the "active" one using a single shared
 * IntersectionObserver instance (not one observer per card, and not a
 * separate manager class) — cards register themselves via `setItemRef(index)`
 * as they mount/unmount under windowing, and whichever registered card is
 * currently most visible (>= threshold) becomes activeIndex.
 *
 * Uses React 19's ref-callback cleanup return instead of a null-check ref
 * pattern, so each card cleanly unobserves itself when it unmounts.
 */
export function useActiveReel(options: UseActiveReelOptions = {}) {
  const threshold = options.threshold ?? 0.8;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const ratiosRef = useRef<Map<number, number>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);

  const getObserver = useCallback(() => {
    if (observerRef.current) return observerRef.current;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const indexAttr = (entry.target as HTMLElement).dataset.reelIndex;
          if (indexAttr === undefined) continue;
          const index = Number(indexAttr);
          ratiosRef.current.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestIndex = -1;
        let bestRatio = 0;
        ratiosRef.current.forEach((ratio, index) => {
          if (ratio >= threshold && ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        });
        if (bestIndex !== -1) {
          setActiveIndex((prev) => (prev === bestIndex ? prev : bestIndex));
        }
      },
      { root: containerRef.current, threshold: [0, threshold, 1] }
    );

    return observerRef.current;
  }, [threshold]);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (!el) return;
      const observer = getObserver();
      el.dataset.reelIndex = String(index);
      observer.observe(el);

      return () => {
        observer.unobserve(el);
        ratiosRef.current.delete(index);
      };
    },
    [getObserver]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { containerRef, activeIndex, setItemRef };
}
