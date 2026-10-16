'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, LoaderCircle, MapPin, RotateCcw } from 'lucide-react';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { createClient } from '@/utils/supabase/client';
import { computeProfileCompletion } from '@/utils/profile/profileHelpers';

type LocationMarker = {
  id: number;
  name: string;
  region: string;
  village: string;
  x: number;
  y: number;
  latitude: number;
  longitude: number;
};

const MARKERS: LocationMarker[] = [
  { id: 1, name: 'Kousséri', region: 'Far North', village: 'Kousséri', x: 863.46, y: 123.63, latitude: 12.08, longitude: 15.03 },
  { id: 2, name: 'Maroua', region: 'Far North', village: 'Maroua', x: 797.04, y: 362.36, latitude: 10.59, longitude: 14.32 },
  { id: 3, name: 'Garoua', region: 'North', village: 'Garoua', x: 730.62, y: 582.61, latitude: 9.30, longitude: 13.40 },
  { id: 4, name: 'Ngaoundéré', region: 'Adamawa', village: 'Ngaoundéré', x: 597.78, y: 788.66, latitude: 7.32, longitude: 13.58 },
  { id: 5, name: 'Bafoussam', region: 'West', village: 'Bafoussam', x: 321.03, y: 866.81, latitude: 5.48, longitude: 10.42 },
  { id: 6, name: 'Yaoundé', region: 'Centre', village: 'Yaoundé', x: 564.57, y: 1016.01, latitude: 3.87, longitude: 11.52 },
  { id: 7, name: 'Bamenda', region: 'Northwest', village: 'Bamenda', x: 243.54, y: 1044.43, latitude: 5.96, longitude: 10.15 },
  { id: 8, name: 'Bertoua', region: 'East', village: 'Bertoua', x: 797.04, y: 1048.7, latitude: 4.58, longitude: 13.68 },
  { id: 9, name: 'Douala', region: 'Littoral', village: 'Douala', x: 376.38, y: 1271.8, latitude: 4.05, longitude: 9.77 },
  { id: 10, name: 'Ebolowa', region: 'South', village: 'Ebolowa', x: 686.34, y: 1271.8, latitude: 2.90, longitude: 11.15 },
  { id: 11, name: 'Kribi', region: 'South', village: 'Kribi', x: 940.95, y: 1300.22, latitude: 2.94, longitude: 9.91 },
];

const LOCATION_KEY = 'sawaflix:onboarding-location';

