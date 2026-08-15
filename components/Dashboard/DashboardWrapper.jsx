'use client';
import React, { useState, useCallback } from 'react';
import { BACKEND_URL } from '../../lib/apiConfig';
import { usePathname } from 'next/navigation';
import Header from './Header';
import LeftSidebar from './leftsidebar';
import RightSidebar from './rightsidebar';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { MusicProvider } from '../MusicContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { FavoriteProvider } from '../../contexts/FavoriteContext';
import { AuthModalProvider } from '../../contexts/AuthModalContext';
import BottomPlayer from '../BottomPlayer';

const DashboardWrapper = ({ children }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Disable right sidebar for movie and profile pages. Reels renders inside
  // the normal dashboard shell like every other page — header, left
  // sidebar, and right sidebar all stay visible.
  const hideRightSidebarPaths = ['/movie', '/profile', '/edit-profile'];
  const hasRightSidebar = !hideRightSidebarPaths.some(p => pathname?.includes(p));
  // Every other page uses pb-40 as trailing scroll space below flowing
  // content. Reels is a fixed-height video panel, not flowing content —
  // that reserved 10rem was just shrinking the box for no reason.
  const isReelsRoute = pathname?.includes('/reels');

  const [verificationStatus, setVerificationStatus] = useState('none');
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  React.useEffect(() => {
    const checkCreatorStatus = async () => {
        try {
            const { createClient } = require('../../utils/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            const token = session?.access_token;
            
            // 1. Try API first
            let apiData = null;
            try {
                console.log("Fetching profile from:", `${BACKEND_URL}/api/creator/profile`);
                const visitorId = localStorage.getItem('sawaflix_visitor_id');
                
                let res;
                let retryCount = 0;
                const maxRetries = 2;
                
                while (retryCount <= maxRetries) {
                    try {
                        res = await fetch(`${BACKEND_URL}/api/creator/profile`, {
                            headers: {
                                ...(visitorId ? { 'x-visitor-id': visitorId } : {}),
                                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                            }
                        });
                        break; // Success!
                    } catch (fetchErr) {
                        retryCount++;
                        if (retryCount > maxRetries) throw fetchErr;
                        console.warn(`Fetch retry ${retryCount}/${maxRetries}...`);
                        await new Promise(r => setTimeout(r, 1000 * retryCount));
                    }
                }
                if (res.ok) {
                    apiData = await res.json();
                } else {
                    console.warn("Backend profile fetch returned non-ok status:", res.status);
                }
            } catch (apiErr) {
                console.error("API check failed (likely network error or timeout):", apiErr);
            }

            // 2. Always fetch Supabase profile as source of truth for permissions
            let supabaseProfile = null;
            let submissionData = null;
            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                supabaseProfile = profile;

                const { data: submission } = await supabase
                    .from('verification_submissions')
                    .select('status, category')
                    .eq('creator_id', user.id)
                    .maybeSingle();
                submissionData = submission;
            }

            // 3. Merge data, prioritizing 'approved' status
            const finalProfile = {
                ...(supabaseProfile || apiData || {
                    id: user?.id,
                    email: user?.email,
                    username: user?.email?.split('@')[0],
                }),
                category: submissionData?.category || supabaseProfile?.category || apiData?.category || 'viewer'
            };

            // Define the final status by checking all possible fields
            const statusFromSupabase = supabaseProfile?.verification_status || submissionData?.status;
            const statusFromApi = apiData?.verification_status || apiData?.verificationStatus;
            
            // If ANY source says approved, then the user is approved
            const finalStatus = (statusFromSupabase?.toLowerCase() === 'approved' || statusFromApi?.toLowerCase() === 'approved')
                ? 'approved'
                : (statusFromSupabase || statusFromApi || 'none');

            // Get user role from Supabase profile
            const userRoleFromDB = supabaseProfile?.role || null;

            setUserProfile(finalProfile);
            setVerificationStatus(finalStatus);
            setUserRole(userRoleFromDB);

        } catch (err) {
            console.error("Error checking creator status:", err);
        }
    };
    checkCreatorStatus();
  }, []);



  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <MusicProvider>
      <NotificationProvider>
        <FavoriteProvider>
        <AuthModalProvider>
        <div className="min-h-screen bg-[#0B0E14] relative overflow-hidden">
        {/* Texture overlay without colored glows */}
        <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03] mix-blend-overlay" />
        </div>

        {/* Header - Unified across all pages */}
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="relative z-10 pt-16">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md transition-all duration-500"
              onClick={closeSidebar}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeSidebar();
              }}
              aria-label="Close sidebar"
            />
          )}

          {/* Left Sidebar — Fixed & Unified */}
          <aside
            className={`
              fixed top-16 left-0 z-50 lg:z-30
              w-72 h-[calc(100vh-4rem)] bg-[#0B0E14]/80 backdrop-blur-xl
              transform transition-all duration-500 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0
              overflow-y-auto scrollbar-none
              border-r border-white/5 shadow-2xl shadow-black/50
            `}
          >
            <LeftSidebar
              onNavigate={closeSidebar}
              verificationStatus={verificationStatus}
              userRole={userRole}
              userProfile={userProfile}
            />
          </aside>

          {/* Right Sidebar — Fixed & Unified */}
          {hasRightSidebar && (
            <aside className="hidden xl:block fixed top-16 right-0 z-30 w-80 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none bg-[#0B0E14]/40 backdrop-blur-md border-l border-white/5">
                <RightSidebar />
            </aside>
          )}

          {/* Main Content Area — Scrollable center, shared by every page */}
          <main className={`h-[calc(100vh-4rem)] lg:ml-72 ${hasRightSidebar ? 'xl:mr-80' : ''} overflow-y-auto scrollbar-none bg-transparent scroll-smooth`}>
            <div className={`px-4 sm:px-8 lg:px-10 py-8 w-full max-w-[1920px] mx-auto transition-all duration-500 ${isReelsRoute ? 'pb-4' : 'pb-40'}`}>
              {children}
            </div>
          </main>
        </div>

        {/* Persistent Player */}
        <BottomPlayer />

        <style jsx global>{`
          /* Hide scrollbars */
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          /* Custom focus styles */
          .focus-ring:focus-visible {
            outline: 2px solid rgb(239 68 68);
            outline-offset: 2px;
          }
        `}</style>
      </div>
        </AuthModalProvider>
        </FavoriteProvider>
      </NotificationProvider>
    </MusicProvider>
  );
};

export default DashboardWrapper;
