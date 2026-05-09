'use client';
import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../lib/apiConfig';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  LayoutGrid,
  Upload,
  BarChart2,
  MessageSquare,
  Film,
  Music,
  User,
  FileText,
  Workflow,
  Wallet,
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

export default function LeftSidebar({ 
  onNavigate, 
  verificationStatus: propStatus,
  userProfile: propProfile
}: { 
  onNavigate?: () => void;
  verificationStatus?: string;
  userProfile?: any;
}) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(propProfile || null);
  const [verificationStatus, setVerificationStatus] = useState<string>(propStatus || 'none');

  // Update local state if props change
  useEffect(() => {
    if (propStatus) setVerificationStatus(propStatus);
  }, [propStatus]);

  useEffect(() => {
    if (propProfile) setUserProfile(propProfile);
  }, [propProfile]);

  // Fallback fetching if props are missing (e.g. standalone usage)
  useEffect(() => {
    if (propStatus && propProfile) return; // Skip if we have props

    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && session) {
        if (!propProfile) {
            const { data: profileData } = await supabase
              .from('users')
              .select('username, email, profile_image_url')
              .eq('id', user.id)
              .single<UserProfileData>();

            if (profileData) {
              setUserProfile(profileData);
            }
        }

        if (!propStatus) {
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
      }
    };

    fetchUserData();
  }, [propStatus, propProfile, verificationStatus]);

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

  // Add "Creator Hub" link to "You" section ONLY if NOT approved
  // If approved, it will have its own section after Explore
  if (verificationStatus?.toLowerCase() !== 'approved' && !youItems.find(item => item.id === 'create-content')) {
    let route = '/creator/verify'; // Default apply
    let badge: string | null = 'Apply';

    if (verificationStatus?.toLowerCase() === 'pending') {
      route = '/creator/pending';
      badge = 'Pending';
    } else if (verificationStatus?.toLowerCase() === 'rejected') {
      route = '/creator/verify'; // Re-apply
      badge = 'Apply';
    }

    youItems.push({
      name: 'Creator Hub',
      icon: Workflow,
      id: 'create-content',
      route: route,
      badge: badge
    });
  }

  const creatorItems = [
    { name: 'Post', icon: LayoutGrid, id: 'post', route: '/creator-dashboard', badge: null },
    { name: 'Upload New', icon: Upload, id: 'upload', route: '/creator-dashboard/post/upload', badge: null },
    { name: 'My Content', icon: Film, id: 'my-content', route: '/creator-dashboard/content', badge: null },
    { name: 'Analytics', icon: BarChart2, id: 'analytics', route: '/creator-dashboard/analytics', badge: null },
    { name: 'Comments', icon: MessageSquare, id: 'comments', route: '/creator-dashboard/comments', badge: null },
  ];

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
          <span className={`px-2 py-0.5 text-[9px] rounded-md font-black uppercase tracking-widest bg-white text-black`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#06080C] border-r border-white/5">
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-none">
        {/* Top Section */}
        <div className="space-y-1 mb-6">
          {topItems.map(renderItem)}
        </div>

        {/* You Section */}
        <div className="space-y-1 mb-6">
          <Link href="/dashboard/profile" onClick={() => onNavigate?.()} className="group flex items-center px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer w-fit mb-2">
            <span className="text-[13px] font-black uppercase tracking-[0.1em] text-zinc-500 group-hover:text-white transition-colors">You</span>
            <ChevronRight size={14} className="ml-1 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
          {youItems.map(renderItem)}
        </div>

        {/* Explore Section */}
        <div className="space-y-1 mb-6">
          <h3 className="px-3 py-2 text-[13px] font-black uppercase tracking-[0.1em] text-zinc-500 mb-2">
            Explore
          </h3>
          {exploreItems.map(renderItem)}
        </div>

        {verificationStatus?.toLowerCase() === 'approved' && (
          <div className="space-y-1 mb-6">
            <h3 className="px-3 py-2 text-[13px] font-black uppercase tracking-[0.1em] text-zinc-500 mb-2">
              Creator Hub
            </h3>
            {creatorItems.map(renderItem)}
          </div>
        )}

        <div className="pt-4 mt-auto border-t border-white/5">
          <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-white mb-1">128</div>
              <div className="text-zinc-600">Movies</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-white mb-1">64</div>
              <div className="text-zinc-600">Songs</div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
