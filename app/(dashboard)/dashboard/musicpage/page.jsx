// @ts-check
'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, RotateCcw, Volume2, Download, Shuffle, Repeat, Video, Headphones, Loader2, ListMusic, MoreVertical } from 'lucide-react';
import { useMusic } from '@/components/MusicContext';
import dynamic from 'next/dynamic';
import { BACKEND_URL } from '@/lib/apiConfig';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const normalizeUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return url;
};

// Fallback image from Dashboard Hero
const DEFAULT_MUSIC_THUMBNAIL = "https://i.ibb.co/WWhx2c0g/sawaflixmusic-cover.png";

export default function MusicPage() {
  const {
    currentTrack: globalTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    playTrack,
    currentTime,
    duration,
    seekTo,
    volume,
    setVolume,
    muted,
    playerRef,
    setCurrentTime,
    setDuration,
    isVideoMode,
    setIsVideoMode,
    playlist,
    currentIndex
  } = useMusic();

  const [musicCategories, setMusicCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // Local UI state
  const [favorites, setFavorites] = useState(new Set());
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/videos/external/youtube/music-categories`);
        if (res.ok) {
          const data = await res.json();
          setMusicCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch music categories:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    setRepeatMode(prev => modes[(modes.indexOf(prev) + 1) % modes.length]);
  };

  const handleSeek = (e) => {
    if (!duration) return;
    const progressContainer = e.currentTarget;
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekTo(newTime);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const defaultTrack = {
    id: 0,
    title: "Select a Song",
    artist: "Sawaflix Music",
    image: DEFAULT_MUSIC_THUMBNAIL,
    src: "",
  };

  const currentTrack = globalTrack || defaultTrack;

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-8">
      <div className="h-80 bg-gray-800 rounded-2xl w-full"></div>
      <div>
        <div className="h-8 bg-gray-800 rounded w-48 mb-4"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 sm:w-64 space-y-3">
              <div className="w-full aspect-video bg-gray-800 rounded-lg"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = ['All', ...musicCategories.map(c => c.category).filter(Boolean)];
  const filteredCategories = activeTab === 'All' 
    ? musicCategories 
    : musicCategories.filter(c => c.category === activeTab);

  return (
    <div 
      className="min-h-full bg-gray-900 text-white p-2 xs:p-3 sm:p-6 lg:p-8 pb-32 transition-all duration-300"
      style={{ zoom: 0.85 }}
    >
      {/* Sticky Header */}
      <div className="mb-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md pt-2 pb-4 border-b border-gray-800">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-black mb-1 truncate text-white tracking-tight">Sawa Music</h1>
          <p className="text-xs xs:text-sm sm:text-base text-gray-400 truncate">Listen or Watch Cameroonian hits</p>
        </div>
        
        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 bg-gray-800 p-1 rounded-full border border-gray-700/50 shadow-inner">
          <button
            onClick={() => setIsVideoMode(false)}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              !isVideoMode ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Headphones size={18} /> <span className="hidden sm:inline">Audio</span>
          </button>
          <button
            onClick={() => setIsVideoMode(true)}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isVideoMode ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video size={18} /> <span className="hidden sm:inline">Video</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      {!isLoading && tabs.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-none mb-8 pb-2">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeTab === tab 
                ? 'bg-white text-black border-white shadow-lg scale-105' 
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <div className="space-y-12">
          
          {/* Now Playing Hero Section - 3 Column Layout */}
          <div className="bg-gray-800/80 rounded-3xl p-4 sm:p-6 lg:p-8 mb-8 border border-gray-700/50 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* Media Thumbnail or Video Player (Left col) */}
              <div className="lg:col-span-4 relative w-full max-w-sm mx-auto aspect-square lg:aspect-video flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-black group">
                {isVideoMode && currentTrack.src ? (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <ReactPlayer
                      ref={playerRef}
                      url={normalizeUrl(currentTrack.src)}
                      playing={isPlaying}
                      volume={volume}
                      muted={muted}
                      onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
                      onDuration={(d) => setDuration(d)}
                      onEnded={playNext}
                      width="100%"
                      height="100%"
                      controls={false}
                      config={{
                        youtube: {
                          playerVars: { showinfo: 0, controls: 0, autoplay: 1, modestbranding: 1 }
                        }
                      }}
                      style={{ transform: 'scale(1.2)' }} 
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 cursor-pointer"
                    style={{ backgroundImage: `url(${currentTrack.image})` }}
                  />
                )}
                
                {isVideoMode && (
                  <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur text-white text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
                  </div>
                )}
              </div>

              {/* Track Info & In-Page Controls (Middle col) */}
              <div className="lg:col-span-4 flex flex-col justify-center text-center">
                <span className="inline-block px-4 py-1.5 bg-gray-900/50 rounded-full text-red-500 text-xs font-bold mb-4 w-max mx-auto border border-red-500/20 shadow-inner">
                  Now Playing
                </span>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 truncate text-white drop-shadow-lg cursor-pointer hover:text-red-500 transition-colors">
                  {currentTrack.title}
                </h2>
                <p className="text-base sm:text-xl text-gray-400 mb-8 truncate cursor-pointer hover:text-gray-300">
                  {currentTrack.artist}
                </p>

                {/* Primary Controls */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8">
                  <button onClick={toggleShuffle} className={`cursor-pointer p-2 rounded-full transition-colors ${isShuffled ? 'text-red-500' : 'text-gray-500 hover:text-white'}`}>
                    <Shuffle size={20} />
                  </button>
                  <button onClick={playPrev} className="cursor-pointer p-3 hover:bg-gray-700 rounded-full transition-all hover:-translate-x-1 active:scale-95">
                    <SkipBack size={28} fill="currentColor" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="cursor-pointer bg-red-600 text-white rounded-full p-5 hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                  >
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                  </button>
                  <button onClick={playNext} className="cursor-pointer p-3 hover:bg-gray-700 rounded-full transition-all hover:translate-x-1 active:scale-95">
                    <SkipForward size={28} fill="currentColor" />
                  </button>
                  <button onClick={toggleRepeat} className={`cursor-pointer p-2 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-red-500' : 'text-gray-500 hover:text-white'}`}>
                    <Repeat size={20} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-gray-400 w-12 text-right tabular-nums">{formatTime(currentTime)}</span>
                    <div
                      className="flex-1 bg-gray-700 rounded-full h-2 cursor-pointer group relative overflow-hidden"
                      onClick={handleSeek}
                    >
                      <div
                        className="bg-red-600 h-full rounded-full relative transition-all duration-100"
                        style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-150"></div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 w-12 text-left tabular-nums">{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              {/* Up Next Sidebar (Right col) */}
              <div className="lg:col-span-4 bg-gray-900/50 rounded-2xl border border-gray-700/50 overflow-hidden h-72 lg:h-96 flex flex-col shadow-inner">
                <div className="p-4 border-b border-gray-800 bg-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-gray-200">
                    <ListMusic size={18} className="text-red-500" />
                    Up Next
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-900 px-2 py-1 rounded-full">
                    {playlist.length} Tracks
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-2 space-y-1">
                  {playlist.length > 0 ? playlist.map((track, idx) => {
                    const isQueueActive = track.id === currentTrack.id;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => playTrack(track, playlist)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                          isQueueActive ? 'bg-red-600/10 border border-red-500/20' : 'hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black shadow">
                          <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                          {isQueueActive && isPlaying && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-[2px]">
                              <div className="w-1 bg-red-500 h-[60%] animate-pulse"></div>
                              <div className="w-1 bg-red-500 h-[40%] animate-pulse delay-75"></div>
                              <div className="w-1 bg-red-500 h-[80%] animate-pulse delay-150"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate ${isQueueActive ? 'text-red-500' : 'text-gray-200'}`}>
                            {track.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                        </div>
                        <button className="text-gray-500 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    );
                  }) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <ListMusic size={32} className="mb-2 opacity-50" />
                      <p className="text-sm font-medium">Queue is empty</p>
                      <p className="text-xs mt-1">Play a track to start a session</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Dynamic Categories Rows */}
          <div className="space-y-12">
            {filteredCategories.map((categoryData, categoryIdx) => {
              if (!categoryData.videos || categoryData.videos.length === 0) return null;
              
              return (
                <div key={categoryIdx} className="w-full">
                  <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-2">
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white border-l-4 border-red-600 pl-3">
                      {categoryData.category}
                    </h3>
                    <button className="cursor-pointer text-sm font-bold text-gray-400 hover:text-white transition-colors bg-gray-800 px-4 py-1.5 rounded-full border border-gray-700 hover:border-gray-500">
                      See All
                    </button>
                  </div>
                  
                  {/* Horizontal Scroll Container */}
                  <div className="flex gap-5 sm:gap-8 overflow-x-auto scrollbar-none pb-8 pt-2 -mx-2 px-2 sm:-mx-0 sm:px-0 scroll-smooth snap-x">
                    {categoryData.videos.map((video, videoIdx) => {
                      const trackObj = {
                        id: video.id,
                        title: video.title,
                        artist: video.channelTitle,
                        image: video.thumbnail || DEFAULT_MUSIC_THUMBNAIL,
                        src: video.videoUrl,
                        duration: "3:00"
                      };
                      
                      const isTrackPlaying = isPlaying && globalTrack?.id === trackObj.id;
                      const isLiked = favorites.has(trackObj.id);

                      return (
                        <div 
                          key={videoIdx} 
                          className="flex-shrink-0 w-64 sm:w-80 group cursor-pointer snap-start"
                        >
                          {/* Card Image (Classic Sawaflix 16:9) */}
                          <div 
                            className="relative w-full aspect-video mb-4 rounded-2xl overflow-hidden bg-gray-800 shadow-lg group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:-translate-y-2 border border-transparent group-hover:border-gray-700"
                            onClick={() => {
                              if (globalTrack?.id === trackObj.id) {
                                togglePlay();
                              } else {
                                const playlist = categoryData.videos.map(v => ({
                                  id: v.id,
                                  title: v.title,
                                  artist: v.channelTitle,
                                  image: v.thumbnail || DEFAULT_MUSIC_THUMBNAIL,
                                  src: v.videoUrl
                                }));
                                playTrack(trackObj, playlist);
                              }
                            }}
                          >
                            <img 
                              src={trackObj.image} 
                              alt={trackObj.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              loading="lazy"
                            />
                            
                            {/* Hover / Playing Overlay */}
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button className="cursor-pointer bg-red-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-95 transition-all">
                                {isTrackPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                              </button>
                            </div>
                            
                            {/* Playing Indicator */}
                            {isTrackPlaying && (
                              <div className="absolute top-3 left-3 flex gap-1 h-4 items-end bg-black/60 px-2 py-1.5 rounded backdrop-blur">
                                <div className="w-1.5 bg-red-500 h-full animate-pulse"></div>
                                <div className="w-1.5 bg-red-500 h-2/3 animate-pulse delay-75"></div>
                                <div className="w-1.5 bg-red-500 h-full animate-pulse delay-150"></div>
                              </div>
                            )}

                            {/* Duration Badge */}
                            <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-[10px] font-bold tracking-wider text-white backdrop-blur">
                              3:00
                            </div>
                          </div>
                          
                          {/* Card Info */}
                          <div className="flex gap-3 px-1 items-start">
                            {/* Channel Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex-shrink-0 overflow-hidden mt-1 shadow-md">
                              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${trackObj.artist}`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-base sm:text-lg text-gray-100 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors cursor-pointer mb-1">
                                {trackObj.title}
                              </h4>
                              <p className="text-gray-400 text-sm truncate mt-0.5 cursor-pointer hover:text-white transition-colors">
                                {trackObj.artist}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">1M views • 2 weeks ago</p>
                            </div>

                            {/* Like Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(trackObj.id);
                              }}
                              className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-800 active:scale-75 cursor-pointer"
                            >
                              <Heart size={20} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}