'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Film,
  Music,
  User,
  Download,
  FileText,
  Workflow,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '../../utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Define a type for the user profile data from your 'users' table
type UserProfileData = {
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
};

export default function LeftSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const [active, setActive] = useState('');
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  // Fetch user session and profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from('users')
          .select('full_name, email, profile_image_url')
          .eq('id', user.id)
          .single<UserProfileData>();

        if (error) {
          console.error('Error fetching user profile:', error.message);
        } else if (profileData) {
          setUserProfile(profileData);
        }
      }
    };

    fetchUserData();
  }, []);

  const menuItems = [
    { name: 'Movies', icon: Film, id: 'movies', route: '/dashboard/movie', badge: null },
    { name: 'Music', icon: Music, id: 'music', route: '/dashboard/musicPage', badge: 'New' },
    { name: 'Artists', icon: User, id: 'artists', route: '/dashboard/artists', badge: null },
    { name: 'Blogs', icon: FileText, id: 'blogs', route: '/dashboard/blogs', badge: null },
    { name: 'Wallet', icon: Wallet, id: 'wallet', route: '/dashboard/wallet', badge: null },
  ];

  const smart =[
    { name: 'SawaSmart', icon: Workflow, id: 'SawaSmart', route: '/dashboard/sawaSmart', badge: null },
  ]

  const handleItemClick = (itemId: string) => {
    setActive(itemId);
    // Close sidebar on mobile when navigating
    onNavigate?.();
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.route}
              onClick={() => handleItemClick(item.id)}
              className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20'
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  size={20} 
                  className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} 
                />
                <span className="font-medium">{item.name}</span>
              </div>
              
              {item.badge && (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
      {smart.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.route}
              onClick={() => handleItemClick(item.id)}
              className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20'
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  size={20} 
                  className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} 
                />
                <span className="font-medium">{item.name}</span>
              </div>
              
              {item.badge && (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <Link href="/dashboard/profile" onClick={() => onNavigate?.()}>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-800 mt-5 to-gray-750 hover:from-gray-750 hover:to-gray-700 transition-all cursor-pointer">
            {userProfile?.profile_image_url ? (
              <div className="w-10 h-10 rounded-full flex-shrink-0 relative overflow-hidden">
                <Image
                  src={userProfile.profile_image_url}
                  alt="Profile"
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">
                {userProfile?.full_name || 'Guest'}
              </p>
              <p className="text-xs text-gray-400 truncate">
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