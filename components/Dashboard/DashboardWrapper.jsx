'use client';
import React, { useState, useCallback } from 'react';
import { BACKEND_URL } from '../../lib/apiConfig';
import { usePathname } from 'next/navigation';
import Header from './Header';
import LeftSidebar from './leftsidebar';
import CreatorSidebar from './CreatorSidebar';
import RightSidebar from './rightsidebar';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { MusicProvider } from '../MusicContext';
import BottomPlayer from '../BottomPlayer';

const DashboardWrapper = ({ children }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('none');
  const [userProfile, setUserProfile] = useState(null);

  React.useEffect(() => {
    const checkCreatorStatus = async () => {
        try {
            const { createClient } = require('../../utils/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const { data: { user } } = await supabase.auth.getUser(); // Add this line to avoid Next.js warnings
            const token = session?.access_token;
            
            const visitorId = localStorage.getItem('sawaflix_visitor_id');
            const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
                headers: {
                    ...(visitorId ? { 'x-visitor-id': visitorId } : {}),
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data);
                setVerificationStatus(data.verificationStatus);
            }
        } catch (err) {
            console.error("Error checking creator status:", err);
        }
    };
    checkCreatorStatus();
  }, []);

  // Determine if we should show the creator-specific layout
  // Only use Creator layout for approved creators on the creator-dashboard path
  const isCreatorLayout = pathname.startsWith('/creator-dashboard') && verificationStatus === 'approved';

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <MusicProvider>
      <div className="min-h-screen bg-[#0B0E14] relative overflow-hidden">
        {/* Genius Background Experience - Mesh Gradients & Glows */}
        <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
           <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" />
           <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-red-900/10 blur-[150px] rounded-full" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03] mix-blend-overlay" />
        </div>

        {/* Header - Only show if NOT in creator layout mode */}
        {!isCreatorLayout && <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}

        <div className={`relative z-10 ${isCreatorLayout ? '' : 'pt-16'}`}> 
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

          {/* Left Sidebar — Fixed */}
          <aside
            className={`
              fixed top-16 left-0 z-50 lg:z-30
              w-72 h-[calc(100vh-4rem)] bg-[#0B0E14]/80 backdrop-blur-xl
              transform transition-all duration-500 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0
              overflow-y-auto scrollbar-none
              border-r border-white/5 shadow-2xl shadow-black/50
              ${isCreatorLayout ? 'top-0 h-screen' : ''}
            `}
          >
            {isCreatorLayout ? (
                <CreatorSidebar userProfile={userProfile} />
            ) : (
                <LeftSidebar onNavigate={closeSidebar} />
            )}
          </aside>

          {/* Right Sidebar — Fixed */}
          {!isCreatorLayout && (
            <aside className="hidden xl:block fixed top-16 right-0 z-30 w-80 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none bg-[#0B0E14]/40 backdrop-blur-md border-l border-white/5">
                <RightSidebar />
            </aside>
          )}

          {/* Main Content Area — Scrollable center */}
          <main className={`
            ${isCreatorLayout ? 'min-h-screen lg:ml-72' : 'min-h-[calc(100vh-4rem)] lg:ml-72'}
            ${!isCreatorLayout ? 'xl:mr-80' : ''}
            overflow-y-auto bg-transparent
          `}>
            <div className="px-4 sm:px-8 lg:px-10 py-8 max-w-7xl mx-auto pb-40 transition-all duration-500"> 
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
    </MusicProvider>
  );
};

export default DashboardWrapper;
