'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { isVideoOffline, getOfflineVideoObjectURL, removeVideoFromIDB, getAllOfflineVideosMeta, type OfflineVideoMeta } from '@/lib/offlineStorage';
import { downloadVideoById } from '@/lib/videoPreloader';

export interface DownloadItem {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  category?: string;
  duration?: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
  error?: string;
}

interface DownloadContextType {
  activeDownloads: Record<string, DownloadItem>;
  downloadedVideos: OfflineVideoMeta[];
  isDownloading: (id: string) => boolean;
  isDownloaded: (id: string) => boolean;
  getDownloadProgress: (id: string) => number;
  startDownload: (video: {
    id: string;
    title: string;
    thumbnail?: string;
    videoUrl?: string;
    category?: string;
    duration?: string;
  }) => Promise<boolean>;
  deleteDownload: (id: string) => Promise<void>;
  refreshDownloads: () => Promise<void>;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [activeDownloads, setActiveDownloads] = useState<Record<string, DownloadItem>>({});
  const [downloadedVideos, setDownloadedVideos] = useState<OfflineVideoMeta[]>([]);
  const ongoingRef = useRef<Set<string>>(new Set());

  const refreshDownloads = useCallback(async () => {
    try {
      const meta = await getAllOfflineVideosMeta();
      setDownloadedVideos(meta);
    } catch (e) {
      console.error('[DownloadContext] Error refreshing downloads:', e);
    }
  }, []);

  useEffect(() => {
    refreshDownloads();
  }, [refreshDownloads]);

  // Listen to global progress events
  useEffect(() => {
    const handleProgress = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; progress: number; complete?: boolean }>;
      const { id, progress, complete } = customEvent.detail || {};
      if (!id) return;

      setActiveDownloads((prev) => {
        const existing = prev[id];
        if (complete) {
          ongoingRef.current.delete(id);
          const next = { ...prev };
          delete next[id];
          return next;
        }

        if (existing) {
          return {
            ...prev,
            [id]: {
              ...existing,
              progress,
              status: 'downloading',
            },
          };
        }

        return prev;
      });

      if (complete) {
        refreshDownloads();
      }
    };

    const handleError = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; error?: any }>;
      const { id, error } = customEvent.detail || {};
      if (!id) return;

      ongoingRef.current.delete(id);
      setActiveDownloads((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            status: 'error',
            error: error?.message || 'Download failed',
          },
        };
      });
    };

    window.addEventListener('video-download-progress', handleProgress);
    window.addEventListener('video-download-error', handleError);

    return () => {
      window.removeEventListener('video-download-progress', handleProgress);
      window.removeEventListener('video-download-error', handleError);
    };
  }, [refreshDownloads]);

  const isDownloading = useCallback((id: string) => {
    return Boolean(activeDownloads[id] && activeDownloads[id].status === 'downloading');
  }, [activeDownloads]);

  const isDownloaded = useCallback((id: string) => {
    return downloadedVideos.some((v) => v.id === id);
  }, [downloadedVideos]);

  const getDownloadProgress = useCallback((id: string) => {
    return activeDownloads[id]?.progress || 0;
  }, [activeDownloads]);

  const startDownload = useCallback(async (video: {
    id: string;
    title: string;
    thumbnail?: string;
    videoUrl?: string;
    category?: string;
    duration?: string;
  }) => {
    if (ongoingRef.current.has(video.id)) return true;
    ongoingRef.current.add(video.id);

    setActiveDownloads((prev) => ({
      ...prev,
      [video.id]: {
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail || '',
        videoUrl: video.videoUrl,
        category: video.category,
        duration: video.duration,
        progress: 0,
        status: 'downloading',
      },
    }));

    try {
      await downloadVideoById(video, (percent) => {
        setActiveDownloads((prev) => {
          if (!prev[video.id]) return prev;
          return {
            ...prev,
            [video.id]: {
              ...prev[video.id],
              progress: percent,
            },
          };
        });
      });
      ongoingRef.current.delete(video.id);
      setActiveDownloads((prev) => {
        const next = { ...prev };
        delete next[video.id];
        return next;
      });
      await refreshDownloads();
      return true;
    } catch (err: any) {
      ongoingRef.current.delete(video.id);
      setActiveDownloads((prev) => ({
        ...prev,
        [video.id]: {
          id: video.id,
          title: video.title,
          thumbnail: video.thumbnail || '',
          progress: 0,
          status: 'error',
          error: err?.message || 'Download failed',
        },
      }));
      throw err;
    }
  }, [refreshDownloads]);

  const deleteDownload = useCallback(async (id: string) => {
    await removeVideoFromIDB(id);
    setActiveDownloads((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await refreshDownloads();
  }, [refreshDownloads]);

  return (
    <DownloadContext.Provider
      value={{
        activeDownloads,
        downloadedVideos,
        isDownloading,
        isDownloaded,
        getDownloadProgress,
        startDownload,
        deleteDownload,
        refreshDownloads,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownload() {
  const context = useContext(DownloadContext);
  if (!context) {
    return {
      activeDownloads: {},
      downloadedVideos: [],
      isDownloading: () => false,
      isDownloaded: () => false,
      getDownloadProgress: () => 0,
      startDownload: async () => false,
      deleteDownload: async () => {},
      refreshDownloads: async () => {},
    };
  }
  return context;
}
