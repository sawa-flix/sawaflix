import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '../../../../utils/supabase/server'; 
import { MusicFeatures } from '../../../../components/MusicFeatures';
import { 
    Users, Play, Video, MapPin, Calendar, 
    Award, Share2, Edit3, Settings, 
    ArrowRight, Heart, ListMusic
} from 'lucide-react';

type UserProfileData = {
  username: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  created_at: string;
};

const DEFAULT_PROFILE_IMAGE = '/default-profile-pic.jpg';
const DEFAULT_BIO = 'Passionate about discovering new music and sharing great vibes. Love everything from indie rock to electronic beats.';

const UserProfilePage = async () => {
  const cookieStore = cookies();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
        <div className="min-h-screen bg-[#06080C] flex items-center justify-center">
            <Link href="/login" className="px-8 py-3 bg-red-600 text-white rounded-full font-black text-xs uppercase tracking-widest">
                Please Login
            </Link>
        </div>
    );
  }

  const { data: profile } = await supabase
    .from('users')
    .select('username, profile_image_url, cover_image_url, bio, created_at')
    .eq('id', user.id)
    .single<UserProfileData>();

  // Placeholder data for stats and ecosystem
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
    <div className="min-h-screen bg-[#06080C] text-white font-sans selection:bg-red-600/30 pb-32">
      {/* Premium Header / Banner */}
      <div className="relative h-64 md:h-[400px] w-full overflow-hidden">
        {profile?.cover_image_url ? (
          <Image 
            src={profile.cover_image_url} 
            alt="Profile Cover" 
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#0B0E14] to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-black/20" />
        
        {/* Quick Actions */}
        <div className="absolute top-8 right-8 flex gap-3">
          <Link href="/dashboard/settings">
            <button className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </Link>
          <Link href="/dashboard/edit-profile">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/5">
                <Edit3 className="w-4 h-4" />
                Customize
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Info Overlay */}
        <div className="relative -mt-24 flex flex-col md:flex-row items-start md:items-end gap-8 pb-12 border-b border-white/5">
            <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-red-600 to-red-900 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-[2.8rem] border-[8px] border-[#06080C] overflow-hidden bg-[#10141D] shadow-3xl">
                    <Image 
                        src={profile?.profile_image_url || DEFAULT_PROFILE_IMAGE} 
                        alt="Profile" 
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            </div>

            <div className="flex-1 space-y-4 pt-4 md:pt-0">
                <div className="space-y-1">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                        {profile?.username || 'User Identity'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-red-600" /> Global Listener</span>
                        <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-red-600" /> Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
                
                <div className="max-w-2xl bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                    <p className="text-zinc-400 font-medium leading-relaxed italic text-sm">
                        "{profile?.bio || DEFAULT_BIO}"
                    </p>
                </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 w-full md:w-auto">
                <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                    <Heart className="w-5 h-5 text-red-600 mb-2" />
                    <p className="text-xl font-black">1.2K</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Likes</p>
                </div>
                <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                    <ListMusic className="w-5 h-5 text-red-600 mb-2" />
                    <p className="text-xl font-black">12</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Playlists</p>
                </div>
            </div>
        </div>

        {/* Music Ecosystem - Integrated Experience */}
        <div className="mt-16 space-y-16">
            {/* Ecosystem Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Your Music Ecosystem</h3>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Discoveries and curated vibes</p>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-500 transition-all">
                    Explore Network <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="bg-[#0B0E14] rounded-[3.5rem] p-1 md:p-2 border border-white/5 shadow-2xl">
              <MusicFeatures 
                playlists={playlists} 
                recommendedSongs={recommendedSongs} 
                favoriteSongs={favoriteSongs} 
              />
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;