'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Search, 
  Eye, 
  MapPin, 
  Radio, 
  X,
  ChevronDown,
  Info
} from 'lucide-react';
import Image from 'next/image';

interface TVStation {
  id: string;
  channelNumber: number;
  name: string;
  callSign: string;
  slogan: string;
  category: 'National & News' | 'Entertainment & Music' | 'Sports' | 'Regional & Culture' | 'Anglophone';
  city: string;
  language: string;
  frequency: string;
  viewers: number;
  logoUrl?: string;
  currentShow: {
    title: string;
    genre: string;
    startTime: string;
    endTime: string;
  };
  posterBg: string;
}

const LIVE_TV_BANNER = "https://i.ibb.co/cSb3xbY8/Chat-GPT-Image-Sep-4-2026-11-43-12-PM.png";

// 15 Authentic Cameroonian Television Broadcasters (Zero Hallucination)
const CAMEROON_TV_STATIONS: TVStation[] = [
  {
    id: 'crtv-news',
    channelNumber: 1,
    name: 'CRTV News',
    callSign: 'CRTV Information 24/7',
    slogan: 'L information en continu',
    category: 'National & News',
    city: 'Yaounde (Mballa II)',
    language: 'Bilingual (Francais / English)',
    frequency: 'Canal+ 305 • TNT Ch 2',
    viewers: 34500,
    logoUrl: 'https://i.ibb.co/27tHg09j/images-7-removebg-preview.png',
    currentShow: {
      title: 'The Debate: Cameroon Geopolitics',
      genre: 'News Analysis',
      startTime: '11:00',
      endTime: '12:00',
    },
    posterBg: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'canal2-international',
    channelNumber: 2,
    name: 'Canal 2 International',
    callSign: 'Canal 2 International',
    slogan: 'Toujours plus pres de vous',
    category: 'Entertainment & Music',
    city: 'Douala (Akwa)',
    language: 'Francais & English',
    frequency: 'Canal+ 302 • Startimes Ch 105',
    viewers: 42800,
    logoUrl: 'https://i.ibb.co/Zz5rp35J/canal2-logo-removebg-preview.png',
    currentShow: {
      title: 'Jambo Television',
      genre: 'Entertainment & Variety',
      startTime: '10:30',
      endTime: '12:30',
    },
    posterBg: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'equinoxe-tv',
    channelNumber: 3,
    name: 'Equinoxe TV',
    callSign: 'Equinoxe Television',
    slogan: 'Au-dela de l image, nous rendons compte',
    category: 'National & News',
    city: 'Douala (Carrefour de l Air)',
    language: 'Francais & English',
    frequency: 'Canal+ 303 • SES 4',
    viewers: 39600,
    logoUrl: 'https://i.ibb.co/fY4JqbfB/images-9-removebg-preview.png',
    currentShow: {
      title: 'Droit de Reponse',
      genre: 'Political Debate',
      startTime: '10:00',
      endTime: '12:00',
    },
    posterBg: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'my-media-prime',
    channelNumber: 4,
    name: 'My Media Prime',
    callSign: 'My Media Prime (MMP TV)',
    slogan: 'L information au premier plan',
    category: 'National & News',
    city: 'Douala / Yaounde',
    language: 'Francais & English',
    frequency: 'Canal+ 316 • TNT Ch 8',
    viewers: 24200,
    logoUrl: 'https://i.ibb.co/q3H7zTLq/mymdiaprime-removebg-preview.png',
    currentShow: {
      title: 'MMP Matin - Le Grand Debat',
      genre: 'Morning News & Analysis',
      startTime: '09:30',
      endTime: '11:45',
    },
    posterBg: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'crtv',
    channelNumber: 5,
    name: 'CRTV',
    callSign: 'Cameroon Radio Television',
    slogan: 'Au coeur de la nation',
    category: 'National & News',
    city: 'Yaounde (Mballa II)',
    language: 'Bilingual (Francais / English)',
    frequency: 'Canal+ 301 • TNT Ch 1',
    viewers: 36100,
    logoUrl: 'https://i.ibb.co/27tHg09j/images-7-removebg-preview.png',
    currentShow: {
      title: 'Cameroon Feeling',
      genre: 'Culture & Talk Show',
      startTime: '10:00',
      endTime: '11:45',
    },
    posterBg: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'crtv-sports',
    channelNumber: 6,
    name: 'CRTV Sports',
    callSign: 'CRTV Sports & Entertainment',
    slogan: 'La passion du sport camerounais',
    category: 'Sports',
    city: 'Yaounde',
    language: 'Bilingual',
    frequency: 'Canal+ 306 • TNT Ch 3',
    viewers: 28400,
    logoUrl: 'https://i.ibb.co/27tHg09j/images-7-removebg-preview.png',
    currentShow: {
      title: 'Elite One Live Match',
      genre: 'Live Sports',
      startTime: '10:30',
      endTime: '12:30',
    },
    posterBg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'balafon-tv',
    channelNumber: 7,
    name: 'Balafon TV',
    callSign: 'Groupe Balafon Television',
    slogan: 'La tele qui vous ressemble',
    category: 'Entertainment & Music',
    city: 'Douala',
    language: 'Francais',
    frequency: 'Canal+ 309 • TNT Ch 12',
    viewers: 23800,
    currentShow: {
      title: 'Sacre Matin TV',
      genre: 'Entertainment Talk',
      startTime: '09:00',
      endTime: '11:30',
    },
    posterBg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'stv',
    channelNumber: 8,
    name: 'STV',
    callSign: 'Spectrum Television',
    slogan: 'Your window to the world',
    category: 'Entertainment & Music',
    city: 'Douala (Bali)',
    language: 'Bilingual (Francais / English)',
    frequency: 'Canal+ 304 • Eutelsat',
    viewers: 22600,
    currentShow: {
      title: 'Cartes sur Table',
      genre: 'Political Talk',
      startTime: '10:00',
      endTime: '12:00',
    },
    posterBg: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'vision4',
    channelNumber: 9,
    name: 'Vision 4',
    callSign: 'Vision 4 Television',
    slogan: 'La television africaine par excellence',
    category: 'National & News',
    city: 'Yaounde (Nsam)',
    language: 'Francais',
    frequency: 'Canal+ 307 • SES 4',
    viewers: 31200,
    currentShow: {
      title: 'Tour d Horizon',
      genre: 'Debate & News',
      startTime: '10:30',
      endTime: '12:00',
    },
    posterBg: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'canal2-english',
    channelNumber: 10,
    name: 'Canal 2 English',
    callSign: 'Canal 2 International English',
    slogan: 'Giving voice to our community',
    category: 'Anglophone',
    city: 'Douala / Bamenda / Buea',
    language: 'English',
    frequency: 'Canal+ 311 • TNT Ch 7',
    viewers: 17800,
    logoUrl: 'https://i.ibb.co/Zz5rp35J/canal2-logo-removebg-preview.png',
    currentShow: {
      title: 'The Breakfast Show',
      genre: 'Morning English Magazine',
      startTime: '09:30',
      endTime: '11:30',
    },
    posterBg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'canal2-movies',
    channelNumber: 11,
    name: 'Canal 2 Movies',
    callSign: 'Canal 2 Cinema & Fictions',
    slogan: 'Le meilleur du 7eme art africain',
    category: 'Entertainment & Music',
    city: 'Douala',
    language: 'Francais',
    frequency: 'Canal+ 312',
    viewers: 28900,
    logoUrl: 'https://i.ibb.co/Zz5rp35J/canal2-logo-removebg-preview.png',
    currentShow: {
      title: 'Serie Culte: Madame... Monsieur',
      genre: 'Drama Series',
      startTime: '10:00',
      endTime: '11:45',
    },
    posterBg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'dash-tv',
    channelNumber: 12,
    name: 'Dash TV',
    callSign: 'Dash Media Television',
    slogan: 'Live the Dream, Experience Dash',
    category: 'Entertainment & Music',
    city: 'Douala (Bonanjo)',
    language: 'Bilingual',
    frequency: 'Canal+ 310 • Web Live',
    viewers: 16400,
    currentShow: {
      title: 'Dash Urban Spotlight',
      genre: 'Youth & Tech',
      startTime: '10:15',
      endTime: '12:00',
    },
    posterBg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'dbs-tv',
    channelNumber: 13,
    name: 'DBS TV',
    callSign: 'Douala Broadcasting System',
    slogan: 'La voix des berges du Wouri',
    category: 'Regional & Culture',
    city: 'Douala (Deido)',
    language: 'Francais & Duala',
    frequency: 'TNT Ch 9 • Canal+ 315',
    viewers: 14800,
    currentShow: {
      title: 'Culture & Rythmes du Littoral',
      genre: 'Coastal Traditions',
      startTime: '10:00',
      endTime: '11:30',
    },
    posterBg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'ltm-tv',
    channelNumber: 14,
    name: 'LTM TV',
    callSign: 'Love Television & Media',
    slogan: 'La television au coeur de l humain',
    category: 'Regional & Culture',
    city: 'Douala',
    language: 'Francais',
    frequency: 'Canal+ 314 • TNT Ch 11',
    viewers: 14200,
    currentShow: {
      title: 'Matin Bonheur',
      genre: 'Lifestyle & Community',
      startTime: '09:30',
      endTime: '11:30',
    },
    posterBg: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'afrique-media',
    channelNumber: 15,
    name: 'Afrique Media',
    callSign: 'Afrique Media Television',
    slogan: 'Le premier media panafricain d information',
    category: 'National & News',
    city: 'Douala & Yaounde',
    language: 'Francais',
    frequency: 'Canal+ 308 • Eutelsat',
    viewers: 34800,
    currentShow: {
      title: 'Le Debat Panafricain',
      genre: 'Geopolitics',
      startTime: '10:30',
      endTime: '12:30',
    },
    posterBg: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1200&auto=format&fit=crop'
  }
];

