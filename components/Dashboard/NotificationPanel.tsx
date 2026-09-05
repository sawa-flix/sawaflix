'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  ArrowLeft, 
  CheckCheck, 
  ChevronRight, 
  BookOpen, 
  Video, 
  Music, 
  Film, 
  Heart, 
  MessageSquare, 
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface NotificationItemData {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date | string | number;
  thumbnail?: string;
  contentId?: string;
  category?: string;
}

interface NotificationPanelProps {
  title: string;
  subtitle?: string;
  notifications: NotificationItemData[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onClose: () => void;
  onItemClick: (id: string, contentId?: string) => void;
  onDismissItem?: (id: string) => void;
  isSubscribed?: boolean;
  onSubscribe?: () => Promise<boolean | void> | void;
  onUnsubscribe?: () => void;
  viewAllHref?: string;
  accentColor?: 'red' | 'blue' | 'white';
}

function formatRelativeTime(timestamp: Date | string | number): string {
  if (!timestamp) return 'Recently';
  const date = typeof timestamp === 'number' || typeof timestamp === 'string' 
    ? new Date(timestamp) 
    : timestamp;
  
  const now = new Date();
  const diffInSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSecs < 60) return 'Just now';
  if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
  if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
  if (diffInSecs < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTypeBadge(type: string, category?: string) {
  const t = type?.toLowerCase() || '';
  const c = category?.toLowerCase() || '';

  if (t === 'blog' || t === 'story' || c === 'blog' || c === 'story' || t.includes('blog') || t.includes('story')) {
    return {
      label: 'BLOG STORY',
      icon: BookOpen,
      bg: 'bg-white/10 text-white border border-white/20',
      dot: 'bg-white',
    };
  }
  if (t === 'music_interaction' || c === 'music' || t === 'music') {
    return {
      label: 'MUSIC',
      icon: Music,
      bg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      dot: 'bg-emerald-500',
    };
  }
  if (t === 'reel_interaction' || c === 'reel') {
    return {
      label: 'REEL',
      icon: Film,
      bg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      dot: 'bg-amber-500',
    };
  }
  if (t === 'like') {
    return {
      label: 'LIKE',
      icon: Heart,
      bg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      dot: 'bg-rose-500',
    };
  }
  if (t === 'comment') {
    return {
      label: 'COMMENT',
      icon: MessageSquare,
      bg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      dot: 'bg-blue-500',
    };
  }
  return {
    label: 'UPDATE',
    icon: Video,
    bg: 'bg-white/10 text-white border border-white/20',
    dot: 'bg-white',
  };
}

const NotificationPanel = ({
  title,
  subtitle,
  notifications,
  unreadCount,
  onMarkAllRead,
  onClose,
  onItemClick,
  onDismissItem,
  isSubscribed = true,
  onSubscribe,
  onUnsubscribe,
  viewAllHref,
  accentColor = 'red'
}: NotificationPanelProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'blogs'>('all');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribeClick = async () => {
    if (!onSubscribe) return;
    setIsSubscribing(true);
    try {
      await onSubscribe();
    } finally {
      setIsSubscribing(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'blogs') {
      const t = n.type?.toLowerCase() || '';
      const c = n.category?.toLowerCase() || '';
      const titleLower = n.title?.toLowerCase() || '';
      return t === 'blog' || t === 'story' || c === 'blog' || c === 'story' || titleLower.includes('story') || titleLower.includes('post');
    }
    return true;
  });

  return (
    <div 
      className="fixed left-3 right-3 top-[68px] sm:absolute sm:left-auto sm:top-auto sm:right-0 sm:mt-3 w-auto sm:w-[420px] 
                 bg-[#0A0E17]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] 
                 border border-white/10 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top sm:origin-top-right flex flex-col"
      style={{ maxHeight: 'calc(85vh - 70px)' }}
    >
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.07] bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="sm:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Close notifications"
            type="button"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              {isSubscribed && unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#E50914] text-white rounded-full text-[10px] font-bold shadow-[0_0_8px_rgba(229,9,20,0.5)]">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isSubscribed ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[11px] text-zinc-400 font-medium">
                    {subtitle || (unreadCount > 0 ? `${unreadCount} unread updates` : 'Subscribed • All caught up')}
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-zinc-400 font-medium">
                  Subscription required
                </p>
              )}
            </div>
          </div>
        </div>

        {isSubscribed && unreadCount > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] text-white 
                       border border-white/15 hover:border-white/30 transition-all duration-200 text-[11px] font-semibold group cursor-pointer shadow-sm active:scale-95"
            type="button"
            title="Mark all as read"
          >
            <CheckCheck size={13} className="transition-transform group-hover:scale-110" />
            <span>Mark read</span>
          </button>
        )}
      </div>

