'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { computeProfileCompletion } from '@/utils/profile/profileHelpers';
import type { ProfileData } from '@/types/profile';

type Draft = Pick<ProfileData, 'username' | 'bio' | 'profileImageUrl' | 'coverImageUrl' | 'region' | 'village' | 'languagePreference' | 'favoredGenres' | 'socialLinks' | 'website'>;

const STEPS = ['About you', 'Local picks', 'Your links'];
const GENRES = ['Drama', 'Comedy', 'Action', 'Romance', 'Music', 'Documentary', 'Culture', 'Family'];

interface Props {
  userId: string;
  email: string | null;
  displayName: string;
  onVisibilityChange: (visible: boolean) => void;
}

const emptyDraft = (displayName: string): Draft => ({
  username: displayName,
  bio: '',
  profileImageUrl: null,
  coverImageUrl: null,
  region: '',
  village: '',
  languagePreference: 'English',
  favoredGenres: [],
  socialLinks: {},
  website: '',
});

export default function ProfileCompletionWizard({ userId, email, displayName, onVisibilityChange }: Props) {
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(displayName));
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      let profile: Record<string, unknown> | null = null;
      try {
        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from('users')
          .select('username, bio, profile_image_url, cover_image_url, region, village, language_preference, favored_genres, social_links')
          .eq('id', userId)
          .maybeSingle();
        if (queryError) throw queryError;
        profile = data;
      } catch (loadError) {
        console.warn('Profile completion prompt could not load profile details:', loadError);
      }
      if (!active) return;

      const socialLinks = cleanLinks(profile?.social_links);
      setDraft({
        ...emptyDraft(displayName),
        username: stringValue(profile?.username) || displayName,
        bio: stringValue(profile?.bio),
        profileImageUrl: stringValue(profile?.profile_image_url) || null,
        coverImageUrl: stringValue(profile?.cover_image_url) || null,
        region: stringValue(profile?.region),
        village: stringValue(profile?.village),
        languagePreference: stringValue(profile?.language_preference) || 'English',
        favoredGenres: Array.isArray(profile?.favored_genres) ? profile.favored_genres.filter((item): item is string => typeof item === 'string') : [],
        socialLinks,
        website: socialLinks.website || '',
      });
      setReady(true);
    };
    void load();
    return () => { active = false; };
  }, [displayName, userId]);

  const completion = computeProfileCompletion({
    ...draft,
    id: userId,
    email,
    createdAt: '',
    verified: false,
    ethnicGroup: null,
    phone: null,
    role: null,
    isApprovedCreator: false,
    isPendingCreator: false,
  });

  useEffect(() => {
    if (ready) onVisibilityChange(completion.percent < 100);
    return () => onVisibilityChange(false);
  }, [completion.percent, onVisibilityChange, ready]);

  const updateSocial = (key: string, value: string) => {
    setDraft((current) => ({ ...current, socialLinks: { ...current.socialLinks, [key]: value } }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const supabase = createClient();
      const socialLinks = cleanLinks({ ...draft.socialLinks, website: draft.website.trim() });
      const values = {
        username: draft.username.trim(),
        bio: draft.bio?.trim() || '',
        region: draft.region?.trim() || '',
        village: draft.village?.trim() || '',
        language_preference: draft.languagePreference || 'English',
        favored_genres: draft.favoredGenres,
        social_links: socialLinks,
        updated_at: new Date().toISOString(),
      };
      const { data, error: updateError } = await supabase
        .from('users')
        .update(values)
        .eq('id', userId)
        .select('id')
        .maybeSingle();
      if (updateError) throw updateError;
      if (!data) {
        const { error: insertError } = await supabase.from('users').upsert({ id: userId, email, ...values }, { onConflict: 'id' });
        if (insertError) throw insertError;
      }
      const nextDraft = { ...draft, socialLinks, website: draft.website.trim() };
      setDraft(nextDraft);
      const nextCompletion = computeProfileCompletion({
        ...nextDraft,
        id: userId,
        email,
        createdAt: '',
        verified: false,
        ethnicGroup: null,
        phone: null,
        role: null,
        isApprovedCreator: false,
        isPendingCreator: false,
      });
      if (nextCompletion.percent === 100) {
        setOpen(false);
        setStep(0);
      } else {
        setSaved(true);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Your profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (!ready || completion.percent >= 100) return null;

  return (
    <>
      <div className="relative z-40 mt-14 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 px-3 py-2 shadow-lg backdrop-blur-md sm:px-6">
        <button
          type="button"
          onClick={() => { setOpen(true); setError(''); setSaved(false); }}
          className="mx-auto flex w-full max-w-6xl items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors hover:bg-[color:var(--surface-hover)]"
          aria-label={`Complete your profile, ${completion.percent}% complete`}
        >
          <ProgressRing percent={completion.percent} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-[color:var(--foreground)] sm:text-sm">Complete your profile</span>
            <span className="block truncate text-[10px] text-[color:var(--muted-foreground)] sm:text-xs">Add a few details for better local recommendations</span>
          </span>
          <span className="shrink-0 text-[10px] font-bold text-[color:var(--primary)] sm:text-xs">{completion.percent}%</span>
          <ArrowRight size={15} className="shrink-0 text-[color:var(--muted-foreground)]" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
            <motion.button type="button" aria-label="Close profile completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm" />
            <motion.section role="dialog" aria-modal="true" aria-labelledby="profile-completion-title" initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="relative z-10 flex max-h-[min(720px,92dvh)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
              <header className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] px-5 py-4 sm:px-7">
                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-[color:var(--primary)]"><MapPin size={12} /> Local recommendations</p>
                  <h2 id="profile-completion-title" className="text-lg font-black">Complete your profile</h2>
                  <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">Tell us what you enjoy and where you are from.</p>
                </div>
                <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-2 text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-hover)]"><X size={17} /></button>
              </header>
              <div className="border-b border-[color:var(--border)] px-5 py-3 sm:px-7">
                <div className="mb-2 flex justify-between text-[10px] font-semibold text-[color:var(--muted-foreground)]"><span>{STEPS[step]}</span><span>Step {step + 1} of {STEPS.length} · {completion.percent}%</span></div>
                <div className="flex gap-1.5">{STEPS.map((label, index) => <span key={label} className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-[color:var(--primary)]' : 'bg-[color:var(--border)]'}`} />)}</div>
              </div>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
                {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}
                {saved && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">Saved. Complete the remaining details when you’re ready.</p>}
                {step === 0 && <>
                  <Field label="Name"><input value={draft.username} onChange={(event) => setDraft((current) => ({ ...current, username: event.target.value }))} className={inputClass} /></Field>
                  <Field label="Bio"><textarea rows={4} maxLength={500} value={draft.bio || ''} onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))} className={inputClass} placeholder="What do you enjoy watching or sharing?" /></Field>
                </>}
                {step === 1 && <>
                  <div className="grid gap-4 sm:grid-cols-2"><Field label="Region"><input value={draft.region || ''} onChange={(event) => setDraft((current) => ({ ...current, region: event.target.value }))} className={inputClass} placeholder="e.g. Littoral" /></Field><Field label="Town or village"><input value={draft.village || ''} onChange={(event) => setDraft((current) => ({ ...current, village: event.target.value }))} className={inputClass} placeholder="e.g. Douala" /></Field></div>
                  <Field label="Preferred language"><select value={draft.languagePreference || 'English'} onChange={(event) => setDraft((current) => ({ ...current, languagePreference: event.target.value }))} className={inputClass}>{['English', 'French', 'Pidgin', 'Douala', 'Bassa', 'Other'].map((language) => <option key={language}>{language}</option>)}</select></Field>
                  <fieldset><legend className="mb-2 text-[10px] font-bold uppercase text-[color:var(--muted-foreground)]">Favorite genres</legend><div className="flex flex-wrap gap-2">{GENRES.map((genre) => { const selected = draft.favoredGenres.includes(genre); return <button type="button" key={genre} aria-pressed={selected} onClick={() => setDraft((current) => ({ ...current, favoredGenres: selected ? current.favoredGenres.filter((item) => item !== genre) : [...current.favoredGenres, genre] }))} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${selected ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-white' : 'border-[color:var(--border)] text-[color:var(--foreground-secondary)] hover:bg-[color:var(--surface-hover)]'}`}>{genre}</button>; })}</div></fieldset>
                </>}
                {step === 2 && <>
                  <Field label="Website"><input type="url" value={draft.website || ''} onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))} className={inputClass} placeholder="https://yoursite.com" /></Field>
                  {(['instagram', 'youtube'] as const).map((key) => <Field key={key} label={key === 'instagram' ? 'Instagram' : 'YouTube'}><input type="url" value={draft.socialLinks?.[key] || ''} onChange={(event) => updateSocial(key, event.target.value)} className={inputClass} placeholder={key === 'instagram' ? 'https://instagram.com/you' : 'https://youtube.com/@you'} /></Field>)}
                </>}
              </div>
              <footer className="flex items-center justify-between gap-3 border-t border-[color:var(--border)] px-5 py-4 sm:px-7">
                <button type="button" disabled={step === 0 || saving} onClick={() => { setStep((current) => Math.max(0, current - 1)); setSaved(false); }} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-hover)] disabled:opacity-40"><ArrowLeft size={14} /> Previous</button>
                <div className="flex items-center gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[color:var(--muted-foreground)]">Finish later</button>{step < STEPS.length - 1 ? <button type="button" onClick={() => { setStep((current) => Math.min(STEPS.length - 1, current + 1)); setSaved(false); }} className="inline-flex items-center gap-1 rounded-lg bg-[color:var(--foreground)] px-4 py-2 text-xs font-bold text-[color:var(--background)]">Next <ArrowRight size={14} /></button> : <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex items-center gap-1 rounded-lg bg-[color:var(--primary)] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{saving ? 'Saving' : 'Save profile'}</button>}</div>
              </footer>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  return <svg width="34" height="34" viewBox="0 0 36 36" className="shrink-0 -rotate-90" role="img" aria-label={`${percent}% profile complete`}><circle cx="18" cy="18" r={radius} fill="none" stroke="var(--border)" strokeWidth="3" /><circle cx="18" cy="18" r={radius} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} className="transition-[stroke-dashoffset] duration-500" /><text x="18" y="18" textAnchor="middle" dominantBaseline="central" className="rotate-90 origin-center fill-[color:var(--foreground)] text-[8px] font-bold">{percent}</text></svg>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase text-[color:var(--muted-foreground)]">{label}</span>{children}</label>;
}

const inputClass = 'w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--input-bg)] px-3.5 py-2.5 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted-foreground)] focus:border-[color:var(--primary)]';

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function cleanLinks(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0));
}