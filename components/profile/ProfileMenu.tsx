'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PROFILE_MENU_SECTIONS } from './constants';

interface ProfileMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

/**
 * ProfileMenu Component
 * Desktop sidebar navigation menu for profile sections
 * Shows active state with red background and chevron indicator
 */

function ProfileMenu({
  activeSection,
  onSectionChange,
}: ProfileMenuProps): React.ReactElement {
  return (
    <nav className="space-y-2">
      {PROFILE_MENU_SECTIONS.map((section) => {
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all text-left flex items-center justify-between group ${
              isActive
                ? 'bg-[#CE1126] text-white shadow-lg shadow-[#CE1126]/20'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>{section.label}</span>
            {isActive && (
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default ProfileMenu;
