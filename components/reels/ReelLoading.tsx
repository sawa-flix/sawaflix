/**
 * Full-screen loading skeleton for the Reels feed, matching the visual
 * language of components/Dashboard/Skeletons.jsx (animate-pulse + white/5
 * blocks) rather than inventing a new loading style.
 */
export function ReelLoading() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#0B0E14]">
      <div className="relative h-full w-full animate-pulse overflow-hidden bg-white/5 lg:h-[calc(100%-5rem)] lg:w-auto lg:aspect-[9/16] lg:rounded-[1.75rem]">
        <div className="absolute inset-x-4 bottom-24 space-y-3">
          <div className="h-3 w-1/3 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/10" />
        </div>
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-9 rounded-full bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
