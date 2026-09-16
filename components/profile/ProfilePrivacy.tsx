'use client';

import { ShieldCheck } from 'lucide-react';

const PLANNED_CONTROLS = ['Hide Likes', 'Hide Saved', 'Private Profile', 'Comment Permissions'];

/**
 * Owner-only. Deliberately static/informational rather than interactive
 * toggles: there are no privacy-preference columns on `users` yet, so
 * working toggles would either silently fail to persist or need a new
 * migration beyond this pass's scope. Listing what's planned is more
 * honest than shipping controls that don't do anything.
 */
export function ProfilePrivacy() {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0E121A] p-5">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck size={15} className="text-white/40" />
        <h3 className="text-sm font-bold text-white">Privacy</h3>
      </div>
      <p className="mb-3 text-sm text-gray-400">Coming soon:</p>
      <ul className="space-y-1.5">
        {PLANNED_CONTROLS.map((label) => (
          <li key={label} className="text-sm text-gray-500">
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
