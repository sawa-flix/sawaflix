'use client'
import React from 'react';
import { Play, MoreHorizontal, BellOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationPage = () => {
  const router = useRouter();
  const { notifications, markRead } = useNotifications();

  const recentNotifications = notifications.filter(n => {
    const hours = (Date.now() - new Date(n.timestamp).getTime()) / (1000 * 60 * 60);
    return hours <= 24;
  });

  const olderNotifications = notifications.filter(n => {
    const hours = (Date.now() - new Date(n.timestamp).getTime()) / (1000 * 60 * 60);
    return hours > 24;
  });

  const NotificationItem = ({ notification }) => (
    <div
      className="flex items-start px-4 py-4 border-b border-white/5 transition-colors group cursor-pointer"
      onClick={() => markRead(notification.id)}
    >
      {/* Thumbnail (Left Side) */}
      <div className="flex-shrink-0 mr-4">
        <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
          {notification.thumbnail ? (
            <Image
              src={notification.thumbnail}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-red-500 font-bold text-xl">{notification.artistName?.charAt(0) || 'S'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Text Content (Right Side) */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex flex-col">
          <h3 className={`font-semibold text-sm sm:text-base leading-tight mb-1 line-clamp-1 ${!notification.read ? 'text-white' : 'text-gray-400'}`}>
            {notification.title}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-1 font-medium">
            {notification.artistName || 'Sawaflix Update'}
          </p>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2">
            {notification.message}
          </p>
          <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* More Options */}
      <div className="flex-shrink-0 self-center">
        <div className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-500 hover:text-white">
          <MoreHorizontal size={20} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0B0E14] text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-white/5 sticky top-0 bg-[#0B0E14]/80 backdrop-blur-md z-10">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Notifications</h1>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">Updates from your favorite artists</p>
        </div>
      </div>

      {/* Notification Content */}
      <div className="max-w-4xl mx-auto py-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-600">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6">
              <BellOff size={40} />
            </div>
            <p className="text-lg font-bold">No notifications yet</p>
            <p className="text-sm">We'll notify you when artists post new content</p>
          </div>
        ) : (
          <>
            {recentNotifications.length > 0 && (
              <div className="mb-8">
                <div className="px-6 py-2 mb-2">
                  <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Recent</h2>
                </div>
                <div className="bg-[#161B22]/95 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5">
                  {recentNotifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </div>
              </div>
            )}

            {olderNotifications.length > 0 && (
              <div>
                <div className="px-6 py-2 mb-2">
                  <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Earlier</h2>
                </div>
                <div className="bg-[#161B22]/95 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5">
                  {olderNotifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
