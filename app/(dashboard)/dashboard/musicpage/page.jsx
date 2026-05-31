// @ts-check
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, MoreVertical, ChevronRight, ChevronLeft } from 'lucide-react';
import { useMusic } from '@/components/MusicContext';
import { BACKEND_URL } from '@/lib/apiConfig';

const COVER_BG = "https://i.ibb.co/Hfms4vV9/coverbg.png";
const MUSIC_CARD_THUMB = "https://i.ibb.co/21Dd0zTh/sound.png";

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
  const [favorites, setFavorites] = useState(new Set());

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

  const defaultTabs = ['All', 'Mboko', 'Makossa', 'Bamenda', 'Nso', 'West', 'Afro', 'Culture', 'North', 'Fulbe'];
  const apiTabs = musicCategories.map(c => c.category).filter(Boolean);
  const tabs = Array.from(new Set([...defaultTabs, ...apiTabs]));

  const filteredCategories = activeTab === 'All'
    ? musicCategories
    : musicCategories.filter(c => c.category === activeTab);

  const scrollContainer = (id, direction) => {
    const container = document.getElementById(id);
    if (container) {
      const scrollAmount = Math.max(300, container.offsetWidth * 0.8);
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-8">
      {/* Banner skeleton */}
      <div className="h-64 sm:h-80 bg-gray-800/50 rounded-2xl w-full"></div>
      {/* Tabs skeleton */}
      <div className="flex gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-24 bg-gray-800/50 rounded-full"></div>
        ))}
      </div>
      {/* Cards skeleton */}
      <div>
        <div className="h-6 bg-gray-800/50 rounded w-32 mb-4"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-44 space-y-3">
              <div className="w-full aspect-square bg-gray-800/50 rounded-xl"></div>
              <div className="h-3 bg-gray-800/50 rounded w-3/4"></div>
              <div className="h-2 bg-gray-800/50 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="music-page-root">
      <style jsx>{`
        .music-page-root {
          min-height: 100%;
          color: #fff;
          padding-bottom: 120px;
        }

        /* ====== HERO BANNER ====== */
        .music-hero-banner {
          position: relative;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 28px;
          min-height: 400px;
          display: flex;
          align-items: flex-end;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .music-hero-banner .hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .music-hero-banner .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(11,14,20,0.97) 0%,
            rgba(11,14,20,0.7) 35%,
            rgba(11,14,20,0.2) 60%,
            transparent 100%
          );
        }
        .music-hero-banner .hero-content {
          position: relative;
          z-index: 2;
          padding: 32px 28px 28px;
          width: 100%;
        }
        .premium-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(229,9,20,0.15);
          border: 1px solid rgba(229,9,20,0.3);
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          color: #FF6B6B;
          letter-spacing: 0.5px;
          margin-bottom: 14px;
          backdrop-filter: blur(10px);
        }
        .premium-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #E50914;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .hero-title {
          font-size: 38px;
          font-weight: 900;
          color: #fff;
          margin: 0 0 10px 0;
          line-height: 1.1;
          letter-spacing: -1px;
        }
        .hero-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          margin: 0 0 22px 0;
          line-height: 1.6;
          max-width: 480px;
        }
        .hero-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-listen {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 26px;
          background: #E50914;
          color: #fff;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(229,9,20,0.4);
        }
        .btn-listen:hover {
          background: #FF1A25;
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(229,9,20,0.5);
        }
        .btn-explore {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 26px;
          background: transparent;
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 25px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .btn-explore:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.5);
          transform: translateY(-2px);
        }

        /* ====== TABS ====== */
        .tabs-row {
          display: flex;
          gap: 10px;
          margin-bottom: 28px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .tabs-row::-webkit-scrollbar { display: none; }
        .tab-btn {
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
          background: transparent;
          color: #AAAAAA;
        }
        .tab-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }
        .tab-btn.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
          font-weight: 600;
        }

        /* ====== CATEGORY SECTION ====== */
        .category-section {
          margin-bottom: 36px;
        }
        .category-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .category-accent {
          width: 4px;
          height: 26px;
          border-radius: 4px;
          background: #E50914;
          flex-shrink: 0;
        }
        .category-name {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
        }

        /* ====== DESKTOP GRID CARDS ====== */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 20px;
          padding-bottom: 12px;
        }

        .music-card {
          width: 100%;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .music-card:hover {
          transform: translateY(-4px);
        }
        .music-card-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 10px;
          background: #1a1f2e;
        }
        .music-card-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .music-card:hover .music-card-thumb img {
          transform: scale(1.08);
        }
        .music-card-thumb .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .music-card:hover .play-overlay,
        .music-card-thumb .play-overlay.visible {
          opacity: 1;
        }
        .play-overlay .play-btn-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(229,9,20,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(229,9,20,0.4);
          transition: transform 0.2s ease;
        }
        .play-overlay .play-btn-circle:hover {
          transform: scale(1.1);
        }
        .music-card-thumb .duration-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0,0,0,0.8);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
          letter-spacing: 0.5px;
        }
        /* Cameroon flag colored playing indicator on card */
        .music-card-thumb .cameroon-playing-indicator {
          position: absolute;
          top: 8px;
          left: 8px;
          display: flex;
          gap: 2px;
          align-items: flex-end;
          height: 16px;
          background: rgba(0,0,0,0.6);
          padding: 3px 6px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }
        .cameroon-playing-indicator .bar {
          width: 3px;
          border-radius: 2px;
          animation: eq-bounce 0.8s ease-in-out infinite;
        }
        .cameroon-playing-indicator .bar:nth-child(1) {
          background: #009639;
          height: 60%;
          animation-delay: 0s;
        }
        .cameroon-playing-indicator .bar:nth-child(2) {
          background: #CE1126;
          height: 100%;
          animation-delay: 0.15s;
        }
        .cameroon-playing-indicator .bar:nth-child(3) {
          background: #FCD116;
          height: 40%;
          animation-delay: 0.3s;
        }
        .cameroon-playing-indicator .bar:nth-child(4) {
          background: #009639;
          height: 80%;
          animation-delay: 0.45s;
        }
        .cameroon-playing-indicator .bar:nth-child(5) {
          background: #CE1126;
          height: 50%;
          animation-delay: 0.6s;
        }
        @keyframes eq-bounce {
          0%,100% { height: 30%; }
          50% { height: 100%; }
        }
        .music-card-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 3px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .music-card-artist {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ====== MOBILE LIST CARDS ====== */
        .mobile-list {
          display: none;
          flex-direction: column;
          gap: 4px;
        }
        .mobile-list-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .mobile-list-item:hover,
        .mobile-list-item.active-track {
          background: rgba(255,255,255,0.04);
        }
        .mobile-list-thumb {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
          background: #1a1f2e;
        }
        .mobile-list-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mobile-list-info {
          flex: 1;
          min-width: 0;
        }
        .mobile-list-title {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 3px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mobile-list-artist {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }
        .mobile-list-more {
          color: rgba(255,255,255,0.3);
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
          background: none;
          border: none;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .mobile-list-more:hover {
          color: #fff;
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 768px) {
          .music-hero-banner {
            min-height: 240px;
            border-radius: 0;
            margin-left: -16px;
            margin-right: -16px;
            width: calc(100% + 32px);
          }
          .music-hero-banner .hero-content {
            padding: 20px 18px 22px;
          }
          .hero-title {
            font-size: 28px;
          }
          .hero-subtitle {
            font-size: 13px;
          }
          .cards-grid {
            display: none !important;
          }
          .mobile-list {
            display: flex;
          }
          .category-name {
            font-size: 18px;
          }
        }
        @media (min-width: 769px) {
          .music-hero-banner {
            min-height: 340px;
          }
          .mobile-list {
            display: none !important;
          }
          .cards-grid {
            display: grid !important;
          }
        }
        @media (min-width: 1200px) {
          .music-hero-banner {
            min-height: 380px;
          }
          .hero-title {
            font-size: 44px;
          }
          .cards-grid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          }
        }
      `}</style>

      {/* ====== HERO BANNER ====== */}
      <div className="music-hero-banner">
        <img
          src={COVER_BG}
          alt="Sawa Music Cover"
          className="hero-bg"
          loading="eager"
        />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="premium-badge">
            <span className="dot"></span>
            PREMIUM VIBES
          </div>
          <h1 className="hero-title">Sawa Music</h1>
          <p className="hero-subtitle">
            The rhythm of our roots. Experience the ultimate Cameroonian
            sounds in high fidelity, carefully curated for your soul.
          </p>
          <div className="hero-buttons">
            <button className="btn-listen">
              <Play size={16} fill="currentColor" />
              Listen Now
            </button>
            <button className="btn-explore">
              Explore Library
            </button>
          </div>
        </div>
      </div>

      {/* ====== GENRE TABS ====== */}
      {!isLoading && tabs.length > 1 && (
        <div className="tabs-row">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* ====== MAIN CONTENT ====== */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <div>
          {filteredCategories.map((categoryData, categoryIdx) => {
            if (!categoryData.videos || categoryData.videos.length === 0) return null;

            return (
              <div key={categoryIdx} className="category-section">
                {/* Category Header */}
                <div className="category-header">
                  <div className="category-accent"></div>
                  <h3 className="category-name">{categoryData.category}</h3>
                </div>

                {/* Desktop: Grid cards */}
                <div className="cards-grid" id={`grid-${categoryIdx}`}>
                  {categoryData.videos.map((video, videoIdx) => {
                    const trackObj = {
                      id: video.id,
                      title: video.title,
                      artist: video.channelTitle,
                      image: MUSIC_CARD_THUMB,
                      src: video.videoUrl,
                      duration: "3:00"
                    };
                    const isTrackPlaying = isPlaying && globalTrack?.id === trackObj.id;
                    const isCurrentTrack = globalTrack?.id === trackObj.id;

                    return (
                      <div
                        key={videoIdx}
                        className="music-card"
                        onClick={() => {
                          if (isCurrentTrack) {
                            togglePlay();
                          } else {
                            const pl = categoryData.videos.map(v => ({
                              id: v.id,
                              title: v.title,
                              artist: v.channelTitle,
                              image: MUSIC_CARD_THUMB,
                              src: v.videoUrl
                            }));
                            playTrack(trackObj, pl);
                          }
                        }}
                      >
                        <div className="music-card-thumb">
                          <img
                            src={MUSIC_CARD_THUMB}
                            alt={trackObj.title}
                            loading="lazy"
                          />
                          {/* Play overlay */}
                          <div className={`play-overlay ${isCurrentTrack ? 'visible' : ''}`}>
                            <div className="play-btn-circle">
                              {isTrackPlaying ? (
                                <Pause size={20} fill="#fff" color="#fff" />
                              ) : (
                                <Play size={20} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
                              )}
                            </div>
                          </div>
                          {/* Cameroon flag equalizer indicator */}
                          {isTrackPlaying && (
                            <div className="cameroon-playing-indicator">
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                            </div>
                          )}
                          {/* Duration badge */}
                          <div className="duration-badge">3:00</div>
                        </div>
                        <p className="music-card-title">{trackObj.title}</p>
                        <p className="music-card-artist">{trackObj.artist}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile: Vertical list */}
                <div className="mobile-list">
                  {categoryData.videos.map((video, videoIdx) => {
                    const trackObj = {
                      id: video.id,
                      title: video.title,
                      artist: video.channelTitle,
                      image: MUSIC_CARD_THUMB,
                      src: video.videoUrl,
                      duration: "3:00"
                    };
                    const isTrackPlaying = isPlaying && globalTrack?.id === trackObj.id;
                    const isCurrentTrack = globalTrack?.id === trackObj.id;

                    return (
                      <div
                        key={videoIdx}
                        className={`mobile-list-item ${isCurrentTrack ? 'active-track' : ''}`}
                        onClick={() => {
                          if (isCurrentTrack) {
                            togglePlay();
                          } else {
                            const pl = categoryData.videos.map(v => ({
                              id: v.id,
                              title: v.title,
                              artist: v.channelTitle,
                              image: MUSIC_CARD_THUMB,
                              src: v.videoUrl
                            }));
                            playTrack(trackObj, pl);
                          }
                        }}
                      >
                        <div className="mobile-list-thumb">
                          <img src={MUSIC_CARD_THUMB} alt={trackObj.title} />
                          {isTrackPlaying && (
                            <div className="cameroon-playing-indicator" style={{
                              position: 'absolute',
                              bottom: 4,
                              left: 4,
                              top: 'auto',
                              background: 'rgba(0,0,0,0.7)',
                              padding: '2px 4px',
                              height: '12px'
                            }}>
                              <div className="bar" style={{ width: 2 }}></div>
                              <div className="bar" style={{ width: 2 }}></div>
                              <div className="bar" style={{ width: 2 }}></div>
                            </div>
                          )}
                        </div>
                        <div className="mobile-list-info">
                          <p className="mobile-list-title" style={isCurrentTrack ? { color: '#E50914' } : {}}>
                            {trackObj.title}
                          </p>
                          <p className="mobile-list-artist">{trackObj.artist}</p>
                        </div>
                        <button className="mobile-list-more" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}