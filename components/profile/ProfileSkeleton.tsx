/** Extends the existing ProfileFormSkeleton pattern (components/Dashboard/Skeletons.jsx) for the new layout. */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0E121A]">
        <div className="h-40 w-full bg-gray-800 sm:h-56 md:h-64" />
        <div className="px-5 pb-5 sm:px-8 sm:pb-8">
          <div className="-mt-16 h-32 w-32 rounded-full border-4 border-[#0E121A] bg-gray-700 sm:-mt-20 sm:h-40 sm:w-40" />
          <div className="mt-4 h-6 w-48 rounded bg-gray-800" />
          <div className="mt-2 h-4 w-32 rounded bg-gray-800" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-white/5 bg-[#0E121A]" />
        ))}
      </div>

      <div className="h-10 w-full rounded bg-white/5" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
