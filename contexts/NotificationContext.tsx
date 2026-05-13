'use client';

import React, { createContext, useContext, ReactNode } from 'react';
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

