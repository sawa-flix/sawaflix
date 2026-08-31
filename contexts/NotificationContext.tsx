'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications as useNotificationsHook } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import { NotificationToast } from '@/components/notifications/NotificationToast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  refresh: () => void;
  handleNotificationClick: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const {
    notifications,
    unreadCount,
    loading,
    newNotification,
    setNewNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  } = useNotificationsHook();

  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    // 1. Immediately mark as read and decrement badge count
    markAsRead(notification.id);

    const contentId = notification.contentId;
    if (!contentId) return;

    const contentType = (notification as any).contentType || '';
    const category = (notification as any).category?.toLowerCase() || '';
    const message = notification.message?.toLowerCase() || '';
    const title = notification.title?.toLowerCase() || '';
    const notifType = (notification.type || '').toLowerCase();

    // Check if this is a blog or story post
    const isBlogOrStory = 
      contentType === 'blog' || 
      contentType === 'story' || 
      notifType === 'blog' || 
      notifType === 'story' || 
      category === 'blog' || 
      category === 'story' || 
      title.includes('story') || 
      title.includes('blog') || 
      message.includes('story') || 
      message.includes('blog') ||
      notification.id.startsWith('sanity-story-');

    if (isBlogOrStory) {
      if (contentId.startsWith('http://') || contentId.startsWith('https://')) {
        window.open(contentId, '_blank');
      } else {
        router.push(`/dashboard/blogs/${contentId}`);
      }
      return;
    }

    if (contentType === 'music' || category === 'music' || notifType === 'music') {
      router.push(`/dashboard/musicpage?id=${contentId}`);
      return;
    }

    if (contentType === 'reel' || contentType === 'video' || contentId.length === 11) {
      let targetCat = 'all';
      if (category === 'comedy' || message.includes('comedy') || title.includes('comedy')) targetCat = 'comedy';
      else if (category === 'news' || message.includes('news') || title.includes('news')) targetCat = 'news';
      router.push(`/video/${contentId}?cat=${targetCat}`);
      return;
    }

    if (notifType === 'follow') {
      router.push(`/dashboard/profile?id=${(notification as any).actorId || contentId}`);
      return;
    }

    // Default fallback
    if (contentId.startsWith('http://') || contentId.startsWith('https://')) {
      window.open(contentId, '_blank');
    } else {
      router.push(`/dashboard/blogs/${contentId}`);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markRead: markAsRead,
        markAllRead: markAllAsRead,
        deleteNotification,
        refresh,
        handleNotificationClick,
      }}
    >
      {children}
      <NotificationToast 
        notification={newNotification} 
        onClose={() => setNewNotification(null)} 
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
