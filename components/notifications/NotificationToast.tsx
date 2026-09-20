'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, UserPlus, Video, Music, AtSign, Bell, Film } from 'lucide-react';
import { Notification, NotificationType } from '@/types/notification';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'like': return <Heart className="w-3 h-3 text-red-500 fill-red-500" />;
    case 'comment': return <MessageCircle className="w-3 h-3 text-blue-400 fill-blue-400/30" />;
    case 'follow': return <UserPlus className="w-3 h-3 text-emerald-400" />;
    case 'reel_interaction': return <Video className="w-3 h-3 text-purple-400" />;
    case 'music_interaction': return <Music className="w-3 h-3 text-pink-400" />;
    case 'mention': return <AtSign className="w-3 h-3 text-amber-400" />;
    case 'new_post': return <Film className="w-3 h-3 text-red-400" />;
    default: return <Bell className="w-3 h-3 text-[#CE1126]" />;
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const { handleNotificationClick } = useNotifications();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const handleToastClick = () => {
    if (notification) {
      handleNotificationClick(notification);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.92, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.92, filter: 'blur(8px)', transition: { duration: 0.25 } }}
          className="fixed top-20 right-4 sm:right-6 z-[9999] w-full max-w-[360px]"
        >
          <div 
            onClick={handleToastClick}
            className="bg-[#0E121A]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex items-center gap-3.5 overflow-hidden relative group cursor-pointer select-none hover:border-white/30 transition-all duration-300"
          >
            {/* Ambient Red Glow on Left */}
            <div className="absolute -left-4 -top-4 w-20 h-20 bg-[#CE1126]/20 rounded-full blur-xl pointer-events-none" />

            {/* Actor Image / SawaFlix Logo Fallback */}
            <div className="relative flex-shrink-0">
              {notification.actorImage ? (
                <img 
                  src={notification.actorImage} 
                  alt={notification.actorName || 'User'} 
                  className="w-11 h-11 rounded-full object-cover border border-white/20 shadow-md ring-1 ring-white/10"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1A1E29] to-[#0D1017] flex items-center justify-center border border-white/15 shadow-md p-2">
                  <img 
                    src="/logos_and_pwas/android-chrome-192x192.png" 
                    alt="SawaFlix" 
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
              )}
              {/* Type Badge Icon */}
              <div className="absolute -bottom-1 -right-1 p-1 bg-[#0F1219] rounded-full border border-white/20 shadow-xl flex items-center justify-center">
                {getIcon(notification.type)}
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h4 className="text-[13px] font-bold text-white truncate tracking-tight">
                  {notification.actorName || 'SawaFlix Alert'}
                </h4>
                {!notification.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CE1126] shadow-[0_0_8px_#CE1126] shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-zinc-300 font-semibold line-clamp-1">
                {notification.title}
              </p>
              <p className="text-[10px] text-zinc-400 line-clamp-1 leading-snug font-normal mt-0.5">
                {notification.message}
              </p>
            </div>

            {/* Thumbnail Preview if present */}
            {notification.thumbnail && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/15 shadow-md shrink-0">
                <img 
                  src={notification.thumbnail} 
                  alt="Content" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="relative p-1.5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all active:scale-90 shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Timed Progress Bar with SawaFlix Gradient */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#009639] via-[#CE1126] to-[#FCD116] origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
