'use client';

import React, { useState } from 'react';
import { Sliders, Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface ProfilePreferencesProps {
  userId?: string;
  initialGenres?: string[];
  initialLanguage?: string;
}

const ALL_GENRES = ['Drama', 'Comedy', 'Action', 'Romance', 'Music'];
const LANGUAGES = ['English', 'French', 'Pidgin'];

export function ProfilePreferences({
  userId,
  initialGenres = ['Drama', 'Comedy', 'Action', 'Romance', 'Music'],
  initialLanguage = 'English',
}: ProfilePreferencesProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleGenre = async (genre: string) => {
    const next = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(next);

    if (userId) {
      try {
        const supabase = createClient();
        await supabase
          .from('users')
          .update({ favored_genres: next })
          .eq('id', userId);
      } catch (err) {
        console.warn('Error saving genres:', err);
      }
    }
  };

  const selectLanguage = async (lang: string) => {
    setSelectedLanguage(lang);

    if (userId) {
      try {
        const supabase = createClient();
        await supabase
          .from('users')
          .update({ language_preference: lang })
          .eq('id', userId);
      } catch (err) {
        console.warn('Error saving language:', err);
      }
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className="rounded-xl sm:rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:p-5 md:p-6 backdrop-blur-xl shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 lg:divide-x lg:divide-white/10">
        
        {/* Section 1: Viewing Preferences & Favorite Genres (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[color:var(--surface-hover)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--foreground)]">
              <Sliders size={14} className="text-[color:var(--primary)]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[color:var(--foreground)] tracking-tight">Viewing Preferences</h3>
          </div>

          <div>
            <p className="text-[11px] sm:text-xs text-[color:var(--muted-foreground)] font-medium mb-2">Favorite Genres</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {ALL_GENRES.map((genre) => {
                const isActive = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'border border-[color:var(--border)] bg-[color:var(--surface-hover)] text-[color:var(--foreground)] shadow-sm'
                        : 'border border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--muted-foreground)] hover:border-[color:var(--border)] hover:text-[color:var(--foreground)]'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Preferred Language (3.5 Cols) */}
        <div className="lg:col-span-3 lg:pl-6 space-y-2.5">
          <p className="text-[11px] sm:text-xs text-[color:var(--muted-foreground)] font-medium pt-0.5 mb-2">Preferred Language</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {LANGUAGES.map((lang) => {
              const isActive = selectedLanguage.toLowerCase() === lang.toLowerCase();
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => selectLanguage(lang)}
                  className={`px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'border border-[color:var(--primary)] bg-[color:var(--primary-soft)] text-[color:var(--primary)] font-semibold shadow-sm'
                      : 'border border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--muted-foreground)] hover:border-[color:var(--border)] hover:text-[color:var(--foreground)]'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Notifications (3.5 Cols) */}
        <div className="lg:col-span-4 lg:pl-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[color:var(--surface-hover)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--foreground)]">
                <Bell size={14} className="text-[color:var(--foreground-secondary)]" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[color:var(--foreground)] tracking-tight">Notifications</h3>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={toggleNotifications}
              aria-label="Toggle notifications"
              className={`w-10 h-5 sm:w-11 sm:h-6 flex items-center rounded-full p-0.5 sm:p-1 transition-colors cursor-pointer ${
                notificationsEnabled ? 'bg-[#CE1126] justify-end' : 'bg-zinc-700 justify-start'
              }`}
            >
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-[color:var(--muted-foreground)] leading-relaxed pr-2">
            Stay updated on new releases and recommendations
          </p>
        </div>

      </div>
    </div>
  );
}
