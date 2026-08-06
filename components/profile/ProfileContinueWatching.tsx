import { PlayCircle } from 'lucide-react';

/**
 * No watch-progress tracking exists anywhere in this codebase (confirmed —
 * the previous "Recently Watched" section was 100% hardcoded mock data
 * using the static movie catalog). Honest empty state instead of fabricating one.
 */
export function ProfileContinueWatching() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-[#0E121A] py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <PlayCircle size={24} className="text-white/40" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Nothing in progress</h3>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          Watch progress isn&apos;t tracked yet — once it is, movies you&apos;re partway through will show up here.
        </p>
      </div>
    </div>
  );
}
