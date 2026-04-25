'use client';
import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../lib/apiConfig';
import Link from 'next/link';
import {
  Film,
  Music,
  User,
  Download,
  FileText,
  Workflow,
  Wallet,
  Home,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '../../utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import SawaflixLogo from '../SawaflixLogo';

// Define a type for the user profile data from your 'users' table
type UserProfileData = {
  username: string | null;
  email: string | null;
  profile_image_url: string | null;
};

export default function LeftSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  const [verificationStatus, setVerificationStatus] = useState<string>('none');

  // Fetch user session and profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user || null);

      if (user && session) {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('users')
          .select('username, email, profile_image_url')
          .eq('id', user.id)
          .single<UserProfileData>();

        if (profileData) {
          setUserProfile(profileData);
        }

        // Fetch verification status
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setVerificationStatus(data.verificationStatus);
          }
        } catch (err) {
          console.error('Error fetching verification status:', err);
        }
      }
    };

    fetchUserData();

    // Poll for status every 5 seconds if none to ensure instant update after submission
    const interval = setInterval(() => {
        if (verificationStatus === 'none') {
            fetchUserData();
        }
    }, 5000);

    return () => clearInterval(interval);
  }, [verificationStatus]);

  const menuItems = [
    { name: 'Feed', icon: Home, id: 'feed', route: '/dashboard', badge: null },
    { name: 'Movies', icon: Film, id: 'movies', route: '/dashboard/movie', badge: null },
    { name: 'Music', icon: Music, id: 'music', route: '/dashboard/musicpage', badge: 'New' },
    { name: 'Artists', icon: User, id: 'artists', route: '/dashboard/artists', badge: null },
    { name: 'Area Tory', icon: FileText, id: 'blogs', route: '/dashboard/blogs', badge: null },
    { name: 'Wallet', icon: Wallet, id: 'wallet', route: '/dashboard/wallet', badge: null },
  ];

  // Add "Create Content" link based on verification status
  if (!menuItems.find(item => item.id === 'create-content')) {
    let route = '/creator/verify'; // Default apply
    let badge: string | null = 'Apply';

    if (verificationStatus === 'pending') {
      route = '/creator/pending';
      badge = 'Pending';
    } else if (verificationStatus === 'approved') {
      route = '/creator-dashboard';
      badge = null;
    } else if (verificationStatus === 'rejected') {
      route = '/creator/verify'; // Re-apply
      badge = 'Apply';
    }

    menuItems.push({
      name: 'Create Content',
      icon: Workflow,
      id: 'create-content',
      route: route,
      badge: badge
    });
  }

  const smart = [
    { name: 'SawaSmart', icon: Workflow, id: 'SawaSmart', route: '/dashboard/sawasmart', badge: null },
  ]

  const handleItemClick = () => {
    // Close sidebar on mobile when navigating
    onNavigate?.();
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0E14] border-r border-white/5">
      {/* Logo Section */}
      {/* <div className="p-6 pb-2">
        <SawaflixLogo />
      </div> */}

      <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto scrollbar-none">
        <div className="mb-6 px-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            Main navigation
          </p>
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.route;

          return (
            <Link
              key={item.id}
              href={item.route}
              onClick={handleItemClick}
              className={`flex items-center justify-between w-full px-5 py-3.5 rounded-xl transition-all duration-300 group cursor-pointer ${isActive
                  ? 'bg-white text-black shadow-2xl shadow-white/10 translate-x-1'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'
                }`}
            >
              <div className="flex items-center space-x-4">
                <Icon
                  size={18}
                  className={`transition-colors ${isActive ? 'text-black' : 'text-gray-500 group-hover:text-white'}`}
                />
                <span className={`text-sm font-bold tracking-tight ${isActive ? 'font-black' : ''}`}>
                  {item.name}
                </span>
              </div>

              {item.badge && (
                <span className={`px-2 py-0.5 text-[9px] rounded-md font-black uppercase tracking-widest ${isActive
                    ? 'bg-black text-white'
                    : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4 border-t border-white/5">
        <div className="px-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            Intelligent features
          </p>
        </div>
        {smart.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.route;

          return (
            <Link
              key={item.id}
              href={item.route}
              onClick={handleItemClick}
              className={`flex items-center justify-between w-full px-5 py-3.5 rounded-xl transition-all duration-300 group cursor-pointer ${isActive
                  ? 'bg-white text-black shadow-2xl shadow-white/10 translate-x-1'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'
                }`}
            >
              <div className="flex items-center space-x-4">
                <Icon
                  size={18}
                  className={`transition-colors ${isActive ? 'text-black' : 'text-gray-500 group-hover:text-white'}`}
                />
                <span className={`text-sm font-bold tracking-tight ${isActive ? 'font-black' : ''}`}>{item.name}</span>
              </div>

              {item.badge && (
                <span className={`px-2 py-0.5 text-[9px] rounded-md font-black uppercase tracking-widest ${isActive
                    ? 'bg-black text-white'
                    : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        
        <Link href="/dashboard/profile" onClick={() => onNavigate?.()}>
          <div className={`flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all duration-300 cursor-pointer border ${pathname === '/dashboard/profile' 
            ? 'bg-white text-black border-white shadow-2xl shadow-white/10' 
            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
          }`}>
            {userProfile?.profile_image_url ? (
              <div className="w-9 h-9 rounded-full shrink-0 relative overflow-hidden aspect-square border-2 border-black/10">
                <Image
                  src={userProfile.profile_image_url}
                  alt="Profile"
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${pathname === '/dashboard/profile' ? 'bg-black' : 'bg-red-600'}`}>
                <User size={14} className="text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm truncate ${pathname === '/dashboard/profile' ? 'text-black' : 'text-white'}`}>
                {userProfile?.username || 'Guest'}
              </p>
              <p className="text-[10px] text-gray-500 truncate font-medium">
                {userProfile?.email || 'N/A'}
              </p>
            </div>
          </div>
        </Link>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-red-400 font-bold">128</div>
            <div className="text-gray-400">Movies</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-red-400 font-bold">64</div>
            <div className="text-gray-400">Songs</div>
          </div>
        </div>
      </div>
    </div>
  );
}