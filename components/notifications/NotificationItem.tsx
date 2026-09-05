import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Music, 
  Video, 
  AtSign, 
  Info,
  Trash2
} from 'lucide-react';
import { Notification, NotificationType } from '@/types/notification';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'like': return <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />;
    case 'comment': return <MessageCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />;
    case 'follow': return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
    case 'reel_interaction': return <Video className="w-3.5 h-3.5 text-purple-400" />;
    case 'music_interaction': return <Music className="w-3.5 h-3.5 text-pink-400" />;
    case 'mention': return <AtSign className="w-3.5 h-3.5 text-amber-400" />;
    case 'new_post': return <Video className="w-3.5 h-3.5 text-red-400" />;
    default: return <Info className="w-3.5 h-3.5 text-zinc-300" />;
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkRead, 
  onDelete 
}) => {
  const { handleNotificationClick } = useNotifications();

  const handleClick = () => {
    handleNotificationClick(notification);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className={`relative group flex items-center p-4 gap-4 transition-all cursor-pointer select-none ${!notification.read ? 'bg-white/[0.03]' : ''}`}
      onClick={handleClick}
    >
      {/* Indicator for Unread */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CE1126] shadow-[0_0_10px_rgba(206,17,38,0.5)]" />
      )}

      {/* Actor Image / SawaFlix Logo */}
      <div className="relative flex-shrink-0">
        <div className="relative">
          {notification.actorImage ? (
            <img 
              src={notification.actorImage} 
              alt={notification.actorName || 'User'} 
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 shadow-xl group-hover:ring-[#CE1126]/50 transition-all duration-300"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E2330] to-[#0E121A] p-2 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-[#CE1126]/50 transition-all duration-300 shadow-xl">
              <img 
                src="/logos_and_pwas/android-chrome-192x192.png" 
                alt="SawaFlix" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 p-1 bg-[#0B0E14] rounded-full ring-1 ring-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
            {getIcon(notification.type)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-tight text-white/90">
              {notification.actorName && (
                <span className="font-black text-white mr-1.5 tracking-tight">{notification.actorName}</span>
              )}
              <span className={`${notification.read ? 'text-gray-500 font-medium' : 'text-zinc-200 font-bold'}`}>
                {notification.title}
              </span>
            </p>
          </div>
        </div>
        
        <p className={`text-[12px] line-clamp-1 leading-normal mb-1 ${notification.read ? 'text-gray-600 font-medium' : 'text-gray-400 font-medium'}`}>
          {notification.message}
        </p>
        
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            {!notification.read && (
              <span className="inline-block w-1 h-1 bg-white rounded-full animate-pulse" />
            )}
          </span>
        </div>
      </div>

      {/* Thumbnail if present */}
      {notification.thumbnail && (
        <div className="flex-shrink-0 ml-1">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg group-hover:ring-white/20 transition-all duration-500">
            <img 
              src={notification.thumbnail} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform group-hover:scale-125 duration-700"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-all duration-500" />
          </div>
        </div>
      )}

      {/* Actions (Hidden until hover) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-2.5 hover:bg-red-500/15 rounded-full text-gray-500 hover:text-red-500 transition-all active:scale-90 border border-transparent hover:border-red-500/20"
          title="Delete"
        >
          <Trash2 className="w-[18px] h-[18px]" />
        </button>
      </div>
    </motion.div>
  );
};

