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
  const [isSaving, setIsSaving] = useState(false);

  const toggleGenre = async (genre: string) => {
    const next = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(next);

    if (userId) {
      try {
        setIsSaving(true);
        const supabase = createClient();
        await supabase
          .from('users')
          .update({ favored_genres: next })
          .eq('id', userId);
      } catch (err) {
        console.warn('Error saving genres:', err);
      } finally {
        setIsSaving(false);
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
    <div className="rounded-2xl border border-white/10 bg-[#0E121A]/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 lg:divide-x lg:divide-white/10">
        
        {/* Section 1: Viewing Preferences & Favorite Genres (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#CE1126]" />
            <h3 className="text-sm font-bold text-white tracking-tight">Viewing Preferences</h3>
          </div>

          <div>
            <p className="text-xs text-zinc-400 font-medium mb-3">Favorite Genres</p>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((genre) => {
                const isActive = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'border border-white/20 bg-white/10 text-white shadow-sm'
                        : 'border border-white/5 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
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
        <div className="lg:col-span-3 lg:pl-8 space-y-3">
          <p className="text-xs text-zinc-400 font-medium pt-1 mb-3">Preferred Language</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const isActive = selectedLanguage.toLowerCase() === lang.toLowerCase();
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => selectLanguage(lang)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'border border-red-500/80 bg-red-500/15 text-red-400 font-semibold shadow-sm'
                      : 'border border-white/5 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Notifications (3.5 Cols) */}
        <div className="lg:col-span-4 lg:pl-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-zinc-300" />
              <h3 className="text-sm font-bold text-white tracking-tight">Notifications</h3>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={toggleNotifications}
              aria-label="Toggle notifications"
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                notificationsEnabled ? 'bg-[#CE1126] justify-end' : 'bg-zinc-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed pr-2">
            Stay updated on new releases and recommendations
          </p>
        </div>

      </div>
    </div>
  );
}
