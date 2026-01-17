import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';

// The createClient function for server components
import { createClient } from '../../../../utils/supabase/server'; 

import { MusicFeatures } from '../../../../components/MusicFeatures';

// Define a type for the user profile data
type UserProfileData = {
  full_name: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
};

const DEFAULT_PROFILE_IMAGE = '/default-profile-pic.jpg';
const DEFAULT_COVER_IMAGE = '/hero-bg.png';
const DEFAULT_BIO = 'Passionate about discovering new music and sharing great vibes. Love everything from indie rock to electronic beats.';

const MusicProfilePage = async () => {

  const cookieStore = cookies()
  // Await the createClient() call
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, profile_image_url, cover_image_url, bio')
    .eq('id', user.id)
    .single<UserProfileData>();

  // ... rest of your component code remains the same
  const playlists = [
    { id: 1, name: 'My Favorites', songs: 25, cover: '/avenge.jpg' },
    { id: 2, name: 'Workout Mix', songs: 18, cover: '/r3.jpg' },
    { id: 3, name: 'Chill Vibes', songs: 32, cover: '/music.jpg' },
    { id: 4, name: 'Road Trip', songs: 28, cover: '/mfy4.jpg' }
  ];
  const recommendedSongs = [
    { id: 1, title: 'Avengers', artist: 'Luna Valley', duration: '3:42', cover: '/avenge.jpg' },
    { id: 2, title: 'Black Panther', artist: 'Neon Waves', duration: '4:15', cover: '/black.jpg' },
    { id: 3, title: 'Doctor Strange', artist: 'Coastal Drift', duration: '3:28', cover: '/docstrange.jpg' },
    { id: 4, title: 'Green Light', artist: 'Benylee', duration: '3:56', cover: '/Greenlight.jpg' }
  ];
  const favoriteSongs = [
    { id: 1, title: 'Golden Hour', artist: 'Magasco', duration: '4:22', cover: '/magasco.jpg' },
    { id: 2, title: 'You are you', artist: 'Dejavu', duration: '3:33', cover: '/mfy1.jpg' },
    { id: 3, title: 'Mountain High', artist: 'Valley Echo', duration: '4:01', cover: '/john.jpg' },
    { id: 4, title: 'Ocean Waves', artist: 'Benylee', duration: '3:47', cover: '/Gene.jpg' }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Section with Background */}
        <div className="relative mb-20">
          <div
            className="relative rounded-lg shadow-lg overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url('${profile?.cover_image_url || DEFAULT_COVER_IMAGE}')` }}
          >
            <div className="absolute inset-0 bg-opacity-40"></div>
            <div className="relative z-10 p-6 md:p-8 pb-16 md:pb-20 text-white flex justify-end items-end">
              <Link href="/updateProfile">
                <button className="bg-red-500 px-3 py-1 rounded-full text-xs cursor-pointer">
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>
          {/* Profile Image */}
          <div className="absolute bottom-0 left-6 md:left-8 transform translate-y-1/2">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image 
                src={profile?.profile_image_url || DEFAULT_PROFILE_IMAGE} 
                alt="Profile" 
                width={160} 
                height={160} 
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
          </div>
        </div>
        
        {/* User Info Section */}
        <div className="pl-6 md:pl-8 mt-20">
          <h2 className="text-3xl md:text-xl font-bold mb-2 text-white">
            {profile?.full_name || 'Anonymous User'}
          </h2>
          <p className="text-purple-50 max-w-2xl">
            {profile?.bio || DEFAULT_BIO}
          </p>
        </div>

        {/* The interactive sections are now a separate component */}
        <MusicFeatures 
          playlists={playlists} 
          recommendedSongs={recommendedSongs} 
          favoriteSongs={favoriteSongs} 
        />
        
      </div>
    </div>
  );
};

export default MusicProfilePage;