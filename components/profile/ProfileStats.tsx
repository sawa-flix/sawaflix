import type { ComponentType } from 'react';
import { formatCount } from '@/utils/formatCount';

export interface StatItem {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  /** `null` renders as an honest "—" — never a fabricated number. */
  value: number | null;
}

interface ProfileStatsProps {
  items: StatItem[];
}

/** Generic stat-pill row — each profile type builds its own item list (different stats entirely for user vs creator). */
export function ProfileStats({ items }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {items.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-[#0E121A] px-3 py-4 text-center"
        >
          <Icon size={16} className="text-white/40" />
          <span className="text-lg font-black text-white">{value === null ? '—' : formatCount(value)}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  );
}
