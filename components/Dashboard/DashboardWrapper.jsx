'use client';
import React, { useState, useCallback } from 'react';
import Header from './Header';
import LeftSidebar from './leftsidebar';
import CreatorSidebar from './CreatorSidebar';
import RightSidebar from './rightsidebar';

import { MusicProvider } from '../MusicContext';
import BottomPlayer from '../BottomPlayer';

const DashboardWrapper = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  React.useEffect(() => {
    const checkCreatorStatus = async () => {
        try {
            const visitorId = localStorage.getItem('sawaflix_visitor_id');
            const res = await fetch('/api/creator/profile', {
                headers: visitorId ? { 'x-visitor-id': visitorId } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data);
                // If they have any status other than 'none', treat them as a creator for the sidebar
                if (data.verificationStatus && data.verificationStatus !== 'none') {
                    setIsCreator(true);
                }
            }
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
      <div className="min-h-screen bg-[#0B0E14]">
        {/* Header */}
        {!isCreator && <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}

        <div className={`flex ${isCreator ? 'pt-0' : 'pt-16'}`}> {/* pt-16 to account for fixed header, pt-0 for creator */}
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={closeSidebar}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeSidebar();
              }}
              aria-label="Close sidebar"
            />
          )}

          {/* Left Sidebar */}
          <aside
            className={`
              fixed lg:sticky top-0 left-0 z-50 lg:z-auto
              w-64 ${isCreator ? 'h-screen' : 'h-[calc(100vh-4rem)]'} bg-gray-900
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0 lg:block
              overflow-y-auto scrollbar-none
              border-r border-white/5
            `}
          >
            {isCreator ? (
                <CreatorSidebar userProfile={userProfile} />
            ) : (
                <LeftSidebar onNavigate={closeSidebar} />
            )}
          </aside>

          {/* Main Content Area */}
          <main className={`flex-1 ${isCreator ? 'min-h-screen' : 'min-h-[calc(100vh-4rem)]'} overflow-auto bg-[#0f1729] rounded-tl-3xl rounded-bl-3xl`}>
            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-full pb-32"> {/* Added pb-32 for bottom player space */}
              {children}
            </div>
          </main>

          {/* Right Sidebar */}
          {!isCreator && (
            <aside className="hidden xl:block w-80 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto scrollbar-none border-l border-white/5">
                <RightSidebar />
            </aside>
          )}
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
