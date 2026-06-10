'use client';

import React from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  Shuffle,
  Repeat,
  Video,
  Headphones,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Track } from './types';
import { formatTime, normalizeUrl } from './utils';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface NowPlayingSectionProps {
  currentTrack: Track;
  isPlaying: boolean;
  isVideoMode: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playerRef: React.RefObject<any>;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isFavorite: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onFavoriteToggle: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onVideoModeChange: (isVideo: boolean) => void;
  onReplay: () => void;
  onCurrentTimeUpdate: (time: number) => void;
  onDurationUpdate: (duration: number) => void;
  onTrackEnd: () => void;
}

/**
 * NowPlayingSection Component
 * Main hero section displaying current track with controls
 * Features: media player, playback controls, progress bar, volume control
 */
export const NowPlayingSection: React.FC<NowPlayingSectionProps> = ({
  currentTrack,
  isPlaying,
  isVideoMode,
  currentTime,
  duration,
  volume,
  playerRef,
  isShuffled,
  repeatMode,
  isFavorite,
  onPlayPause,
  onPrev,
  onNext,
  onShuffleToggle,
  onRepeatToggle,
  onFavoriteToggle,
  onSeek,
  onVolumeChange,
  onVideoModeChange,
  onReplay,
  onCurrentTimeUpdate,
  onDurationUpdate,
  onTrackEnd,
}) => {
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const progressContainer = e.currentTarget;
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    onSeek(newTime);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-[#0f1729] rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 border border-gray-700/50 relative overflow-hidden">
      {/* Background Blur Effect */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl scale-110 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${currentTrack.image})`, backgroundSize: 'cover' }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 lg:gap-10">
        {/* Media Display (Video Player or Album Art) */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-black">
          {isVideoMode && currentTrack.src ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              <ReactPlayer
                ref={playerRef}
                url={normalizeUrl(currentTrack.src)}
                playing={isPlaying}
                volume={volume}
                muted={false}
                onProgress={({ playedSeconds }) => onCurrentTimeUpdate(playedSeconds)}
                onDuration={onDurationUpdate}
                onEnded={onTrackEnd}
                width="100%"
                height="100%"
                controls={false}
                config={{
                  youtube: {
                    playerVars: {
                      showinfo: 0,
                      controls: 0,
                      autoplay: 1,
                      modestbranding: 1,
                    },
                  },
                }}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
          ) : (
            <div
              className="w-full h-full bg-cover bg-center transition-all duration-700 hover:scale-105"
              style={{ backgroundImage: `url(${currentTrack.image})` }}
            />
          )}

          {isVideoMode && (
            <div className="absolute top-2 right-2 bg-red-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">
              LIVE VIDEO
            </div>
          )}
        </div>

        {/* Track Info & Controls */}
        <div className="flex-1 text-center md:text-left w-full min-w-0 flex flex-col justify-center">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            <button
              onClick={() => onVideoModeChange(false)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                !isVideoMode
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              aria-pressed={!isVideoMode}
            >
              <Headphones size={16} /> <span className="hidden sm:inline">Audio</span>
            </button>
            <button
              onClick={() => onVideoModeChange(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isVideoMode
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              aria-pressed={isVideoMode}
            >
              <Video size={16} /> <span className="hidden sm:inline">Video</span>
            </button>
          </div>

          {/* Now Playing Badge */}
          <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-orange-400 text-xs font-medium mb-3 w-max mx-auto md:mx-0 border border-white/5">
            Now Playing
          </span>

          {/* Title & Artist */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 truncate text-white drop-shadow-md">
            {currentTrack.title}
          </h2>
          <p className="text-sm sm:text-lg text-gray-300 mb-6 truncate max-w-xl">{currentTrack.artist}</p>

          {/* Playback Controls */}
          <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-6 mb-6">
            <button
              onClick={onShuffleToggle}
              className={`p-2 rounded-full transition-colors ${
                isShuffled
                  ? 'text-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              aria-pressed={isShuffled}
              aria-label="Toggle shuffle"
            >
              <Shuffle size={18} />
            </button>

            <button
              onClick={onPrev}
              className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110"
              aria-label="Previous track"
            >
              <SkipBack size={24} fill="currentColor" />
            </button>

            <button
              onClick={onPlayPause}
              className="bg-orange-500 text-white rounded-full p-4 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
              aria-pressed={isPlaying}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" className="ml-1" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110"
              aria-label="Next track"
            >
              <SkipForward size={24} fill="currentColor" />
            </button>

            <button
              onClick={onRepeatToggle}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== 'off'
                  ? 'text-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              aria-pressed={repeatMode !== 'off'}
              aria-label={`Repeat mode: ${repeatMode}`}
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl w-full mx-auto md:mx-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium text-gray-400 w-10 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 bg-gray-700/50 rounded-full h-1.5 cursor-pointer group relative"
                onClick={handleSeek}
                role="slider"
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={duration || 0}
                aria-valuenow={currentTime}
              >
                <div
                  className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full relative transition-all duration-100 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400 w-10 text-left tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Visualizer */}
          <div
            className={`flex items-end justify-center md:justify-start gap-1 h-8 mt-6 overflow-hidden transition-opacity duration-300 ${
              isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className="w-1 bg-orange-500 rounded-t-sm"
                style={{
                  height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : '10%',
                  animation: isPlaying ? `bounce ${0.5 + Math.random()}s infinite alternate` : 'none',
                }}
              />
            ))}
          </div>

          <style jsx>{`
            @keyframes bounce {
              from {
                height: 20%;
              }
              to {
                height: 100%;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingSection;
