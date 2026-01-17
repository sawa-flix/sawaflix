'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Bell, User, Settings, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client'; // Client-side Supabase client
import { User as SupabaseUser } from '@supabase/supabase-js'; // Alias User type to avoid conflict
import { handleSignOut } from '../../app/(auth)/actions'; // Import the server action

// Define a type for the user profile data from your 'users' table
type UserProfileData = {
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null; // Changed from avatar_url
};

// const handleUserSignOut = async () => {
//   const {error} = await createClient.auth.
// }

const Header = ({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);
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
          .select('full_name, email, profile_image_url') // Changed from avatar_url
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      console.log('Searching for:', searchValue);
      setShowMobileSearchBar(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            </Link>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                SawaFlix
              </h1>
              <span className="hidden sm:block text-xs text-gray-400">Dashboard</span>
            </div>
          </div>
        </div>

        {/* Search bar - always visible on medium screens and larger */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search movies, music, artists..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/80 border border-gray-700 rounded-xl 
                         text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 
                         focus:ring-red-500 focus:border-transparent transition-all duration-200
                         hover:bg-gray-800"
            />
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Mobile search button */}
          <button
            onClick={() => setShowMobileSearchBar(!showMobileSearchBar)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
            aria-label="Toggle search bar"
          >
            <Search size={18} />
          </button>

          {/* Notifications */}
          <Link href="/dashboard/notification">
          <button className="relative p-2 rounded-lg cursor-pointer text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
              3
            </span>
          </button>
          </Link>

          {/* Settings */}
          <button className="hidden sm:block p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer">
            <Settings size={18} />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
              aria-label="User profile menu"
            >
              {userProfile?.profile_image_url ? ( 
                <Image
                  src={userProfile.profile_image_url} 
                  alt="User Avatar"
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium">
                {userProfile?.full_name || currentUser?.email || 'Guest'}
              </span>
              <ChevronDown size={14} className={`hidden sm:block transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{userProfile?.full_name || 'Guest'}</p>
                  <p className="text-xs text-gray-400">{currentUser?.email || 'N/A'}</p>
                </div>
                <Link href="/updateProfile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  Profile Settings
                </Link>
                
                <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  Help & Support
                </a>
                <hr className="my-2 border-gray-700" />
                
                {/* Sign Out Button */}
                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (pops out) */}
      {showMobileSearchBar && (
        <div className="md:hidden absolute top-16 left-0 right-0 p-4 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg animate-fade-in-down">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search movies, music, artists..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/80 border border-gray-700 rounded-xl 
                         text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 
                         focus:ring-red-500 focus:border-transparent transition-all duration-200
                         hover:bg-gray-800"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowMobileSearchBar(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Close search bar"
            >
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;