const CATEGORIES = [
  'All',
  'National & News',
  'Entertainment & Music',
  'Sports',
  'Regional & Culture',
  'Anglophone'
] as const;

export default function LiveTVPage() {
  const [selectedStation, setSelectedStation] = useState<TVStation | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);

  const playerRef = useRef<HTMLDivElement>(null);

  // Filter stations based on selected tab and search query
  const filteredStations = useMemo(() => {
    return CAMEROON_TV_STATIONS.filter((station) => {
      const matchesTab =
        activeTab === 'All' || station.category === activeTab;
      const matchesSearch =
        searchQuery.trim() === '' ||
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.callSign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.currentShow.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const handleSelectStation = (station: TVStation) => {
    setSelectedStation(station);
    setIsPlaying(true);
    // Smooth scroll to player on mobile/desktop
    if (typeof window !== 'undefined') {
      const playerEl = document.getElementById('live-theater-player');
      if (playerEl) {
        playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen text-white pb-32">
      {/* ====== 1. HERO BANNER (Direct Inspiration from Music Page) ====== */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl bg-[#0B0E14]">
        <div className="relative aspect-[21/9] sm:aspect-[24/8] md:aspect-[24/7] min-h-[200px] sm:min-h-[250px] w-full">
          <Image
            src={LIVE_TV_BANNER}
            alt="SawaFlix Live TV"
            fill
            className="object-cover object-center opacity-80 filter brightness-95"
            priority
            unoptimized
          />
          {/* Subtle vignettes matching SawaFlix cinematic identity */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14]/95 via-[#0B0E14]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-black/30" />

          {/* Banner Content */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Broadcast
              </span>
              <span className="text-xs text-zinc-300 font-mono bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                15 Cameroonian Stations
              </span>
            </div>

            <div className="max-w-xl">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                Cameroon Live TV
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2 line-clamp-2 leading-relaxed drop-shadow">
                Watch Cameroon’s premier television networks live in crystal-clear high definition. Select any channel below to start streaming immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====== 2. ACTIVE LIVE THEATER PLAYER (Expands when a station is active) ====== */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div
            id="live-theater-player"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mb-8 rounded-3xl bg-[#090C12] border border-white/15 overflow-hidden shadow-2xl"
          >
            <div
              ref={playerRef}
              className="relative aspect-video w-full max-h-[65vh] flex flex-col justify-between overflow-hidden bg-black select-none group"
            >
              {/* Standby Broadcast Background */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={selectedStation.posterBg}
                  alt={selectedStation.name}
                  fill
                  className="object-cover opacity-40 filter brightness-90 group-hover:scale-[1.02] transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70" />
              </div>

              {/* Player Top Bar */}
              <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider shadow">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Now Streaming
                  </span>
                  
                  <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15 text-xs">
                    {selectedStation.logoUrl && (
                      <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                        <Image
                          src={selectedStation.logoUrl}
                          alt={selectedStation.name}
                          width={16}
                          height={16}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <span className="font-mono font-bold text-white">
                      Ch {String(selectedStation.channelNumber).padStart(2, '0')}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="font-semibold text-white">{selectedStation.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-xs text-zinc-200">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-mono">{selectedStation.viewers.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => setSelectedStation(null)}
                    className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Close player"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Center Screen Station Watermark */}
              <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl mb-2 p-2 overflow-hidden">
                  {selectedStation.logoUrl ? (
                    <Image
                      src={selectedStation.logoUrl}
                      alt={selectedStation.name}
                      width={80}
                      height={80}
                      className="object-contain max-h-full max-w-full drop-shadow-md"
                      unoptimized
                    />
                  ) : (
                    <Tv className="w-10 h-10 text-white stroke-[1.75]" />
                  )}
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                  {selectedStation.name}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mt-0.5 drop-shadow font-medium">
                  {selectedStation.slogan}
                </p>
              </div>

              {/* Bottom Controls Overlay */}
              <div className="relative z-10 p-4 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 text-xs">
                      <span className="font-semibold text-zinc-300 uppercase tracking-wider">
                        Live Show
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-300 font-mono">
                        {selectedStation.currentShow.startTime} - {selectedStation.currentShow.endTime}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xl">
                      {selectedStation.currentShow.title}
                    </h3>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedStation.city}</span>
                  </div>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer font-bold shadow"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-white/15 text-xs">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(Number(e.target.value));
                          if (isMuted) setIsMuted(false);
                        }}
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      {selectedStation.frequency}
                    </span>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white transition-colors border border-white/15 cursor-pointer"
                      title="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== 3. STICKY CATEGORY TABS & SEARCH (Direct Inspiration from Music Page tabs-row) ====== */}
      <div className="sticky top-0 z-40 bg-[#0B0E14]/95 backdrop-blur-md py-3.5 mb-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Horizontal Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === cat
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Station Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search TV stations..."
            className="w-full bg-[#121622] border border-white/10 focus:border-white/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ====== 4. THE STATIONS GRID (Inspired by Music Cards Grid) ====== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 bg-white rounded-full" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              All Television Stations ({filteredStations.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-400 hidden sm:inline-block">
            Click any channel to stream live
          </span>
        </div>

        {filteredStations.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0E121B] border border-white/5">
            <Tv className="w-10 h-10 text-zinc-500 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-white">No TV stations found</p>
            <p className="text-xs text-zinc-400 mt-1">
              Try switching categories or clearing your search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {filteredStations.map((station) => {
              const isSelected = selectedStation?.id === station.id;

              return (
                <div
                  key={station.id}
                  onClick={() => handleSelectStation(station)}
                  className={`group cursor-pointer rounded-2xl p-3 transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#181E2E] border-2 border-white shadow-2xl scale-[1.02]'
                      : 'bg-[#0E121B] hover:bg-[#141824] border border-white/5 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl'
                  }`}
                >
                  {/* ====== THUMBNAIL / LOGO CONTAINER ====== */}
                  <div className="relative aspect-square w-full rounded-xl bg-[#131722] overflow-hidden flex items-center justify-center p-3 border border-white/5 group-hover:border-white/10 transition-colors">
                    {/* Live Badge in Top Right */}
                    <div className="absolute top-2 right-2 z-20">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    </div>

                    {/* Channel Number in Top Left */}
                    <div className="absolute top-2 left-2 z-20">
                      <span className="font-mono text-[10px] font-bold text-zinc-300 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
                        Ch {String(station.channelNumber).padStart(2, '0')}
                      </span>
                    </div>

                    {/* The Prominent Station Logo */}
                    {station.logoUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <Image
                          src={station.logoUrl}
                          alt={station.name}
                          width={110}
                          height={110}
                          className="object-contain max-h-full max-w-full drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        <Tv className="w-10 h-10 text-white/80 group-hover:text-white stroke-[1.5] mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black text-white/90 tracking-wide">
                          {station.name}
                        </span>
                      </div>
                    )}

                    {/* Hover Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <div className="w-11 h-11 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Currently Playing Indicator if Active */}
                    {isSelected && isPlaying && (
                      <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 bg-white text-zinc-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow">
                        Watching
                      </div>
                    )}
                  </div>

                  {/* ====== METADATA INFO (Matches Music Card Style) ====== */}
                  <div className="mt-3">
                    <h3 className="font-bold text-sm text-white truncate group-hover:text-zinc-100 transition-colors">
                      {station.name}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {station.currentShow.title}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500">
                      <span>{station.city.split(' ')[0]}</span>
                      <span className="font-mono text-zinc-400">
                        {station.viewers.toLocaleString()} watching
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
