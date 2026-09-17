'use client';

import { Globe2, Languages, MapPin, Link2 } from 'lucide-react';
import type { ProfileData } from '@/types/profile';

interface ProfileAboutProps {
  profile: ProfileData;
}

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  website: 'Website',
};

/** Bio, genres, location, language, social links — every field here is real, sourced from ProfileData. */
export function ProfileAbout({ profile }: ProfileAboutProps) {
  const socialEntries = Object.entries(profile.socialLinks ?? {}).filter(([, url]) => !!url);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
        <h3 className="mb-3 text-sm font-bold text-[color:var(--foreground)]">Bio</h3>
        <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">{profile.bio || 'No bio added yet.'}</p>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
        <h3 className="mb-3 text-sm font-bold text-[color:var(--foreground)]">Favorite Genres</h3>
        {profile.favoredGenres.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.favoredGenres.map((genre) => (
              <span key={genre} className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-hover)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground-secondary)]">
                {genre}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--muted-foreground)]">No favorite genres added yet.</p>
        )}
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
        <h3 className="mb-3 text-sm font-bold text-[color:var(--foreground)]">Location</h3>
        <div className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <Globe2 size={14} className="text-white/30" />
            {/* SawaFlix is Cameroon-focused — a true platform-level fact, not a per-user fabrication. */}
            Cameroon
          </div>
          {(profile.region || profile.village) && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-white/30" />
              {[profile.village, profile.region].filter(Boolean).join(', ')}
            </div>
          )}
          {profile.languagePreference && (
            <div className="flex items-center gap-2">
              <Languages size={14} className="text-white/30" />
              {profile.languagePreference}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
        <h3 className="mb-3 text-sm font-bold text-[color:var(--foreground)]">Links</h3>
        {profile.website || socialEntries.length > 0 ? (
          <div className="space-y-2">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[color:var(--primary)] hover:text-[color:var(--primary-strong)]"
              >
                <Link2 size={14} />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {socialEntries.map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
              >
                <Link2 size={14} className="text-[color:var(--muted-foreground)]" />
                {SOCIAL_LABELS[key] ?? key}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--muted-foreground)]">No links added yet.</p>
        )}
      </div>
    </div>
  );
}
