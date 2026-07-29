'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Bell, User, Settings, ChevronDown, ArrowLeft, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client'; 
import { User as SupabaseUser } from '@supabase/supabase-js'; 
import { handleSignOut } from '../../app/(auth)/actions'; 
import SawaflixLogo from '../SawaflixLogo';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import NotificationPanel from './NotificationPanel';
import { YouTubeApiService } from '../../services/youtubeApi';
import { getStories } from '../../lib/sanity/queries';
import { urlFor } from '../../lib/sanity/client';
import { MOVIES_DATA } from '../Movie/constants';

const youtubeApi = new YouTubeApiService();

type UserProfileData = {
  username: string | null;
  email: string | null;
  profile_image_url: string | null;
};

const Header = ({ sidebarOpen, toggleSidebar, hideSearch }: { sidebarOpen: boolean; toggleSidebar: () => void; hideSearch?: boolean }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{videos: any[], stories: any[], movies: any[]}>({ videos: [], stories: [], movies: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Notifications logic
  const adminNotificationContext = useAdminNotifications();
  const userNotificationContext = useNotifications();
  
  const { notifications, unreadCount, markRead, markAllRead, handleNotificationClick } = hideSearch 
    ? { ...adminNotificationContext, handleNotificationClick: () => {} } 
    : userNotificationContext;

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setCurrentUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from('users')
          .select('username, email, profile_image_url')
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

  // Debounced Search Effect
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchValue.trim()) {
        setSearchResults({ videos: [], stories: [], movies: [] });
        return;
      }
      setIsSearching(true);
      try {
        const q = searchValue.toLowerCase();
        
        // Fetch videos and stories in parallel
        const [videoRes, allStories] = await Promise.all([
          youtubeApi.searchVideos(`Cameroon ${q}`, null, 5).catch(() => ({ items: [] })),
          getStories().catch(() => [])
        ]);

        const filteredStories = (allStories || []).filter((s: any) => 
          s.title?.toLowerCase().includes(q) || s.excerpt?.toLowerCase().includes(q)
        ).slice(0, 5);

        const filteredMovies = MOVIES_DATA.filter((m: any) =>
          m.title?.toLowerCase().includes(q) || m.genre?.some((g: string) => g.toLowerCase().includes(q))
        ).slice(0, 5);

        setSearchResults({
          videos: videoRes.items || [],
          stories: filteredStories,
          movies: filteredMovies
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Keyboard shortcuts: Escape to close, ⌘K / Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchFocused) {
        setIsSearchFocused(false);
        setSearchValue('');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchFocused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(searchValue.trim())}`);
      setShowMobileSearchBar(false);
      setIsSearchFocused(false);
    }
  };

  const getImageUrl = (image: any, fallbackIndex: number) => {
    if (image?.asset) return urlFor(image).url();
    const fallbacks = [
      '/images/bg1.jpg', '/images/bg2.jpg', '/images/bg3.jpg',
      '/images/bg4.jpg', '/images/bg5.jpg', '/images/bg6.jpg'
    ];
    return fallbacks[fallbackIndex % fallbacks.length];
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0B0E14]/40 backdrop-blur-md border-b border-white/5 shadow-2xl">
      <div className="flex items-center justify-between h-full pl-4 pr-4 sm:pr-6 lg:pr-8">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 mr-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center space-x-3 group">
            <div className="hidden sm:block"></div>
            <Link href="/dashboard" className="flex items-center gap-3">
              <SawaflixLogo />
            </Link>
          </div>
        </div>

        {!hideSearch && (
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
              <button
                type="button"
                onClick={() => setIsSearchFocused(true)}
                className="w-full flex items-center justify-between pl-4 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl
                           text-white/50 text-sm hover:border-white/30 hover:bg-black/60 transition-all duration-300 group"
              >
                <div className="flex items-center">
                  <Search className="text-gray-500 mr-3 group-hover:text-white transition-colors" size={16} />
                  <span>Search videos, top stories...</span>
                </div>
                <div className="hidden lg:flex items-center gap-1">
                  <kbd className="px-2 py-0.5 text-[10px] font-semibold text-white/40 bg-white/5 border border-white/10 rounded">⌘</kbd>
                  <kbd className="px-2 py-0.5 text-[10px] font-semibold text-white/40 bg-white/5 border border-white/10 rounded">K</kbd>
                </div>
              </button>
            </div>
        )}

        <div className="flex items-center space-x-2">
          {!hideSearch && (
            <button
              onClick={() => setIsSearchFocused(true)}
              className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Toggle search bar"
            >
              <Search size={18} />
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all relative group"
              aria-label="Notifications"
            >
              <Bell size={20} className="group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-red-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-red-600/20 animate-in zoom-in duration-300">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationPanel 
                title={hideSearch ? "Admin Alerts" : "Notifications"}
                subtitle={hideSearch ? `${unreadCount} pending actions` : `${unreadCount} new updates`}
                notifications={notifications.slice(0, 15).map(n => ({
                  id: n.id,
                  type: n.type,
                  title: n.title,
                  message: n.message,
                  read: n.read,
                  timestamp: (n as any).createdAt || (n as any).timestamp,
                  thumbnail: (n as any).thumbnail,
                  contentId: (n as any).contentId,
                  category: (n as any).category
                }))}
                unreadCount={unreadCount}
                onMarkAllRead={markAllRead}
                onClose={() => setShowNotifications(false)}
                onItemClick={(id) => {
                  const notification = notifications.find(n => n.id === id);
                  if (notification) {
                    handleNotificationClick(notification as any);
                  }
                  setShowNotifications(false);
                }}
                accentColor={hideSearch ? "red" : "white"}
                viewAllHref={hideSearch ? undefined : "/dashboard/notification"}
              />
            )}
          </div>

          <Link href="/dashboard/settings" className="hidden sm:block p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
            <Settings size={18} />
          </Link>


          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="User profile menu"
            >
              {userProfile?.profile_image_url ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-sm flex-shrink-0">
                  <Image
                    src={userProfile.profile_image_url}
                    alt="User Avatar"
                    fill
                    className="object-cover aspect-square"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-sm flex-shrink-0">
                  <User size={14} className="text-gray-400" />
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium">
                {userProfile?.username || currentUser?.email || 'Guest'}
              </span>
              <ChevronDown size={14} className={`hidden sm:block transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{userProfile?.username || 'Guest'}</p>
                  <p className="text-xs text-gray-400">{currentUser?.email || 'N/A'}</p>
                </div>
                <Link href="/dashboard/edit-profile" className="block px-4 py-2 text-sm text-zinc-300 hover:bg-gray-700 hover:text-white transition-colors">
                  Update Profile
                </Link>
                <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  Help & Support
                </a>
                <hr className="my-2 border-gray-700" />
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
    </header>

      {showMobileSearchBar && (
        <div className="md:hidden absolute top-16 left-0 right-0 p-4 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg animate-fade-in-down">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => {
                document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              placeholder="Search titles, people, genres..."
              className="w-full pl-10 pr-4 py-2 bg-black border border-white/60 rounded-sm
                         text-white placeholder-gray-500 focus:outline-none focus:ring-1 
                         focus:ring-white transition-all duration-200"
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

      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
          }}
        />
      )}
    {/* Global Search Modal — Spotlight Style */}
    <AnimatePresence>
      {isSearchFocused && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { setIsSearchFocused(false); setSearchValue(''); }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[6px]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="w-full max-w-[560px] bg-[#12151C] border border-white/[0.08] rounded-xl sm:rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto flex flex-col max-h-[70vh] sm:max-h-[65vh]"
            >
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative w-full shrink-0">
                <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-white/30" size={18} />
                <input
                  autoFocus
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search videos, stories, movies..."
                  className="w-full pl-11 sm:pl-13 pr-11 py-3.5 sm:py-4 bg-transparent
                             text-white text-[15px] sm:text-base placeholder-white/25 focus:outline-none tracking-wide"
                />
                {searchValue ? (
                  <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <kbd className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-white/20 bg-white/[0.04] border border-white/[0.06] rounded">
                    ESC
                  </kbd>
                )}
                <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              </form>

              {/* Results Container */}
              <div className="overflow-y-auto flex-1 overscroll-contain" style={{ scrollbarWidth: 'none' }}>
                {searchValue.trim() ? (
                  isSearching ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <div className="w-5 h-5 border-[1.5px] border-white/20 border-t-white/60 rounded-full animate-spin" />
                      <span className="text-[11px] text-white/20 tracking-widest uppercase font-medium">Searching...</span>
                    </div>
                  ) : searchResults.videos.length === 0 && searchResults.stories.length === 0 && searchResults.movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-white/25">
                      <Search size={24} className="mb-2.5 opacity-40" />
                      <p className="text-sm font-medium">No results for &quot;{searchValue}&quot;</p>
                      <p className="text-xs text-white/15 mt-1">Try a different keyword</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {/* Stories Section */}
                      {searchResults.stories.length > 0 && (
                        <div className="mb-1">
                          <div className="px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase text-white/25">Stories</div>
                          {searchResults.stories.map((story: any, idx: number) => (
                            <button
                              key={story._id || idx}
                              onClick={() => {
                                setIsSearchFocused(false);
                                setSearchValue('');
                                router.push(`/dashboard/blogs/${story.slug?.current}`);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-white/[0.04] transition-colors text-left group"
                            >
                              <div className="w-9 h-9 sm:w-10 sm:h-10 relative rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.04]">
                                <Image src={getImageUrl(story.mainImage, idx)} alt={story.title} fill className="object-cover" unoptimized />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[13px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">{story.title}</h4>
                                <p className="text-[11px] text-white/30 truncate mt-0.5">{story.category?.title || 'Story'}</p>
                              </div>
                              <ArrowLeft size={12} className="text-white/10 group-hover:text-white/30 transition-colors rotate-180 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Videos Section */}
                      {searchResults.videos.length > 0 && (
                        <div className="mb-1">
                          <div className="px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase text-white/25">Videos</div>
                          {searchResults.videos.map((video: any, idx: number) => {
                            const vId = typeof video.id === 'object' ? video.id.videoId : video.id;
                            const thumb = video.snippet?.thumbnails?.default?.url || video.thumbnail;
                            const title = video.snippet?.title || video.title;
                            const channel = video.snippet?.channelTitle || video.channelTitle;
                            return (
                              <button
                                key={vId || idx}
                                onClick={() => {
                                  setIsSearchFocused(false);
                                  setSearchValue('');
                                  router.push(`/dashboard?q=${encodeURIComponent(title)}`);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-white/[0.04] transition-colors text-left group"
                              >
                                <div className="w-14 h-9 sm:w-16 sm:h-10 relative rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.04]">
                                  <Image src={thumb || '/images/bg1.jpg'} alt="Thumbnail" fill className="object-cover" unoptimized />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[13px] font-semibold text-white/80 line-clamp-1 group-hover:text-white transition-colors">{title}</h4>
                                  <p className="text-[11px] text-white/30 truncate mt-0.5">{channel}</p>
                                </div>
                                <ArrowLeft size={12} className="text-white/10 group-hover:text-white/30 transition-colors rotate-180 flex-shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Movies Section */}
                      {searchResults.movies?.length > 0 && (
                        <div className="mb-1">
                          <div className="px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase text-white/25">Movies & Series</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 pb-2">
                            {searchResults.movies.map((movie: any, idx: number) => (
                              <button
                                key={movie.id || idx}
                                onClick={() => {
                                  setIsSearchFocused(false);
                                  setSearchValue('');
                                  router.push(`/dashboard/movie`);
                                }}
                                className="group flex flex-col rounded-lg overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.1] transition-all"
                              >
                                <div className="w-full aspect-[2/3] relative overflow-hidden">
                                  <Image src={movie.image || '/images/bg1.jpg'} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                  <div className="absolute bottom-1.5 left-1.5">
                                    <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-sm rounded text-[9px] font-bold text-white/70">{movie.year}</span>
                                  </div>
                                </div>
                                <div className="p-2">
                                  <h4 className="text-[11px] sm:text-xs font-semibold text-white/70 truncate group-hover:text-white transition-colors">{movie.title}</h4>
                                  <p className="text-[9px] sm:text-[10px] text-white/25 truncate mt-0.5">{movie.genre?.slice(0, 2).join(' · ')}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-white/20">
                    <Search size={20} className="mb-2 opacity-30" />
                    <p className="text-[13px]">Search across SawaFlix</p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              {searchValue.trim() && (searchResults.videos.length > 0 || searchResults.stories.length > 0 || searchResults.movies?.length > 0) && (
                <button 
                  onClick={handleSearchSubmit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] text-[11px] font-semibold text-white/40 hover:text-white/60 tracking-widest uppercase border-t border-white/[0.06] transition-all shrink-0"
                >
                  <span>View all results</span>
                  <ArrowLeft size={10} className="rotate-180" />
                </button>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};

export default Header;