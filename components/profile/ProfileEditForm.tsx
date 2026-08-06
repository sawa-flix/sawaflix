'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import type { ProfileData } from '@/types/profile';

export interface ProfileEditableFields {
  username: string;
  bio: string;
  phone: string;
  region: string;
  village: string;
  languagePreference: string;
  favoredGenres: string[];
  socialLinks: Record<string, string>;
}

interface ProfileEditFormProps {
  profile: ProfileData;
  onSave: (updates: ProfileEditableFields) => Promise<void>;
  onCancel: () => void;
}

const SOCIAL_FIELDS: Array<{ key: string; label: string; placeholder: string }> = [
  { key: 'website', label: 'Website', placeholder: 'https://yoursite.com' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/you' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/you' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@you' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@you' },
];

/**
 * Single source of truth for profile editing, replacing the two
 * previously-colliding EditProfileForm.tsx/.jsx files. Used by both
 * /dashboard/edit-profile and the /creator/[username] "Customize Channel"
 * flow. Avatar/cover uploads persist immediately via /api/creator/upload
 * (which writes profile_image_url/cover_image_url directly) — the rest of
 * the fields persist only when "Save" is pressed.
 */
export function ProfileEditForm({ profile, onSave, onCancel }: ProfileEditFormProps) {
  const [fields, setFields] = useState<ProfileEditableFields>({
    username: profile.username,
    bio: profile.bio ?? '',
    phone: profile.phone ?? '',
    region: profile.region ?? '',
    village: profile.village ?? '',
    languagePreference: profile.languagePreference ?? '',
    favoredGenres: profile.favoredGenres,
    socialLinks: profile.socialLinks ?? {},
  });
  const [genresInput, setGenresInput] = useState(profile.favoredGenres.join(', '));
  const [avatarUrl, setAvatarUrl] = useState(profile.profileImageUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverImageUrl);
  const [uploading, setUploading] = useState<'profile_image' | 'cover_image' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, category: 'profile_image' | 'cover_image') => {
    setUploading(category);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      const res = await fetch('/api/creator/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (category === 'profile_image') setAvatarUrl(data.url);
      else setCoverUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        ...fields,
        favoredGenres: genresInput
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-600/30 bg-red-600/10 p-4 text-sm text-red-400">{error}</div>
      )}

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Cover Photo</p>
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="relative h-40 w-full overflow-hidden rounded-xl border border-white/10 bg-[#151C25]"
        >
          {coverUrl && <Image src={coverUrl} alt="" fill unoptimized className="object-cover" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            {uploading === 'cover_image' ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
          </div>
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'cover_image')}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#151C25]"
        >
          {avatarUrl && <Image src={avatarUrl} alt="" fill unoptimized className="object-cover" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            {uploading === 'profile_image' ? <Loader2 size={18} className="animate-spin text-white" /> : <Camera size={18} className="text-white" />}
          </div>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'profile_image')}
        />
        <p className="text-xs text-gray-500">Tap either photo to replace it. Saves immediately.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Username">
          <input
            type="text"
            value={fields.username}
            onChange={(e) => setFields((f) => ({ ...f, username: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={fields.phone}
            onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Region">
          <input
            type="text"
            value={fields.region}
            onChange={(e) => setFields((f) => ({ ...f, region: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Village">
          <input
            type="text"
            value={fields.village}
            onChange={(e) => setFields((f) => ({ ...f, village: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Language">
          <input
            type="text"
            value={fields.languagePreference}
            onChange={(e) => setFields((f) => ({ ...f, languagePreference: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Favorite Genres (comma separated)">
          <input
            type="text"
            value={genresInput}
            onChange={(e) => setGenresInput(e.target.value)}
            placeholder="Drama, Comedy, Action"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Bio">
        <textarea
          value={fields.bio}
          onChange={(e) => setFields((f) => ({ ...f, bio: e.target.value }))}
          rows={3}
          className={inputClass}
        />
      </Field>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Social Links</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input
                type="url"
                value={fields.socialLinks[key] ?? ''}
                onChange={(e) =>
                  setFields((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: e.target.value } }))
                }
                placeholder={placeholder}
                className={inputClass}
              />
            </Field>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-bold text-gray-300 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-full bg-[#E50914] px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-[#151C25] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
      {children}
    </label>
  );
}
