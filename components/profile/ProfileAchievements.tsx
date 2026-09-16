'use client';

import { Award, Lock } from 'lucide-react';
import type { Achievement } from '@/types/profile';

interface ProfileAchievementsProps {
  achievements: Achievement[];
}

/** Shared, dumb renderer — the caller supplies a pre-computed list (deriveUserAchievements / deriveCreatorAchievements). */
export function ProfileAchievements({ achievements }: ProfileAchievementsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          title={achievement.description}
          className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
            achievement.earned ? 'border-[#E50914]/30 bg-[#E50914]/10' : 'border-white/5 bg-[#0E121A] opacity-50'
          }`}
        >
          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${achievement.earned ? 'bg-[#E50914]/20' : 'bg-white/5'}`}>
            {achievement.earned ? <Award size={18} className="text-[#E50914]" /> : <Lock size={16} className="text-white/30" />}
          </span>
          <span className="text-xs font-bold text-white">{achievement.label}</span>
        </div>
      ))}
    </div>
  );
}
