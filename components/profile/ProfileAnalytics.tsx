'use client';

import { BarChart3 } from 'lucide-react';

/**
 * Owner-only. No profile-view/watch-time/engagement tracking exists
 * anywhere in this app today (confirmed: the existing creator analytics
 * page is 100% hardcoded mock data) — this ships as an honest "not enough
 * data yet" shell rather than fabricated charts. Instrumenting real
 * tracking is a separate, larger backend project.
 */
export function ProfileAnalytics() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/5 bg-[#0E121A] py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <BarChart3 size={24} className="text-white/40" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Analytics coming soon</h3>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          Profile views, watch time, and engagement tracking aren&apos;t instrumented yet. Once they are, this
          panel will show real numbers — not placeholders.
        </p>
      </div>
    </div>
  );
}