export default function CameroonMapOnboarding() {
  const { openAuthModal } = useAuthModal();
  const [selected, setSelected] = useState<LocationMarker | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState('Choose a place that feels like home.');
  const [saving, setSaving] = useState(false);

  const continueForUser = useCallback(async (userId: string, location: LocationMarker) => {
    setSaving(true);
    setMessage('Saving your location...');
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      const { data: row, error: queryError } = await supabase
        .from('users')
        .select('username, email, bio, profile_image_url, cover_image_url, region, village, language_preference, favored_genres, social_links')
        .eq('id', userId)
        .maybeSingle();

      if (queryError) throw queryError;

      const { error: saveError } = await supabase.from('users').upsert({
        id: userId,
        email: row?.email ?? user?.email ?? null,
        username: row?.username ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'User',
        region: location.region,
        village: location.village,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (saveError) throw saveError;

      const completion = computeProfileCompletion({
        id: userId,
        username: row?.username ?? '',
        email: row?.email ?? user?.email ?? null,
        bio: row?.bio ?? null,
        profileImageUrl: row?.profile_image_url ?? user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null,
        coverImageUrl: row?.cover_image_url ?? null,
        createdAt: user?.created_at ?? '',
        verified: false,
        region: location.region,
        village: location.village,
        ethnicGroup: null,
        languagePreference: row?.language_preference ?? null,
        favoredGenres: Array.isArray(row?.favored_genres) ? row.favored_genres : [],
        socialLinks: row?.social_links && typeof row.social_links === 'object' ? row.social_links as Record<string, string> : null,
        website: null,
        phone: null,
        role: null,
        isApprovedCreator: false,
        isPendingCreator: false,
      });

      setProfileComplete(completion.percent >= 100);
    } catch (error) {
      console.error('Could not save onboarding location:', error);
      setMessage('Your sign-in succeeded, but we could not save your location. You can update it from your profile.');
    }
    setSignedIn(true);
    setSaving(false);
    setShowNextStep(true);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const restore = async () => {
      try {
        const saved = localStorage.getItem(LOCATION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { id?: number };
          const marker = MARKERS.find((item) => item.id === parsed.id);
          if (marker && active) setSelected(marker);
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (active && user) setSignedIn(true);
      } catch (error) {
        console.warn('Could not restore onboarding state:', error);
      }
    };
    void restore();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session?.user) setSignedIn(true);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const chooseLocation = useCallback(async (location: LocationMarker) => {
    setSelected(location);
    setMessage('');
    localStorage.setItem(LOCATION_KEY, JSON.stringify({ id: location.id }));
  }, []);

  const continueWithLocation = useCallback(async () => {
    if (!selected) return;
    if (signedIn) {
      const { data: { user } } = await createClient().auth.getUser();
      if (user) await continueForUser(user.id, selected);
      return;
    }
    openAuthModal('to continue with your location', (userId) => continueForUser(userId, selected));
  }, [continueForUser, openAuthModal, selected, signedIn]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Location detection is unavailable. Select a marker on the map instead.');
      return;
    }
    setLocating(true);
    setMessage('Finding your nearest verified location...');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const nearest = MARKERS.map((marker) => ({
        marker,
        distance: Math.hypot(marker.latitude - coords.latitude, (marker.longitude - coords.longitude) * Math.cos(coords.latitude * Math.PI / 180)),
      })).sort((a, b) => a.distance - b.distance)[0];
      setLocating(false);
      if (!nearest || nearest.distance > 2.4) {
        setMessage('We could not match your location to a verified Cameroon marker. Please choose one manually.');
        return;
      }
      void chooseLocation(nearest.marker);
    }, (error) => {
      setLocating(false);
      if (!window.isSecureContext) {
        setMessage('Browser location requires HTTPS (or localhost). Open SawaFlix on a secure connection, or choose any marker on the map.');
        return;
      }
      if (error.code === error.PERMISSION_DENIED) {
        setMessage('Location access was declined. You can still select any place on the map.');
        return;
      }
      setMessage(error.code === error.TIMEOUT
        ? 'Location took too long to respond. Check that device location is on, then retry or choose a marker.'
        : 'Your location could not be read. Check browser and device location settings, or choose a marker on the map.');
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#100d1e] px-4 pb-8 pt-20 text-white sm:px-8 sm:pt-24">
      <Image src="/logos_and_pwas/sawai.svg" alt="" fill priority sizes="100vw" aria-hidden="true" className="pointer-events-none object-cover object-center opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,13,30,0.94)_0%,rgba(16,13,30,0.82)_54%,rgba(16,13,30,0.55)_100%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#100d1e]/35 via-transparent to-[#100d1e]/75" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[calc(100svh-7rem)] max-w-6xl items-center gap-5 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(20rem,1.2fr)] lg:gap-10">
        <section className="order-2 mx-auto w-full max-w-lg text-center lg:order-1 lg:text-left">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#85d7f4] sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5a3d]" /> Cameroon, connected</p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">Where is <span className="text-[#ff5a3d]">your story</span> rooted?</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/70 lg:mx-0">Pick your nearest place on the map. We’ll use it to bring local stories and voices closer to you.</p>
          <button type="button" onClick={detectLocation} disabled={locating || saving} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-[#85d7f4]/70 hover:bg-white/10 disabled:cursor-wait disabled:opacity-60">
            {locating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 text-[#85d7f4]" />}
            Use my location
          </button>
          <p aria-live="polite" className="mx-auto mt-3 min-h-10 max-w-md text-xs leading-5 text-white/60 lg:mx-0">{message}</p>
          {saving && <p role="status" className="mt-4 inline-flex items-center gap-2 text-xs text-white/70"><LoaderCircle className="h-4 w-4 animate-spin" /> Saving your selection</p>}
        </section>

        <section aria-label="Choose a location in Cameroon" className="order-1 mx-auto w-full max-w-[min(82vw,28rem)] lg:order-2 lg:max-w-[min(44vw,34rem)]">
          <div className="relative aspect-[1107/1421] w-full">
            <Image src="/sawaflix_cameroon_map.svg" alt="Map of Cameroon with selectable location markers" fill priority unoptimized sizes="(max-width: 768px) 82vw, 44vw" className="object-contain" />
            {MARKERS.map((marker, index) => {
              const isSelected = selected?.id === marker.id;
              return (
                <motion.button
                  key={marker.id}
                  type="button"
                  aria-label={`Choose ${marker.name}, ${marker.region}`}
                  aria-pressed={isSelected}
                  title={`${marker.name}, ${marker.region}`}
                  onClick={() => void chooseLocation(marker)}
                  disabled={saving}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.035, type: 'spring', stiffness: 280, damping: 18 }}
                  className={`absolute z-10 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 sm:h-10 sm:w-10 ${isSelected ? 'border-white bg-[#ff5a3d] shadow-[0_0_0_6px_rgba(255,90,61,0.24),0_0_32px_rgba(255,90,61,0.8)]' : 'border-[#dff6ff]/80 bg-[#1688ff]/55 shadow-[0_0_20px_rgba(22,136,255,0.55)] hover:scale-110 hover:bg-[#ff5a3d] hover:shadow-[0_0_26px_rgba(255,90,61,0.7)]'}`}
                  style={{ left: `${marker.x / 1107 * 100}%`, top: `${marker.y / 1421 * 100}%` }}
                >
                  <span className={`h-2.5 w-2.5 rounded-full border border-white ${isSelected ? 'bg-white' : 'bg-[#bceaff]'}`} />
                  {isSelected && <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-[#0b1020]/90 px-2 py-1 text-[10px] font-bold text-white">{marker.name}</span>}
                </motion.button>
              );
            })}
            <AnimatePresence>
              {selected && !saving && (
                <motion.div
                  role="group"
                  aria-label={showNextStep ? 'Choose what to do next' : `Confirm ${selected.name} as your location`}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="absolute bottom-4 left-1/2 z-20 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 rounded-xl border border-white/20 bg-[#11101c]/95 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:bottom-6 sm:p-5"
                >
                  {showNextStep ? (
                    <>
                      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#85d7f4]"><MapPin className="h-3.5 w-3.5" /> {selected.name} is on your map</div>
                      <p className="text-xl font-black leading-tight text-white sm:text-2xl">{profileComplete ? 'You’re all set. Where next?' : 'Make this yours?'}</p>
                      <p className="mt-1 text-xs text-white/60">{profileComplete ? 'Your account is ready.' : 'Personalize your local picks or jump in.'}</p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {!profileComplete && <Link href="/dashboard?completeProfile=1" className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ff806a] px-3 text-xs font-extrabold text-[#23110e] shadow-[0_8px_24px_rgba(255,128,106,0.28)] transition hover:bg-[#ff927f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-sm">Personalize <ArrowRight className="h-4 w-4" /></Link>}
                        <Link href="/dashboard" className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ff806a] px-3 text-xs font-extrabold text-[#23110e] shadow-[0_8px_24px_rgba(255,128,106,0.28)] transition hover:bg-[#ff927f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-sm">Explore <ArrowRight className="h-4 w-4" /></Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#85d7f4]"><MapPin className="h-3.5 w-3.5" /> Your story starts here</div>
                      <p className="text-xl font-black leading-tight text-white sm:text-2xl">Is {selected.name} your place?</p>
                      <p className="mt-1 text-xs text-white/60">{selected.region} Region · You can change this later.</p>
                      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                        <button type="button" onClick={() => void continueWithLocation()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#ff5a3d] px-3 text-xs font-extrabold text-white shadow-[0_8px_24px_rgba(255,90,61,0.28)] transition hover:bg-[#f34437] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-sm">{signedIn ? 'Continue to SawaFlix' : 'Yes, continue with Google'} <ArrowRight className="h-4 w-4" /></button>
                        <button type="button" aria-label="Choose another location" title="Choose another location" onClick={() => { setSelected(null); setMessage('Choose a place that feels like home.'); localStorage.removeItem(LOCATION_KEY); }} className="grid h-11 w-11 place-items-center rounded-lg border border-white/20 text-white/70 transition hover:border-white/50 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><RotateCcw className="h-4 w-4" /></button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Select a glowing marker, then confirm your place</p>
        </section>
      </div>
    </main>
  );
}