import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '../../../../utils/supabase/server';
import Link from 'next/link';

// Components
import ProfileHero from '../../../../components/profile/ProfileHero';
import ProfileStatBar from '../../../../components/profile/ProfileStatBar';
import PersonalInfoCard from '../../../../components/profile/cards/PersonalInfoCard';
import SubscriptionCard from '../../../../components/profile/cards/SubscriptionCard';
import ViewingPrefsCard from '../../../../components/profile/cards/ViewingPrefsCard';
import SecurityCard from '../../../../components/profile/cards/SecurityCard';
import NotificationCard from '../../../../components/profile/cards/NotificationCard';
import ProfileRecentlyWatched from '../../../../components/profile/ProfileRecentlyWatched';
import TasteProfile from '../../../../components/profile/TasteProfile';
import ProfileContinuePlaying from '../../../../components/profile/ProfileContinuePlaying';

type UserProfileData = {
  id: string;
  username: string | null;
  email: string | null;
  phone?: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  created_at: string;
  region?: string | null;
  ethnic_group?: string | null;
  village?: string | null;
  language_preference?: string | null;
  location_region?: string | null;
  favored_genres?: string[] | null;
};

const UserProfilePage = async () => {
  const cookieStore = cookies();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#06080C] flex items-center justify-center">
        <Link
          href="/login"
          className="px-8 py-3 bg-[#CE1126] text-white rounded-full font-bold text-sm hover:bg-red-700 transition"
        >
          Please Login
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('users')
    .select(`
      id,
      username,
      email,
      phone,
      profile_image_url,
      cover_image_url,
      bio,
      created_at,
      region,
      ethnic_group,
      village,
      language_preference,
      location_region,
      favored_genres
    `)
    .eq('id', user.id)
    .single<UserProfileData>();

  return (
    <div className="min-h-screen bg-[#06080C] text-white font-sans pb-32" style={{ zoom: '0.85' }}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* 1. Hero Section */}
        <ProfileHero
          username={profile?.username ?? null}
          profileImageUrl={profile?.profile_image_url ?? null}
          coverImageUrl={profile?.cover_image_url ?? null}
          bio={profile?.bio ?? null}
          createdAt={profile?.created_at ?? new Date().toISOString()}
          region={profile?.location_region ?? profile?.region ?? null}
          isPremium={true}
        />

        {/* 2. Stats Bar */}
        <ProfileStatBar />

        {/* 3. Info Grid — 2 cols on tablet, 5 cols on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <PersonalInfoCard
            username={profile?.username}
            email={profile?.email ?? user.email}
            phone={profile?.phone}
            region={profile?.region ?? profile?.location_region}
            language={profile?.language_preference}
            country={profile?.ethnic_group ?? 'Cameroon'}
          />
          <SubscriptionCard />
          <ViewingPrefsCard
            favoriteGenres={profile?.favored_genres ?? ['Drama', 'Comedy', 'Romance']}
          />
          <NotificationCard userId={user.id} />
          <SecurityCard />
        </div>

        {/* 4. Three Column Section - Taste Profile | Recently Watched | Continue Watching */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Taste Profile */}
          <div className="bg-[#0E121A] border border-white/5 rounded-xl p-5">
            <TasteProfile />
          </div>

          {/* Center Column - Recently Watched */}
          <div className="bg-[#0E121A] border border-white/5 rounded-xl p-5">
            <ProfileRecentlyWatched />
          </div>

          {/* Right Column - Continue Watching */}
          <div className="bg-[#0E121A] border border-white/5 rounded-xl p-5">
            <ProfileContinuePlaying />
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;