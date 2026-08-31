'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Save, X } from 'lucide-react';
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

export function ProfileEditForm({ profile, onSave, onCancel }: ProfileEditFormProps) {
  const [fields, setFields] = useState<ProfileEditableFields>({
    username: profile.username || '',
    bio: profile.bio ?? '',
    phone: profile.phone ?? '',
    region: profile.region ?? '',
    village: profile.village ?? '',
    languagePreference: profile.languagePreference ?? 'English',
    favoredGenres: profile.favoredGenres || [],
    socialLinks: profile.socialLinks ?? {},
  });
  const [genresInput, setGenresInput] = useState((profile.favoredGenres || []).join(', '));
  const [avatarUrl, setAvatarUrl] = useState(profile.profileImageUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverImageUrl);
  const [uploading, setUploading] = useState<'profile_image' | 'cover_image' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const initial = (fields.username || 'U').trim().charAt(0).toUpperCase() || 'U';

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
        <div className="rounded-xl border border-red-600/30 bg-red-600/10 p-4 text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      {/* Cover Photo */}
      <div>
        <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400">Cover Photo</p>
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="relative h-44 sm:h-52 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#151C25] group cursor-pointer shadow-lg"
        >
          {coverUrl ? (
            <Image src={coverUrl} alt="Cover" fill unoptimized className="object-cover" />
          ) : (
            <div className="relative h-full w-full">
              <Image src="/hero-bg.png" alt="Default Cover" fill unoptimized className="object-cover opacity-50 brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
            {uploading === 'cover_image' ? (
              <Loader2 className="animate-spin text-white" size={24} />
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/70 border border-white/20 text-white text-xs font-bold">
                <Camera size={16} />
                <span>Change Cover Photo</span>
              </div>
            )}
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

      {/* Profile Avatar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-[#0E121A] ring-2 ring-white/10 bg-[#151C25] group cursor-pointer shadow-xl"
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-black text-2xl text-white bg-gradient-to-br from-[#242C3D] via-[#151B26] to-[#0A0D14]">
              {initial}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading === 'profile_image' ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              <Camera size={20} className="text-white" />
            )}
          </div>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'profile_image')}
        />
        <div>
          <h4 className="text-sm font-bold text-white">Profile Photo</h4>
          <p className="text-xs text-zinc-400 mt-0.5">Click the photo to upload a new avatar. JPG, PNG or WebP.</p>
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full Name">
          <input
            type="text"
            value={fields.username}
            onChange={(e) => setFields((f) => ({ ...f, username: e.target.value }))}
            className={inputClass}
            placeholder="e.g. Fonyuy Gita"
            required
          />
        </Field>
        <Field label="Phone Number (Optional)">
          <input
            type="tel"
            value={fields.phone}
            onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value }))}
            className={inputClass}
            placeholder="+237 6XX XXX XXX"
          />
        </Field>
        <Field label="Region">
          <input
            type="text"
            value={fields.region}
            onChange={(e) => setFields((f) => ({ ...f, region: e.target.value }))}
            className={inputClass}
            placeholder="e.g. North West, Littoral"
          />
        </Field>
        <Field label="Village / Origin">
          <input
            type="text"
            value={fields.village}
            onChange={(e) => setFields((f) => ({ ...f, village: e.target.value }))}
            className={inputClass}
            placeholder="e.g. Bamenda, Douala"
          />
        </Field>
        <Field label="Language Preference">
          <input
            type="text"
            value={fields.languagePreference}
            onChange={(e) => setFields((f) => ({ ...f, languagePreference: e.target.value }))}
            className={inputClass}
            placeholder="e.g. English, French, Pidgin"
          />
        </Field>
        <Field label="Favorite Genres (comma separated)">
          <input
            type="text"
            value={genresInput}
            onChange={(e) => setGenresInput(e.target.value)}
            placeholder="Drama, Comedy, Action, Music"
            className={inputClass}
          />
        </Field>
      </div>

      {/* Bio */}
      <Field label="Bio & Tagline">
        <textarea
          value={fields.bio}
          onChange={(e) => setFields((f) => ({ ...f, bio: e.target.value }))}
          rows={3}
          className={inputClass}
          placeholder="Tell the community about yourself or your favorite cultural stories..."
          maxLength={500}
        />
      </Field>

      {/* Social Links */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Social Links (Optional)</p>
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

      {/* Form Action Buttons — Light / White Save Changes button */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-100 text-[#0E121A] px-7 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin text-zinc-700" />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-[#11151C] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-white/30 transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
