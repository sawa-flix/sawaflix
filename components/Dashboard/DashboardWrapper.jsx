'use client';
import React, { useState, useCallback } from 'react';
import Header from './Header';
import LeftSidebar from './leftsidebar';
import RightSidebar from './rightsidebar';

import { MusicProvider } from '../MusicContext';
import BottomPlayer from '../BottomPlayer';

const DashboardWrapper = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <MusicProvider>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="flex pt-16"> {/* pt-16 to account for fixed header */}
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
              fixed lg:sticky top-16 left-0 z-50 lg:z-auto
              w-64 h-[calc(100vh-4rem)] bg-gray-900
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0 lg:block
              overflow-y-auto scrollbar-none
              border-r border-gray-800
            `}
          >
            <LeftSidebar onNavigate={closeSidebar} />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-auto bg-[#0f1729] rounded-tl-2xl rounded-bl-2xl">
            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-full pb-32"> {/* Added pb-32 for bottom player space */}
              {children}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto scrollbar-none border-l border-gray-800">
            <RightSidebar />
          </aside>
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
