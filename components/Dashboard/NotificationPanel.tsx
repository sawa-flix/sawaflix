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
  Radio, 
  ExternalLink 
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
      bg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      dot: 'bg-rose-500',
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
      bg: 'bg-red-500/15 text-red-400 border border-red-500/30',
      dot: 'bg-red-500',
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
    bg: 'bg-red-600/15 text-red-400 border border-red-600/30',
    dot: 'bg-red-500',
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
  viewAllHref,
  accentColor = 'red'
}: NotificationPanelProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'blogs'>('all');

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
      className="fixed left-3 right-3 top-[68px] sm:absolute sm:left-auto sm:top-auto sm:right-0 sm:mt-3 w-auto sm:w-[430px] 
                 bg-[#0C0F17]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] 
                 border border-white/10 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top sm:origin-top-right flex flex-col"
      style={{ maxHeight: 'calc(85vh - 70px)' }}
    >
      {/* Glow highlight at the top */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.07] bg-white/[0.01] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="sm:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
            aria-label="Close notifications"
            type="button"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] text-zinc-400 font-medium">
                {subtitle || (unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up')}
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-red-500/20 text-zinc-300 hover:text-red-400 
                       border border-white/10 hover:border-red-500/30 transition-all duration-200 text-[11px] font-semibold group cursor-pointer shadow-sm"
            type="button"
          >
            <CheckCheck size={13} className="transition-transform group-hover:scale-110" />
            <span>Mark read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-black/20 border-b border-white/[0.04] flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === 'unread'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('blogs')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === 'blogs'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <BookOpen size={11} />
          Blogs & Stories
        </button>
      </div>

      {/* Body: Notifications List */}
      <div className="overflow-y-auto overscroll-contain flex-1 py-1 divide-y divide-white/[0.04]" style={{ scrollbarWidth: 'thin' }}>
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
                ? 'New blogs posted from Dev.to and creators will show up right here.' 
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
                className={`relative px-4 py-3.5 transition-all group cursor-pointer hover:bg-white/[0.04] ${
                  !n.read ? 'bg-red-500/[0.03]' : ''
                }`}
              >
                {/* Left accent indicator for unread item */}
                {!n.read && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-red-500 rounded-r shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                )}

                <div className="flex items-start gap-3.5">
                  {/* Thumbnail / Icon Container */}
                  <div className="relative shrink-0 mt-0.5">
                    {n.thumbnail ? (
                      <div className="w-12 h-12 bg-black/40 rounded-xl overflow-hidden border border-white/10 group-hover:border-red-500/40 transition-all shadow-md relative">
                        <Image src={n.thumbnail} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl border border-white/10 bg-gradient-to-br from-[#161B26] to-[#0A0D14] flex items-center justify-center group-hover:border-red-500/40 transition-all shadow-md relative">
                        <BadgeIcon size={20} className={badge.dot === 'bg-rose-500' ? 'text-rose-400' : 'text-red-400'} />
                      </div>
                    )}

                    {/* Unread indicator dot */}
                    {!n.read && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0C0F17] shadow-sm animate-pulse" />
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
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
                      !n.read ? 'text-white group-hover:text-red-400' : 'text-zinc-300 group-hover:text-white'
                    }`}>
                      {n.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5 group-hover:text-zinc-300 transition-colors">
                      {n.message}
                    </p>
                  </div>

                  {/* Arrow Action indicator */}
                  <div className="shrink-0 self-center text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                    <ChevronRight size={15} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {viewAllHref && (
        <div className="px-4 py-3 bg-black/30 border-t border-white/[0.06] text-center shrink-0">
          <Link 
            href={viewAllHref} 
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors group/view w-full py-1"
          >
            <span>View all notifications</span>
            <ChevronRight size={13} className="group-hover/view:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
