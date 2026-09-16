import { useEffect, useRef, useState, type RefObject } from 'react';

interface UseIntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  /** Stop observing after the first intersection (useful for one-shot triggers like infinite-scroll sentinels). */
  once?: boolean;
}

/**
 * Generic single-element visibility hook. Kept deliberately dumb — it just
 * reports whether one element is intersecting. Used by the Reels feed as an
 * infinite-scroll sentinel; unrelated to useActiveReel, which needs to track
 * many elements against each other and manages its own IntersectionObserver
 * for that reason.
 */
export function useIntersection<T extends Element>(
  options: UseIntersectionOptions = {}
): [RefObject<T | null>, boolean] {
  const { root = null, rootMargin = '0px', threshold = 0, once = false } = options;
  const elementRef = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && once) {
          observer.disconnect();
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold, once]);

  return [elementRef, isIntersecting];
}
