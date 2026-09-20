'use client';

import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import type { ProfileTabId } from '@/types/profile';

export interface ProfileTabDef {
  id: ProfileTabId;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

interface ProfileTabsProps {
  tabs: ProfileTabDef[];
  activeTab: ProfileTabId;
  onChange: (id: ProfileTabId) => void;
}

/** Extends the sliding-underline pattern already used in the old ProfileView.jsx (layoutId + shared spring). */
export function ProfileTabs({ tabs, activeTab, onChange }: ProfileTabsProps) {
  return (
    <div role="tablist" className="no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-white/5">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex shrink-0 items-center gap-2 pb-4 text-xs font-black uppercase tracking-[0.2em] transition-colors ${
              isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon size={14} />
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="activeProfileTab"
                className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-red-600"
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
