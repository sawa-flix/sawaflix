'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import type { ProfileData } from '@/types/profile';
import { computeProfileCompletion } from '@/utils/profile/profileHelpers';

interface ProfileCompletionProps {
  profile: ProfileData;
}

/** Owner-only. Percent is real — computed from how many profile fields are actually filled in. */
export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const { percent, missing } = computeProfileCompletion(profile);

  if (percent === 100) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#0E121A] p-5">
        <CheckCircle2 size={20} className="shrink-0 text-green-500" />
        <p className="text-sm font-semibold text-white">Your profile is 100% complete.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-[#0E121A] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Profile Completion</h3>
        <span className="text-sm font-black text-[#E50914]">{percent}%</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#E50914] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {missing.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          Missing:{' '}
          <Link href="/dashboard/edit-profile" className="font-semibold text-gray-300 hover:text-white">
            {missing.join(', ')}
          </Link>
        </p>
      )}
    </div>
  );
}
