'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player/lazy';
import {
  DownloadCloud, Play, Pause, Trash2, WifiOff,
  Volume2, VolumeX, ChevronUp, ChevronDown, Loader2
} from 'lucide-react';
import { getCachedVideoMetadata, removeCachedVideo } from '@/lib/videoPreloader';
import { getOfflineVideoObjectURL } from '@/lib/offlineStorage';

export default function DownloadsPage() {
  const [videos, setVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [activeUrl, setActiveUrl] = useState(null);
  
  // Track ongoing downloads
  const [downloadsInProgress, setDownloadsInProgress] = useState({});

  const videoRef = useRef(null);

  // Load all pre-cached video metadata on mount
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    async function loadOfflineVideos() {
      const meta = await getCachedVideoMetadata();
      setVideos(meta);
      setLoading(false);
    }
    loadOfflineVideos();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to download progress events
  useEffect(() => {
    const handleProgress = (e) => {
      const { id, progress, complete } = e.detail;
      if (complete) {
        setDownloadsInProgress(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        // Refresh video list when a new download finishes!
        getCachedVideoMetadata().then(setVideos);
      } else {
        setDownloadsInProgress(prev => ({ ...prev, [id]: progress }));
      }
    };

    window.addEventListener('video-download-progress', handleProgress);
    return () => window.removeEventListener('video-download-progress', handleProgress);
  }, []);

  // Resolve IndexedDB Blob to ObjectURL for the active video
  useEffect(() => {
    let currentUrl = null;
    const activeVideo = videos[activeIndex];

    async function resolveBlobUrl() {
      if (!activeVideo) return;
      const objectUrl = await getOfflineVideoObjectURL(activeVideo.id);
      setActiveUrl(objectUrl);
      currentUrl = objectUrl;
    }

    resolveBlobUrl();
    setIsPlaying(true);

    // Cleanup object URL when activeIndex changes
    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [activeIndex, videos]);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);
  const toggleMute = useCallback(() => setIsMuted(m => !m), []);

  const scrollNext = useCallback(() => {
    setActiveIndex(i => Math.min(i + 1, videos.length - 1));
    setIsPlaying(false);
  }, [videos.length]);

  const scrollPrev = useCallback(() => {
    setActiveIndex(i => Math.max(i - 1, 0));
    setIsPlaying(false);
  }, []);

  const handleRemove = useCallback(async (video) => {
    await removeCachedVideo(video.id, video.videoUrl);
    setVideos(prev => {
      const updated = prev.filter(v => v.id !== video.id);
      setActiveIndex(i => (i >= updated.length ? Math.max(0, updated.length - 1) : i));
      return updated;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown') scrollNext();
      if (e.key === 'ArrowUp') scrollPrev();
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scrollNext, scrollPrev, togglePlay]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080C] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#CE1126]" size={40} />
      </div>
    );
  }

  const isDownloadingAny = Object.keys(downloadsInProgress).length > 0;

  if (videos.length === 0 && !isDownloadingAny) {
    return (
      <div className="min-h-screen bg-[#06080C] p-6 lg:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FCD116]/10 flex items-center justify-center">
            <DownloadCloud size={20} className="text-[#FCD116]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">My Downloads</h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium">Your offline video library.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <DownloadCloud size={32} className="text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No offline videos yet</h2>
          <p className="text-zinc-500 max-w-sm">
            Watch videos while online — they'll be automatically saved into IndexedDB so you can enjoy them offline.
          </p>
        </div>
      </div>
    );
  }

  const active = videos[activeIndex];

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">

      {/* Main Content Area */}
      {videos.length > 0 ? (
        <div
          className="relative flex-1 flex items-center justify-center bg-black overflow-hidden"
          style={{ minHeight: '100svh' }}
        >
          {/* Video Player */}
          {activeUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ReactPlayer
                ref={videoRef}
                url={activeUrl}
                playing={isPlaying}
                muted={isMuted}
                loop={true}
                width="100%"
                height="100%"
                style={{ objectFit: 'contain' }}
                config={{
                  file: {
                    forceVideo: true,
                  }
                }}
              />
            </div>
          )}

          {/* Play/Pause Interceptor Shield */}
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={togglePlay}
          />

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <DownloadCloud size={18} className="text-[#FCD116]" />
              <span className="text-white text-sm font-bold">My Downloads</span>
            </div>
            {isOffline && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                <WifiOff size={12} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-semibold">Offline</span>
              </div>
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 pointer-events-none">
            <h2 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-lg">{active.title}</h2>
            <p className="text-zinc-400 text-sm mb-3">{active.category ?? 'Video'} • Offline (IndexedDB)</p>
            <p className="text-zinc-600 text-xs">↑↓ arrows to navigate · Space to play/pause</p>
          </div>

          {/* Right-side controls */}
          <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-4">
            <button
              onClick={toggleMute}
              className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
            </button>
            <button
              onClick={() => handleRemove(active)}
              className="w-11 h-11 rounded-full bg-red-600/20 backdrop-blur-sm border border-red-500/30 flex items-center justify-center hover:bg-red-600/40 transition-colors"
            >
              <Trash2 size={18} className="text-red-400" />
            </button>
            <div className="text-center">
              <span className="text-white font-bold text-sm">{activeIndex + 1}</span>
              <span className="text-zinc-500 text-xs block">of {videos.length}</span>
            </div>
          </div>

          {/* Center play/pause tap */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <Play size={32} fill="white" className="text-white ml-1" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#06080C]">
          <Loader2 className="animate-spin text-[#FCD116] mb-4" size={40} />
          <p className="text-white font-bold">Videos are currently downloading...</p>
        </div>
      )}

      {/* Sidebar queue on desktop */}
      <div className="hidden md:flex flex-col w-80 bg-zinc-950 border-l border-white/5 overflow-y-auto">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 sticky top-0 z-10">
          <h3 className="text-white font-bold text-sm">Library Queue ({videos.length})</h3>
          <div className="flex gap-2">
            <button onClick={scrollPrev} disabled={activeIndex === 0}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition">
              <ChevronUp size={14} className="text-white" />
            </button>
            <button onClick={scrollNext} disabled={activeIndex === videos.length - 1}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition">
              <ChevronDown size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* Active Downloads Section */}
        {Object.entries(downloadsInProgress).length > 0 && (
          <div className="p-4 border-b border-white/5 bg-zinc-900/30">
            <h4 className="text-xs font-bold text-[#FCD116] uppercase tracking-wider mb-3">Downloading Now</h4>
            {Object.entries(downloadsInProgress).map(([id, progress]) => (
              <div key={id} className="mb-3 last:mb-0">
                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                  <span>Downloading video...</span>
                  <span className="text-[#00A859] font-mono">{progress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#FCD116] to-[#00A859] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {videos.map((video, i) => (
            <button
              key={video.id}
              onClick={() => { setActiveIndex(i); setIsPlaying(false); }}
              className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${i === activeIndex ? 'bg-[#CE1126]/15 border-l-2 border-[#CE1126]' : 'hover:bg-white/5'
                }`}
            >
              <div className="w-14 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0 relative">
                {video.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play size={16} className="text-zinc-600" />
                  </div>
                )}
                {i === activeIndex && (
                  <div className="absolute inset-0 bg-[#CE1126]/30 flex items-center justify-center">
                    {isPlaying ? <Pause size={12} fill="white" className="text-white" /> : <Play size={12} fill="white" className="text-white" />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold leading-tight truncate ${i === activeIndex ? 'text-white' : 'text-zinc-300'}`}>
                  {video.title}
                </p>
                <p className="text-[#00A859] font-medium text-[10px] mt-0.5">Saved Offline</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
