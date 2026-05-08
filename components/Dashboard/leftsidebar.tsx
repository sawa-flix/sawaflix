'use client';
import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../lib/apiConfig';
import Link from 'next/link';
import {
  Film,
  Music,
  User,
  FileText,
  Workflow,
  Wallet,
  Home,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '../../utils/supabase/client';
import { usePathname } from 'next/navigation';

// Define a type for the user profile data from your 'users' table
type UserProfileData = {
  username: string | null;
  email: string | null;
  profile_image_url: string | null;
};

export default function LeftSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  const [verificationStatus, setVerificationStatus] = useState<string>('none');

  // Fetch user session and profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

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
          const res = await fetch(`${BACKEND_URL}/api/creator/profile`, {
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

  const topItems = [
    { name: 'Home', icon: Home, id: 'feed', route: '/dashboard', badge: null },
  ];

  const exploreItems = [
    { name: 'Movies', icon: Film, id: 'movies', route: '/dashboard/movie', badge: null },
    { name: 'Music', icon: Music, id: 'music', route: '/dashboard/musicpage', badge: 'New' },
    { name: 'Artists', icon: User, id: 'artists', route: '/dashboard/artists', badge: null },
    { name: 'Area Tory', icon: FileText, id: 'blogs', route: '/dashboard/blogs', badge: null },
  ];

  const youItems: any[] = [
    { 
      name: 'Your profile', 
      icon: userProfile?.profile_image_url ? null : User, 
      imageUrl: userProfile?.profile_image_url,
      id: 'profile', 
      route: '/dashboard/profile', 
      badge: null 
    },
    { name: 'Wallet', icon: Wallet, id: 'wallet', route: '/dashboard/wallet', badge: null },
    { name: 'SawaSmart', icon: Workflow, id: 'SawaSmart', route: '/dashboard/sawasmart', badge: null },
  ];

  // Add "Create Content" link based on verification status
  if (!youItems.find(item => item.id === 'create-content')) {
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

    youItems.push({
      name: 'Create Content',
      icon: Workflow,
      id: 'create-content',
      route: route,
      badge: badge
    });
  }

  const handleItemClick = () => {
    // Close sidebar on mobile when navigating
    onNavigate?.();
  };

  const renderItem = (item: any) => {
    const Icon = item.icon;
    const isActive = item.route === '/dashboard' 
      ? pathname === '/dashboard' 
      : pathname?.startsWith(item.route);

    return (
      <Link
        key={item.id}
        href={item.route}
        onClick={handleItemClick}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${isActive
            ? 'bg-white/10 text-white font-medium'
            : 'text-[#AAAAAA] hover:bg-white/10 hover:text-white'
          }`}
      >
        <div className="flex items-center space-x-4">
          {item.imageUrl ? (
            <div className="w-5 h-5 rounded-full overflow-hidden relative shrink-0">
              <Image src={item.imageUrl} alt="Profile" fill className="object-cover" unoptimized />
            </div>
          ) : (
            Icon && <Icon
              size={20}
              className={`transition-colors shrink-0 ${isActive ? 'text-white' : 'text-[#AAAAAA] group-hover:text-white'}`}
            />
          )}
          <span className={`text-sm tracking-tight ${isActive ? 'font-semibold' : ''}`}>
            {item.name}
          </span>
        </div>

        {item.badge && (
          <span className={`px-2 py-0.5 text-[9px] rounded-md font-black uppercase tracking-widest ${isActive
              ? 'bg-white text-black'
              : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
            }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0E14] border-r border-white/5">
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {/* Top Section */}
        <div className="space-y-1">
          {topItems.map(renderItem)}
        </div>

        <div className="border-t border-white/10 my-3"></div>

        {/* You Section */}
        <div className="space-y-1">
          <Link href="/dashboard/profile" onClick={() => onNavigate?.()} className="group flex items-center px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer w-fit mb-1">
            <span className="text-[15px] font-bold text-white">You</span>
            <ChevronRight size={18} className="ml-1 text-white" />
          </Link>
          {youItems.map(renderItem)}
        </div>
      </nav>
    </div>
  );
}