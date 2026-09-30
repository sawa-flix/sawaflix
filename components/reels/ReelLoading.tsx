/**
 * Minimal buffering state used while the feed or selected reel is starting.
 */
export function ReelLoading() {
  return (
    <div
      role="status"
      aria-label="Loading reel"
      className="relative z-10 flex h-full w-full items-center justify-center bg-black"
    >
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
    </div>
  );
}
