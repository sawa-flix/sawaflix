'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, Heart, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMusic } from '@/components/MusicContext';
import { BACKEND_URL } from '@/lib/apiConfig';
import { artistsData } from '../../musicpage/page';

const BANNER_IMG = "https://i.ibb.co/zhLm73Bh/banner-2.png";
const MUSIC_CARD_THUMB = "https://i.ibb.co/21Dd0zTh/sound.png";

export default function ArtistDetailsPage({ params }) {
  const router = useRouter();
  const artistId = params?.id;
  const artist = artistsData.find(a => a.id === artistId);

  const {
    currentTrack: globalTrack,
    isPlaying,
    togglePlay,
    playTrack
  } = useMusic();

  const [hitSongs, setHitSongs] = useState([]);
  const [showBio, setShowBio] = useState(false);

  useEffect(() => {
    // Fetch some generic hit songs to display
    const fetchSongs = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/videos/external/youtube/music-categories`);
        if (res.ok) {
          const data = await res.json();
          // Flatten all videos and take first 8 as mock hit songs
          const allVids = data.flatMap(c => c.videos || []);
          setHitSongs(allVids.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      }
    };
    fetchSongs();
  }, []);

  if (!artist) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center flex-col gap-4">
        <h2>Artist not found</h2>
        <button onClick={() => router.back()} className="px-4 py-2 bg-[#E50914] rounded-full">Go Back</button>
      </div>
    );
  }

  return (
    <div className="artist-page-root">
      <style jsx>{`
        .artist-page-root {
          min-height: 100%;
          color: #fff;
          padding-bottom: 120px;
          background: #0B0E14;
        }

        /* ====== BANNER ====== */
        .banner-container {
          position: relative;
          width: 100%;
          height: 280px;
          margin-bottom: 80px; /* Space for overlapping avatar */
        }
        .banner-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 20px;
        }
        .banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #0B0E14 0%, transparent 80%);
          border-radius: 20px;
        }
        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          z-index: 10;
          transition: background 0.3s;
        }
        .back-btn:hover {
          background: rgba(0,0,0,0.8);
        }

        /* ====== ARTIST HEADER ====== */
        .artist-header-content {
          position: absolute;
          bottom: -60px;
          left: 30px;
          display: flex;
          align-items: flex-end;
          gap: 24px;
          z-index: 10;
        }
        .artist-avatar {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 4px solid #0B0E14;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          object-fit: cover;
          background: #1a1f2e;
        }
        .artist-info {
          padding-bottom: 60px; /* offset from the bottom of avatar */
        }
        .artist-name {
          font-size: 48px;
          font-weight: 900;
          margin: 0 0 8px 0;
          line-height: 1;
          text-shadow: 0 4px 20px rgba(0,0,0,0.6);
        }
        .artist-meta {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .meta-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
        }

        /* ====== ACTION BAR ====== */
        .action-bar {
          padding: 0 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
        }
        .play-all-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #E50914;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(229,9,20,0.4);
          transition: transform 0.2s, background 0.2s;
        }
        .play-all-btn:hover {
          transform: scale(1.05);
          background: #FF1A25;
        }
        .btn-about {
          padding: 8px 20px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.3);
          background: transparent;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-about:hover {
          background: rgba(255,255,255,0.1);
          border-color: #fff;
        }

        /* ====== BIO SECTION ====== */
        .bio-section {
          padding: 0 30px;
          margin-bottom: 40px;
          max-width: 800px;
          animation: fadeIn 0.3s ease;
        }
        .bio-text {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.03);
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #E50914;
        }

        /* ====== SONGS SECTION ====== */
        .songs-section {
          padding: 0 30px;
        }
        .section-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-accent {
          width: 4px;
          height: 24px;
          border-radius: 4px;
          background: #E50914;
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
        .play-overlay {
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
        .play-overlay.visible {
          opacity: 1;
        }
        .play-btn-circle {
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
        .play-btn-circle:hover {
          transform: scale(1.1);
        }
        .duration-badge {
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
        }
        .music-card-title {
          font-size: 13px;
          font-weight: 700;
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
          background: none;
          border: none;
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 768px) {
          .banner-container {
            height: 200px;
            margin-bottom: 60px;
          }
          .artist-header-content {
            bottom: -40px;
            left: 16px;
            gap: 16px;
          }
          .artist-avatar {
            width: 100px;
            height: 100px;
            border-width: 3px;
          }
          .artist-info {
            padding-bottom: 40px;
          }
          .artist-name {
            font-size: 28px;
            margin-bottom: 4px;
          }
          .artist-meta {
            font-size: 13px;
            flex-wrap: wrap;
          }
          .action-bar {
            margin-top: 20px;
            padding: 0 16px;
            gap: 16px;
          }
          .play-all-btn {
            width: 48px;
            height: 48px;
          }
          .btn-about {
            font-size: 13px;
            padding: 8px 16px;
          }
          .cards-grid {
            display: none !important;
          }
          .mobile-list {
            display: flex;
          }
          .songs-section, .bio-section {
            padding: 0 16px;
          }
        }
        @media (min-width: 769px) {
          .mobile-list {
            display: none !important;
          }
          .cards-grid {
            display: grid !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          from { height: 15%; }
          to { height: 100%; }
        }
      `}</style>

      {/* BANNER & HEADER */}
      <div className="banner-container">
        <img src={BANNER_IMG} alt="Artist Banner" className="banner-bg" />
        <div className="banner-overlay"></div>
        <button className="back-btn" onClick={() => router.back()}>
          <ChevronLeft size={24} />
        </button>

        {/* Visualizer & Playing Text */}
        {isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none pl-12 md:pl-32">
            <h2 
              className="text-4xl md:text-7xl font-black italic mb-2 md:mb-6"
              style={{ 
                color: '#FCD116',
                textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 30px rgba(252,209,22,0.4)',
                fontFamily: 'serif' 
              }}
            >
              Playing...
            </h2>
            <div className="flex items-end h-12 md:h-20 gap-1 md:gap-1.5 opacity-90">
              {Array.from({ length: 60 }).map((_, i) => {
                let color = '#009639'; // Green
                if (i >= 20 && i < 40) color = '#CE1126'; // Red
                if (i >= 40) color = '#FCD116'; // Yellow
                
                return (
                  <div
                    key={i}
                    className="w-1 md:w-1.5 rounded-t-sm"
                    style={{
                      backgroundColor: color,
                      height: `${Math.max(15, Math.random() * 100)}%`,
                      animation: `bounce ${0.3 + Math.random() * 0.5}s infinite alternate ease-in-out`
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Large Play/Pause Button on Right */}
        <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20">
          <button 
            onClick={() => {
              if (!isPlaying && globalTrack && hitSongs.length > 0) {
                 togglePlay();
              } else if (!globalTrack && hitSongs.length > 0) {
                 // Play first song if nothing is playing globally
                 const trackObj = {
                   id: hitSongs[0].id,
                   title: hitSongs[0].title,
                   artist: hitSongs[0].channelTitle,
                   image: MUSIC_CARD_THUMB,
                   src: hitSongs[0].videoUrl,
                   duration: "3:00"
                 };
                 const pl = hitSongs.map(v => ({
                   id: v.id, title: v.title, artist: v.channelTitle,
                   image: MUSIC_CARD_THUMB, src: v.videoUrl, duration: "3:00"
                 }));
                 playTrack(trackObj, pl);
              } else {
                 togglePlay();
              }
            }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#FCD116] bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(252,209,22,0.3)]"
          >
            {isPlaying ? <Pause size={32} color="#FCD116" /> : <Play size={32} color="#FCD116" className="ml-2" />}
          </button>
        </div>

        <div className="artist-header-content">
          <img src={artist.image} alt={artist.name} className="artist-avatar" />
          <div className="artist-info">
            <h1 className="artist-name">{artist.name}</h1>
            <div className="artist-meta">
              <span>{artist.country}</span>
              <div className="meta-dot"></div>
              <span>{artist.genres.join(' • ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="action-bar">
        <button className="play-all-btn" onClick={() => {
          if (hitSongs.length > 0) {
            const trackObj = {
              id: hitSongs[0].id,
              title: hitSongs[0].title,
              artist: hitSongs[0].channelTitle,
              image: MUSIC_CARD_THUMB,
              src: hitSongs[0].videoUrl,
              duration: "3:00"
            };
            const pl = hitSongs.map(v => ({
              id: v.id,
              title: v.title,
              artist: v.channelTitle,
              image: MUSIC_CARD_THUMB,
              src: v.videoUrl,
              duration: "3:00"
            }));
            playTrack(trackObj, pl);
          }
        }}>
          <Play size={24} fill="#fff" color="#fff" style={{ marginLeft: 4 }} />
        </button>
        <button className="btn-about" onClick={() => setShowBio(!showBio)}>
          {showBio ? 'Hide About' : 'About artist'}
        </button>
      </div>

      {/* BIO SECTION */}
      {showBio && (
        <div className="bio-section">
          <div className="bio-text">
            {artist.bio}
          </div>
        </div>
      )}

      {/* SONGS SECTION */}
      <div className="songs-section">
        <h2 className="section-title">
          <div className="section-accent"></div>
          Hit Songs
        </h2>
        
        {/* Desktop Grid */}
        <div className="cards-grid">
          {hitSongs.map((video, idx) => {
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
                key={idx}
                className="music-card"
                onClick={() => {
                  if (isCurrentTrack) {
                    togglePlay();
                  } else {
                    const pl = hitSongs.map(v => ({
                      id: v.id,
                      title: v.title,
                      artist: v.channelTitle,
                      image: MUSIC_CARD_THUMB,
                      src: v.videoUrl,
                      duration: "3:00"
                    }));
                    playTrack(trackObj, pl);
                  }
                }}
              >
                <div className="music-card-thumb">
                  <img src={MUSIC_CARD_THUMB} alt={trackObj.title} loading="lazy" />
                  <div className={`play-overlay ${isCurrentTrack ? 'visible' : ''}`}>
                    <div className="play-btn-circle">
                      {isTrackPlaying ? (
                        <Pause size={20} fill="#fff" color="#fff" />
                      ) : (
                        <Play size={20} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
                      )}
                    </div>
                  </div>
                  <div className="duration-badge">3:00</div>
                </div>
                <p className="music-card-title">{trackObj.title}</p>
                <p className="music-card-artist">{trackObj.artist}</p>
              </div>
            );
          })}
        </div>

        {/* Mobile List */}
        <div className="mobile-list">
          {hitSongs.map((video, idx) => {
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
                key={idx}
                className={`mobile-list-item ${isCurrentTrack ? 'active-track' : ''}`}
                onClick={() => {
                  if (isCurrentTrack) {
                    togglePlay();
                  } else {
                    const pl = hitSongs.map(v => ({
                      id: v.id,
                      title: v.title,
                      artist: v.channelTitle,
                      image: MUSIC_CARD_THUMB,
                      src: v.videoUrl,
                      duration: "3:00"
                    }));
                    playTrack(trackObj, pl);
                  }
                }}
              >
                <div className="mobile-list-thumb">
                  <img src={MUSIC_CARD_THUMB} alt={trackObj.title} />
                  <div className={`play-overlay ${isCurrentTrack ? 'visible' : ''}`} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isCurrentTrack ? 1 : 0 }}>
                    {isTrackPlaying ? (
                      <Pause size={16} fill="#fff" color="#fff" />
                    ) : (
                      <Play size={16} fill="#fff" color="#fff" />
                    )}
                  </div>
                </div>
                <div className="mobile-list-info">
                  <p className="mobile-list-title">{trackObj.title}</p>
                  <p className="mobile-list-artist">{trackObj.artist}</p>
                </div>
                <button className="mobile-list-more" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical size={20} />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
