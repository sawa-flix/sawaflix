'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player/lazy';
import Link from 'next/link';
import {
  Download,
  Play,
  Pause,
  Trash2,
  WifiOff,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  MoreVertical,
  Film,
  HardDrive,
  Info
} from 'lucide-react';
import { useDownload } from '@/contexts/DownloadContext';
import CircularProgress from '@/components/CircularProgress';
import { getOfflineVideoObjectURL } from '@/lib/offlineStorage';

export default function DownloadsPage() {
  const {
    downloadedVideos,
    activeDownloads,
    deleteDownload,
    refreshDownloads
  } = useDownload();

  const [activeVideoId, setActiveVideoId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeUrl, setActiveUrl] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const videoRef = useRef(null);

  // Sync network state
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set initial active video
  useEffect(() => {
    if (!activeVideoId && downloadedVideos.length > 0) {
      setActiveVideoId(downloadedVideos[0].id);
    }
  }, [downloadedVideos, activeVideoId]);

  // Resolve IndexedDB Blob to ObjectURL for the active video
  useEffect(() => {
    let currentUrl = null;
    let cancelled = false;

    async function resolveBlobUrl() {
      if (!activeVideoId) {
        setActiveUrl(null);
        return;
      }
      try {
        const objectUrl = await getOfflineVideoObjectURL(activeVideoId);
        if (!cancelled && objectUrl) {
          setActiveUrl(objectUrl);
          currentUrl = objectUrl;
          setIsPlaying(true);
        }
      } catch (err) {
        console.error('Failed to resolve video blob URL:', err);
      }
    }

    resolveBlobUrl();

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [activeVideoId]);

  const activeVideo = downloadedVideos.find((v) => v.id === activeVideoId);

  const handleDelete = useCallback(async (id, e) => {
    e?.stopPropagation();
    setMenuOpenId(null);
    if (activeVideoId === id) {
      setActiveUrl(null);
      setIsPlaying(false);
      const remaining = downloadedVideos.filter((v) => v.id !== id);
      setActiveVideoId(remaining.length > 0 ? remaining[0].id : null);
    }
    await deleteDownload(id);
  }, [activeVideoId, downloadedVideos, deleteDownload]);

  const activeDownloadsList = Object.values(activeDownloads);
  const totalCount = downloadedVideos.length + activeDownloadsList.length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Top Header - YouTube style */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[color:var(--border)] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--primary)] ring-1 ring-[color:var(--border)] shadow-sm">
              <Download size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-2xl">
                  Downloads
                </h1>
                <span className="rounded-full bg-[color:var(--surface-hover)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--muted-foreground)]">
                  {totalCount} {totalCount === 1 ? 'video' : 'videos'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[color:var(--muted-foreground)]">
                Downloaded videos can be watched offline at any time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOffline && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-500">
                <WifiOff size={14} />
                <span>Offline Mode</span>
              </div>
            )}
            <Link
              href="/dashboard/movie"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface)] hover:bg-[color:var(--surface-hover)] border border-[color:var(--border)] px-4 py-2 text-xs font-bold text-[color:var(--foreground)] transition-colors shadow-sm"
            >
              <Film size={15} />
              <span>Explore Movies</span>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {totalCount === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/50 py-24 px-6 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--surface-hover)] text-[color:var(--muted-foreground)] mb-5">
              <Download size={36} className="opacity-80" />
            </div>
            <h2 className="text-lg font-bold text-[color:var(--foreground)] sm:text-xl">
              No downloaded videos yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-[color:var(--muted-foreground)] leading-relaxed">
              When watching movies or videos, click the <span className="font-semibold text-[color:var(--foreground)]">Download</span> button to save them in your app and watch offline anytime, just like on YouTube.
            </p>
            <Link
              href="/dashboard/movie"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:opacity-90 transition-opacity"
            >
              <Play size={16} fill="currentColor" />
              <span>Browse Movies to Download</span>
            </Link>
          </div>
        )}

        {/* Content Layout - YouTube Downloads Style */}
        {totalCount > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Left Column: Player Area when playing */}
            <div className="lg:col-span-7 xl:col-span-8">
              {activeVideo ? (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-[color:var(--border)]">
                    {activeUrl ? (
                      <ReactPlayer
                        ref={videoRef}
                        url={activeUrl}
                        playing={isPlaying}
                        muted={isMuted}
                        controls={true}
                        width="100%"
                        height="100%"
                        playsinline
                        config={{
                          file: {
                            forceVideo: true,
                          },
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-black/80">
                        <Loader2 className="animate-spin text-[color:var(--primary)]" size={36} />
                      </div>
                    )}
                  </div>

                  {/* Playing Video Metadata */}
                  <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-base font-bold text-[color:var(--foreground)] sm:text-lg">
                          {activeVideo.title}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
                          <span className="rounded bg-emerald-500/15 text-emerald-500 font-semibold px-2 py-0.5">
                            Downloaded
                          </span>
                          <span>•</span>
                          <span>{activeVideo.category || 'Movie'}</span>
                          {activeVideo.duration && (
                            <>
                              <span>•</span>
                              <span>{activeVideo.duration}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Saved in-app (IndexedDB)</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(activeVideo.id, e)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-colors"
                        title="Delete from downloads"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 text-center">
                  <Film size={40} className="text-[color:var(--muted-foreground)] mb-3" />
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">Select a video from the list to play offline</p>
                </div>
              )}
            </div>

            {/* Right Column: YouTube-style Downloads List */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-[color:var(--muted-foreground)]">
                  Downloaded Videos
                </h3>
                <span className="text-xs text-[color:var(--muted-foreground)]">
                  {downloadedVideos.length} completed
                </span>
              </div>

              {/* Ongoing Active Downloads */}
              {activeDownloadsList.length > 0 && (
                <div className="space-y-2">
                  <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-[color:var(--primary)] flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Downloading now</span>
                  </div>
                  {activeDownloadsList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-[color:var(--primary)]/30 bg-[color:var(--surface)] p-3 shadow-sm"
                    >
                      {/* Thumbnail with Circular Progress */}
                      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-[color:var(--surface-hover)]">
                        {item.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover opacity-60" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Film size={18} className="text-[color:var(--muted-foreground)]" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <CircularProgress progress={item.progress} size={32} strokeWidth={3} showPercent={true} />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[color:var(--foreground)]">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-[color:var(--primary)]">
                          Downloading {item.progress}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Completed Downloads List */}
              <div className="space-y-2">
                {downloadedVideos.map((video) => {
                  const isActive = video.id === activeVideoId;
                  return (
                    <div
                      key={video.id}
                      onClick={() => setActiveVideoId(video.id)}
                      className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-all shadow-sm ${
                        isActive
                          ? 'border-[color:var(--primary)] bg-[color:var(--surface-hover)] ring-1 ring-[color:var(--primary)]'
                          : 'border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-hover)]'
                      }`}
                    >
                      {/* Thumbnail with indicator */}
                      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-[color:var(--surface-hover)]">
                        {video.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Film size={20} className="text-[color:var(--muted-foreground)]" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-white">
                          {video.duration || 'Video'}
                        </div>
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play size={18} fill="white" className="text-white ml-0.5" />
                          </div>
                        )}
                      </div>

                      {/* Video Details */}
                      <div className="min-w-0 flex-1">
                        <h4 className={`line-clamp-2 text-xs font-semibold leading-snug transition-colors ${
                          isActive ? 'text-[color:var(--primary)]' : 'text-[color:var(--foreground)] group-hover:text-[color:var(--primary)]'
                        }`}>
                          {video.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[color:var(--muted-foreground)]">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          <span className="text-emerald-500 font-medium">Downloaded</span>
                          <span>•</span>
                          <span className="truncate">{video.category || 'Movie'}</span>
                        </div>
                      </div>

                      {/* Action Menu / Delete */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(video.id, e)}
                        className="rounded-lg p-2 text-[color:var(--muted-foreground)] opacity-70 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete from downloads"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
