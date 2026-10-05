'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type ReactPlayer from 'react-player';
import { ArrowLeft, Maximize, Pause, Play, RotateCcw, RotateCw, Settings, Volume2, VolumeX } from 'lucide-react';
import { clearMovieProgress, saveMovieProgress } from './movieProgress';

const ReactPlayerClient = dynamic(() => import('react-player/lazy'), { ssr: false });

interface MovieVideoPlayerProps {
  videoId: string;
  title: string;
  poster: string;
  playing: boolean;
  resumeToken?: number;
  initialResumeSeconds?: number;
  onClose: () => void;
  onProgress: (currentTime: number, duration: number) => void;
  onPlaybackStateChange: (playing: boolean) => void;
  previewLimitSeconds?: number;
  onPreviewLimitReached?: () => void;
  onEnded: () => void;
}

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export default function MovieVideoPlayer({
  videoId,
  title,
  poster,
  playing,
  resumeToken = 0,
  initialResumeSeconds = 0,
  onClose,
  onProgress,
  onPlaybackStateChange,
  previewLimitSeconds,
  onPreviewLimitReached,
  onEnded,
}: MovieVideoPlayerProps) {
  const playerRef = useRef<ReactPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTriggeredRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(playing);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [playbackError, setPlaybackError] = useState(false);

  useEffect(() => {
    setIsPlaying(playing);
  }, [playing]);

  useEffect(() => {
    setReady(false);
    setPlaybackError(false);
    setCurrentTime(0);
    setDuration(0);
    previewTriggeredRef.current = false;
  }, [videoId]);

  useEffect(() => {
    if (resumeToken > 0) setIsPlaying(playing);
  }, [playing, resumeToken]);

  useEffect(() => () => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
  }, []);

  const handleProgress = useCallback((state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
    onProgress(state.playedSeconds, duration);
    saveMovieProgress(videoId, state.playedSeconds, duration);
    if (previewLimitSeconds && state.playedSeconds >= previewLimitSeconds && !previewTriggeredRef.current) {
      previewTriggeredRef.current = true;
      setIsPlaying(false);
      onPlaybackStateChange(false);
      saveMovieProgress(videoId, state.playedSeconds, duration);
      onPreviewLimitReached?.();
    }
  }, [duration, onPlaybackStateChange, onPreviewLimitReached, onProgress, previewLimitSeconds, videoId]);

  const handleReady = () => {
    setReady(true);
    setPlaybackError(false);
    if (initialResumeSeconds > 0) {
      playerRef.current?.seekTo(initialResumeSeconds, 'seconds');
      setCurrentTime(initialResumeSeconds);
    }
  };

  const handleDuration = useCallback((actualDuration: number) => {
    setDuration(actualDuration);
    onProgress(currentTime, actualDuration);
  }, [currentTime, onProgress]);

  const showControlsBriefly = () => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (isPlaying) {
      controlsTimer.current = setTimeout(() => setControlsVisible(false), 3200);
    }
  };

  const seekBy = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(duration, currentTime + seconds));
    playerRef.current?.seekTo(nextTime, 'seconds');
    setCurrentTime(nextTime);
  };

  const seekToPercent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fraction = Number(event.target.value) / 100;
    const nextTime = fraction * duration;
    playerRef.current?.seekTo(fraction, 'fraction');
    setCurrentTime(nextTime);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (!nextMuted && volume === 0) setVolume(0.75);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    const internalPlayer = playerRef.current?.getInternalPlayer();
    if (typeof internalPlayer?.setPlaybackRate === 'function') internalPlayer.setPlaybackRate(rate);
    setSettingsOpen(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void containerRef.current.requestFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      className="group/player relative aspect-video w-full overflow-hidden rounded-md bg-[#08090b] shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:rounded-xl"
      onMouseMove={showControlsBriefly}
      onMouseEnter={() => setControlsVisible(true)}
      onMouseLeave={() => { if (isPlaying) setControlsVisible(false); }}
    >
      <div className="absolute inset-0 z-0">
        <ReactPlayerClient
          key={videoId}
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
          width="100%"
          height="100%"
          playing={playing && isPlaying}
          muted={muted}
          volume={volume}
          playbackRate={playbackRate}
          controls={false}
          playsinline
          progressInterval={500}
          onReady={handleReady}
          onPlay={() => { setIsPlaying(true); onPlaybackStateChange(true); }}
          onPause={() => { setIsPlaying(false); onPlaybackStateChange(false); }}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={() => { clearMovieProgress(videoId); setIsPlaying(false); onPlaybackStateChange(false); onEnded(); }}
          onError={() => setPlaybackError(true)}
          config={{ youtube: { playerVars: { controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3, playsinline: 1 } } }}
        />
      </div>

      {!ready && !playbackError && (
        <div className="absolute inset-0 z-10 overflow-hidden bg-[color:var(--surface)]" aria-label="Loading movie">
          <Image src={poster} alt="" fill priority sizes="(max-width: 768px) 100vw, 1080px" unoptimized className="scale-105 object-cover opacity-30 blur-sm" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-x-0 bottom-0 space-y-4 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-16 sm:px-7 sm:pb-6">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/20"><div className="h-full w-1/3 animate-pulse rounded-full bg-white/70" /></div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/20" />
              <div className="h-3 w-28 animate-pulse rounded bg-white/20" />
              <div className="ml-auto h-3 w-16 animate-pulse rounded bg-white/15" />
            </div>
          </div>
          <div className="absolute left-4 top-4 h-8 w-32 animate-pulse rounded-md bg-white/15 sm:left-6 sm:top-5" />
        </div>
      )}

      {playbackError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/90 px-5 text-center text-white">
          <p className="text-sm font-semibold">This title cannot be embedded by its video owner.</p>
          <a href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black">Open original video</a>
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 z-30 flex items-center gap-2.5 rounded-lg bg-black/35 px-2 py-1.5 shadow-lg backdrop-blur-sm sm:left-5 sm:top-4">
        <Image src="/logos_and_pwas/android-chrome-192x192.png" alt="SawaFlix" width={28} height={28} className="rounded-md object-contain" />
        <span className="text-xs font-extrabold text-white drop-shadow sm:text-sm">SawaFlix</span>
      </div>

      <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-end bg-gradient-to-b from-black/80 via-black/30 to-transparent px-3 pb-10 pt-3 transition-opacity duration-300 sm:px-5 sm:pt-4 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex min-w-0 items-center gap-2">
          {previewLimitSeconds && <span className="rounded-full border border-white/25 bg-black/45 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white sm:text-[10px]">Preview · {Math.max(0, Math.ceil(previewLimitSeconds - currentTime))}s</span>}
          <p className="hidden max-w-[min(42vw,420px)] truncate text-xs font-semibold text-white drop-shadow sm:block">{title}</p>
          <button type="button" onClick={onClose} aria-label="Back to movie details" title="Back to details" className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-white/20">
            <ArrowLeft size={19} />
          </button>
        </div>
      </div>

      {!playbackError && (
        <>
          <div className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center gap-5 transition-opacity duration-300 sm:gap-8 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <button type="button" onClick={() => seekBy(-10)} aria-label="Back 10 seconds" className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-transform hover:scale-105 sm:h-12 sm:w-12"><RotateCcw size={20} /></button>
            <button type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? 'Pause movie' : 'Play movie'} className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-105 sm:h-[68px] sm:w-[68px]">
              {isPlaying ? <Pause size={27} fill="currentColor" /> : <Play size={27} fill="currentColor" className="ml-1" />}
            </button>
            <button type="button" onClick={() => seekBy(10)} aria-label="Forward 10 seconds" className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-transform hover:scale-105 sm:h-12 sm:w-12"><RotateCw size={20} /></button>
          </div>

          <div className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-3 pb-3 pt-12 text-white transition-opacity duration-300 sm:px-5 sm:pb-4 ${controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
            <input
              type="range"
              min="0"
              max="100"
              value={duration > 0 ? (currentTime / duration) * 100 : 0}
              onChange={seekToPercent}
              aria-label="Seek movie"
              className="mb-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-white"
              style={{ background: `linear-gradient(to right, #fff ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,.28) 0)` }}
            />
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? 'Pause movie' : 'Play movie'} className="flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/15">{isPlaying ? <Pause size={19} /> : <Play size={19} />}</button>
              <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute movie' : 'Mute movie'} className="flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/15">{muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => { const nextVolume = Number(event.target.value); setVolume(nextVolume); if (nextVolume > 0) setMuted(false); }} aria-label="Volume" className="hidden w-20 accent-white sm:block" />
              <span className="whitespace-nowrap text-[10px] font-medium tabular-nums text-white/80 sm:text-xs">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <div className="ml-auto flex items-center gap-1">
                <div className="relative">
                  <button type="button" onClick={() => setSettingsOpen((open) => !open)} aria-label="Playback settings" className="flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-white hover:bg-white/15"><Settings size={17} /><span className="hidden sm:inline">{playbackRate}x</span></button>
                  {settingsOpen && <div className="absolute bottom-full right-0 mb-2 min-w-24 overflow-hidden rounded-lg border border-white/15 bg-black/90 p-1 shadow-xl backdrop-blur"><p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50">Speed</p>{PLAYBACK_RATES.map((rate) => <button key={rate} type="button" onClick={() => changeRate(rate)} className={`block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-white/10 ${rate === playbackRate ? 'font-bold text-white' : 'text-white/70'}`}>{rate}x</button>)}</div>}
                </div>
                <button type="button" onClick={toggleFullscreen} aria-label="Toggle fullscreen" className="flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/15"><Maximize size={18} /></button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
