'use client';

import React, { useState } from 'react';
import { UserPreferences } from '../types';

interface PreferencesSectionProps {
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
}

/**
 * PreferencesSection Component
 * Allows users to manage viewing preferences and settings
 */

function PreferencesSection({
  preferences,
  onSave,
}: PreferencesSectionProps): React.ReactElement {
  const [prefs, setPrefs] = useState(preferences);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(prefs);
    setIsEditing(false);
  };

  const qualityOptions = ['auto', '480p', '720p', '1080p', '4k'];
  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Arabic',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Viewing Preferences
          </h2>
          <p className="text-gray-400">Customize your playback experience</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Video Quality */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Video Quality
          </label>
          {isEditing ? (
            <div className="flex gap-2 flex-wrap">
              {qualityOptions.map((quality) => (
                <label
                  key={quality}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="quality"
                    value={quality}
                    checked={prefs.videoQuality === quality}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        videoQuality: e.target.value as any,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white">{quality}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-white capitalize">{prefs.videoQuality}</p>
          )}
        </div>

        {/* Subtitles */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={prefs.subtitles}
              onChange={(e) =>
                setPrefs({ ...prefs, subtitles: e.target.checked })
              }
              disabled={!isEditing}
              className="w-4 h-4 accent-[#CE1126]"
            />
            <span className="text-sm font-semibold text-gray-300">Subtitles</span>
          </label>
          {prefs.subtitles && (
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Subtitle Language
              </label>
              <select
                value={prefs.subtitleLanguage}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    subtitleLanguage: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white text-sm"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Autoplay */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.autoplayNextEpisode}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  autoplayNextEpisode: e.target.checked,
                })
              }
              disabled={!isEditing}
              className="w-4 h-4 accent-[#CE1126]"
            />
            <span className="text-sm font-semibold text-gray-300">
              Autoplay Next Episode
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.autoplayNextTrack}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  autoplayNextTrack: e.target.checked,
                })
              }
              disabled={!isEditing}
              className="w-4 h-4 accent-[#CE1126]"
            />
            <span className="text-sm font-semibold text-gray-300">
              Autoplay Next Track
            </span>
          </label>
        </div>

        {/* Notifications */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.notificationsEnabled}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  notificationsEnabled: e.target.checked,
                })
              }
              disabled={!isEditing}
              className="w-4 h-4 accent-[#CE1126]"
            />
            <span className="text-sm font-semibold text-gray-300">
              Enable Notifications
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      {isEditing && (
        <div className="flex gap-4 pt-4 border-t border-white/10">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 px-6 py-3 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-[#CE1126] rounded-lg text-white font-semibold hover:bg-red-700 transition"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

export default PreferencesSection;
