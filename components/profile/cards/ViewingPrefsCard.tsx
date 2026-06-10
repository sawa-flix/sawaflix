'use client';

import { useState } from 'react';
import { Sliders } from 'lucide-react';

const GENRE_OPTIONS = ['Drama', 'Comedy', 'Romance', 'Action', 'History', 'Sci-Fi', 'Documentary'];
const LANGUAGE_OPTIONS = ['English', 'French', 'Pidgin', 'Local Dialects'];

interface ViewingPrefsCardProps {
  favoriteGenres?: string[];
  preferredLanguages?: string[];
  videoQuality?: string;
  autoplay?: boolean;
}

export default function ViewingPrefsCard({
  favoriteGenres = ['Drama', 'Comedy', 'Romance'],
  preferredLanguages = ['English', 'French'],
  videoQuality = 'Auto (Best Quality)',
  autoplay = true,
}: ViewingPrefsCardProps) {
  const [autoplayEnabled, setAutoplayEnabled] = useState(autoplay);
  const [quality, setQuality] = useState(videoQuality);

  return (
    <div className="bg-[#0E121A] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sliders size={15} className="text-amber-500" />
        <h3 className="text-sm font-bold text-white">Viewing Preferences</h3>
      </div>

      {/* Favorite Genres */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Favorite Genres
        </p>
        <div className="flex flex-wrap gap-1.5">
          {GENRE_OPTIONS.map((genre) => (
            <span
              key={genre}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                favoriteGenres.includes(genre)
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                  : 'bg-white/5 border-white/10 text-zinc-500'
              }`}
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Preferred Language */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Preferred Language
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGE_OPTIONS.map((lang) => (
            <span
              key={lang}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                preferredLanguages.includes(lang)
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-zinc-500'
              }`}
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Video Quality */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Video Quality
        </p>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="w-full px-3 py-2 bg-[#0E121A] border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 transition-all [&>option]:bg-[#0E121A]"
        >
          <option value="Auto (Best Quality)">Auto (Best Quality)</option>
          <option value="1080p">1080p Full HD</option>
          <option value="720p">720p HD</option>
          <option value="480p">480p Standard</option>
        </select>
      </div>

      {/* Autoplay Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 font-medium">Autoplay Next Episode</p>
        <button
          onClick={() => setAutoplayEnabled(!autoplayEnabled)}
          className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
            autoplayEnabled ? 'bg-amber-500' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
              autoplayEnabled ? 'left-5' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