      {/* When NOT subscribed: Display elegant Subscription Prompt */}
      {!isSubscribed ? (
        <div className="p-7 text-center flex flex-col items-center justify-center flex-1 my-auto">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/20 via-zinc-800/40 to-black/60 border border-white/15 flex items-center justify-center shadow-xl">
              <Bell size={26} className="text-[#E50914] animate-bounce" style={{ animationDuration: '2.5s' }} />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-black rounded-full border border-white/20 shadow-md">
              <Sparkles size={13} className="text-amber-400" />
            </div>
          </div>

          <h4 className="text-base font-bold text-white tracking-tight mb-1.5">
            Subscribe to Notifications
          </h4>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-6">
            Get real-time alerts whenever fresh movies, cultural reels, exclusive music drops, and community articles arrive on SawaFlix.
          </p>

          <button
            onClick={handleSubscribeClick}
            disabled={isSubscribing}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B80710] hover:from-red-600 hover:to-red-700 
                       text-white font-bold text-xs tracking-wide shadow-[0_8px_25px_rgba(229,9,20,0.35)] 
                       transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-60"
            type="button"
          >
            <Bell size={14} className="fill-white" />
            <span>{isSubscribing ? 'Enabling...' : 'Enable Notifications'}</span>
          </button>

          <div className="flex items-center gap-3 mt-4 text-[10px] text-zinc-500 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              Privacy protected
            </span>
            <span>•</span>
            <span>Free updates</span>
            <span>•</span>
            <span>Unsubscribe anytime</span>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="px-4 py-2 bg-black/20 border-b border-white/[0.04] flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                activeTab === 'all'
                  ? 'bg-white/15 text-white border-white/30 shadow-sm backdrop-blur-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border-transparent'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                activeTab === 'unread'
                  ? 'bg-white/15 text-white border-white/30 shadow-sm backdrop-blur-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border-transparent'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                activeTab === 'blogs'
                  ? 'bg-white/15 text-white border-white/30 shadow-sm backdrop-blur-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border-transparent'
              }`}
            >
              <BookOpen size={11} />
              Blogs & Stories
            </button>
          </div>

          {/* Body: Notifications List with Sleek Dark Custom Scrollbar */}
          <div 
            className="overflow-y-auto overscroll-contain flex-1 py-1 divide-y divide-white/[0.04]
                       [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]
                       [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
                       [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full
                       hover:[&::-webkit-scrollbar-thumb]:bg-white/30"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.12) transparent',
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/[0.08] shadow-inner">
                  <Bell size={22} className="text-zinc-500" />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  {activeTab === 'unread' ? 'No unread notifications' : activeTab === 'blogs' ? 'No story alerts yet' : 'All caught up!'}
                </p>
                <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  {activeTab === 'blogs' 
                    ? 'New blogs posted from editorial and creators will show up right here.' 
                    : "You're completely up to date with community releases and stories."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const badge = getTypeBadge(n.type, n.category);
                const BadgeIcon = badge.icon;
                const timeStr = formatRelativeTime(n.timestamp);

                return (
                  <div 
                    key={n.id} 
                    onClick={() => onItemClick(n.id, n.contentId)}
                    className={`relative px-4 py-3.5 transition-all group cursor-pointer hover:bg-white/[0.05] ${
                      !n.read ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    {/* Left accent indicator for unread item */}
                    {!n.read && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                    )}

                    <div className="flex items-start gap-3.5">
                      {/* Thumbnail / Icon Container */}
                      <div className="relative shrink-0 mt-0.5">
                        {n.thumbnail ? (
                          <div className="w-12 h-12 bg-black/50 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-all shadow-md relative">
                            <Image src={n.thumbnail} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-white/10 bg-gradient-to-br from-[#161B26] to-[#0A0D14] flex items-center justify-center group-hover:border-white/30 transition-all shadow-md relative">
                            <BadgeIcon size={20} className="text-white" />
                          </div>
                        )}

                        {/* Unread indicator dot */}
                        {!n.read && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-[#0C0F17] shadow-sm animate-pulse" />
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${badge.bg}`}>
                            <BadgeIcon size={10} />
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap shrink-0">
                            {timeStr}
                          </span>
                        </div>

                        <h4 className={`text-[12.5px] font-semibold leading-snug truncate transition-colors ${
                          !n.read ? 'text-white font-bold' : 'text-zinc-300 group-hover:text-white'
                        }`}>
                          {n.title}
                        </h4>

                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5 group-hover:text-zinc-300 transition-colors">
                          {n.message}
                        </p>
                      </div>

                      {/* Right actions: Dismiss button on hover + Arrow */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {onDismissItem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismissItem(n.id);
                            }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Take down notification"
                            aria-label="Take down notification"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <div className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {viewAllHref && (
            <div className="px-4 py-3 bg-black/40 border-t border-white/[0.06] text-center shrink-0 flex items-center justify-between">
              <Link 
                href={viewAllHref} 
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors group/view py-1"
              >
                <span>View all notifications</span>
                <ChevronRight size={13} className="group-hover/view:translate-x-1 transition-transform" />
              </Link>

              {onUnsubscribe && (
                <button
                  type="button"
                  onClick={onUnsubscribe}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  title="Turn off notifications"
                >
                  Unsubscribe
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationPanel;
