import { Pin } from 'lucide-react';

/**
 * Pinned reel/featured movie/album/playlist — no "pinning" feature exists
 * anywhere in this codebase, so this is a structurally-present, honestly
 * empty section rather than fabricated content.
 */
export function ProfileFeaturedContent() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0E121A] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Pin size={15} className="text-white/40" />
        <h2 className="text-sm font-bold text-white">Featured Content</h2>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <p className="text-sm text-gray-500">
          Pinning a reel, movie, album, or playlist isn&apos;t supported yet — this is planned.
        </p>
      </div>
    </div>
  );
}
