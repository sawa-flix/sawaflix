'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type NotificationType = 'post' | 'mention' | 'system' | 'info';

export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  artistName?: string;
  contentId?: string;
  thumbnail?: string;
  read: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<UserNotification, 'id' | 'read' | 'timestamp'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Initialize with some mock notifications for artist posts to demonstrate the feature
  useEffect(() => {
    const mockNotifications: UserNotification[] = [
      {
        id: '1',
        type: 'post',
        title: 'New Video from Locko',
        message: 'Locko just posted a new video: "Sawa Romance". Check it out now!',
        artistName: 'Locko',
        contentId: 'locko-1',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=90&fit=crop',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: '2',
        type: 'post',
        title: 'New Audio from Blanche Bailly',
        message: 'Blanche Bailly released a new track: "Bayam Sellam". Listen now!',
        artistName: 'Blanche Bailly',
        contentId: 'blanche-1',
        thumbnail: 'https://images.unsplash.com/photo-1514525253361-bee1a329d7fc?w=120&h=90&fit=crop',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      },
      {
        id: '3',
        type: 'system',
        title: 'Welcome to Sawaflix!',
        message: 'Explore the best of Cameroonian entertainment in one place.',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const addNotification = useCallback((n: Omit<UserNotification, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: UserNotification = {
      ...n,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markRead,
        markAllRead,
        clearAll,
      }}
    >
      {children}
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
