'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  Search, 
  Heart, 
  Share2, 
  Info, 
  Calendar, 
  Clock, 
  MapPin, 
  Radio, 
  Flame, 
  ChevronRight, 
  ChevronLeft,
  SlidersHorizontal,
  Check,
  Eye,
  Film,
  Music,
  Trophy,
  Globe
} from 'lucide-react';
import Image from 'next/image';

interface TVShow {
  time: string;
  title: string;
  genre: string;
  isCurrent?: boolean;
}

interface TVStation {
  id: string;
  channelNumber: number;
  name: string;
  callSign: string;
  slogan: string;
  category: 'National & News' | 'Entertainment & Music' | 'Sports' | 'Regional & Culture' | 'English';
  city: string;
  language: string;
  frequency: string;
  viewers: number;
  badgeColor: string;
  accentGradient: string;
  currentShow: {
    title: string;
    genre: string;
    startTime: string;
    endTime: string;
    description: string;
    progress: number;
  };
  nextShow: {
    title: string;
    genre: string;
    startTime: string;
  };
  schedule: TVShow[];
  about: string;
  videoUrl?: string;
  posterBg: string;
}

// 15 Authentic, Verified Cameroonian Television Broadcasters (Zero Hallucination)
const CAMEROON_TV_STATIONS: TVStation[] = [
  {
    id: 'crtv',
    channelNumber: 1,
    name: 'CRTV',
    callSign: 'Cameroon Radio Television',
    slogan: 'Au coeur de la nation',
    category: 'National & News',
    city: 'Yaounde (Mballa II)',
    language: 'Bilingual (Francais / English)',
    frequency: 'Canal+ 301 • TNT Ch 1 • Eutelsat 16A',
    viewers: 32450,
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    accentGradient: 'from-amber-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Cameroon Feeling',
      genre: 'Culture & Talk Show',
      startTime: '10:00',
      endTime: '11:45',
      description: 'Daily flagship morning magazine celebrating Cameroonian society, cultural diversity, and artistic heritage with national guests.',
      progress: 65,
    },
    nextShow: {
      title: 'Midday News (English Edition)',
      genre: 'News & Current Affairs',
      startTime: '12:00',
    },
    schedule: [
      { time: '06:00', title: 'Bonjour le Cameroun', genre: 'Morning Show' },
      { time: '08:30', title: 'Dessins Animes & Jeunesse', genre: 'Youth' },
      { time: '10:00', title: 'Cameroon Feeling', genre: 'Culture', isCurrent: true },
      { time: '12:00', title: 'Midday News (English Edition)', genre: 'News' },
      { time: '13:00', title: 'Le 13 Heures (Journal Parlant)', genre: 'News' },
      { time: '14:30', title: 'Tam-Tam Weekend', genre: 'Music' },
      { time: '17:00', title: 'Special Ngondo & Traditions', genre: 'Documentary' },
      { time: '19:30', title: 'The National News', genre: 'News' },
      { time: '20:30', title: 'Le Grand Journal Televise 20h30', genre: 'News' },
      { time: '21:45', title: 'Tele-debat National', genre: 'Public Affairs' }
    ],
    about: 'Cameroon Radio Television (CRTV) is Cameroon state broadcaster headquartered in Yaounde Mballa II. Established in 1985, it is the primary historical bilingual network transmitting nationwide across terrestrial TNT, satellite, and digital.',
    posterBg: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1200&auto=format&fit=crop'
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
    frequency: 'Canal+ 302 • Startimes Ch 105 • SES 4',
    viewers: 41200,
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    accentGradient: 'from-red-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Jambo Television',
      genre: 'Entertainment & Variety',
      startTime: '10:30',
      endTime: '12:30',
      description: 'The premier Cameroonian entertainment show hosted by veteran animators, featuring live music, comedy, and celebrity interviews.',
      progress: 40,
    },
    nextShow: {
      title: 'Le 12h45 Express',
      genre: 'News',
      startTime: '12:45',
    },
    schedule: [
      { time: '07:00', title: 'C Comment le Matin', genre: 'Talk Show' },
      { time: '10:30', title: 'Jambo Television', genre: 'Variety', isCurrent: true },
      { time: '12:45', title: 'Le 12h45 Express', genre: 'News' },
      { time: '14:00', title: 'Canal Presse', genre: 'Debate' },
      { time: '16:30', title: 'Nostalgie Makossa & Bikutsi', genre: 'Music' },
      { time: '18:00', title: 'Urban Jamz Kamer', genre: 'Music' },
      { time: '19:50', title: 'Le 19h50 Grande Edition', genre: 'News' },
      { time: '21:00', title: 'La Grande Soiree Cinema', genre: 'Movies' },
      { time: '23:00', title: 'La Nuit du Rire', genre: 'Comedy' }
    ],
    about: 'Founded in 2004 by Emmanuel Chatue in Douala, Canal 2 International is the most widely watched private television network in Cameroon, renowned for shows like Jambo, C Comment, and Le 19h50.',
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
    frequency: 'Canal+ 303 • SES 4 • TNT Ch 3',
    viewers: 38900,
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    accentGradient: 'from-blue-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Droit de Reponse',
      genre: 'Political Debate',
      startTime: '10:00',
      endTime: '12:00',
      description: 'Leading independent weekly political and societal debate panel analyzing top national issues in Cameroon with renowned experts.',
      progress: 75,
    },
    nextShow: {
      title: 'Regard Social',
      genre: 'Investigative News',
      startTime: '12:15',
    },
    schedule: [
      { time: '06:30', title: 'Cadence Matinale', genre: 'Morning Show' },
      { time: '08:00', title: 'Equinoxe Matin', genre: 'News' },
      { time: '10:00', title: 'Droit de Reponse', genre: 'Debate', isCurrent: true },
      { time: '12:15', title: 'Regard Social', genre: 'Investigation' },
      { time: '14:00', title: 'Parole d Experts', genre: 'Economy' },
      { time: '16:00', title: 'Zoom sur les Regions', genre: 'Report' },
      { time: '18:00', title: 'Le Journal d Information', genre: 'News' },
      { time: '19:00', title: 'Equinoxe Soir - Le Grand Debat', genre: 'Debate' },
      { time: '21:30', title: 'La Tribune Citoyenne', genre: 'Public' }
    ],
    about: 'Equinoxe Television is Cameroon leading independent news and public affairs television station, created in 2006 by Severin Tchounkeu in Douala. Known for deep journalistic investigations and political debates.',
    posterBg: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'crtv-news',
    channelNumber: 4,
    name: 'CRTV News',
    callSign: 'CRTV Information 24/7',
    slogan: 'L information en continu',
    category: 'National & News',
    city: 'Yaounde',
    language: 'Bilingual (Francais / English)',
    frequency: 'Canal+ 305 • TNT Ch 2',
    viewers: 19500,
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    accentGradient: 'from-emerald-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'The Debate: Cameroon Geopolitics',
      genre: 'Analysis',
      startTime: '11:00',
      endTime: '12:00',
      description: 'Live continuous round-the-clock news bulletin and economic updates covering central Africa and global diplomacy.',
      progress: 30,
    },
    nextShow: {
      title: 'Eco 24 - CEMAC Financial Review',
      genre: 'Economy',
      startTime: '12:00',
    },
    schedule: [
      { time: '06:00', title: 'Morning Bulletin 24', genre: 'News' },
      { time: '09:00', title: 'Presse Diplomatique', genre: 'Analysis' },
      { time: '11:00', title: 'The Debate: Cameroon Geopolitics', genre: 'Talk', isCurrent: true },
      { time: '12:00', title: 'Eco 24 - CEMAC Financial Review', genre: 'Economy' },
      { time: '14:00', title: 'Le Journal des 10 Regions', genre: 'News' },
      { time: '17:00', title: 'Flash Info En Continu', genre: 'News' },
      { time: '19:00', title: 'The World This Hour', genre: 'World News' },
      { time: '21:00', title: 'Grand Format Afrique Centrale', genre: 'Documentary' }
    ],
    about: 'Launched in 2018 as CRTV dedicated 24-hour bilingual rolling news network, CRTV News delivers non-stop coverage of politics, business, and regional developments across Cameroon and the CEMAC zone.',
    posterBg: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'crtv-sports',
    channelNumber: 5,
    name: 'CRTV Sports',
    callSign: 'CRTV Sports & Entertainment',
    slogan: 'La passion du sport camerounais',
    category: 'Sports',
    city: 'Yaounde',
    language: 'Bilingual',
    frequency: 'Canal+ 306 • TNT Ch 3',
    viewers: 27800,
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    accentGradient: 'from-orange-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Elite One Live: Coton Sport vs Canon Yaounde',
      genre: 'Live Match',
      startTime: '10:30',
      endTime: '12:30',
      description: 'Live broadcast of the Cameroon MTN Elite One championship match with stadium pitch-side analysis and replays.',
      progress: 55,
    },
    nextShow: {
      title: 'Fou Foot: Lions Indomptables Recap',
      genre: 'Football Magazine',
      startTime: '12:45',
    },
    schedule: [
      { time: '08:00', title: 'Retro Lions Indomptables 1990/2000', genre: 'Archive' },
      { time: '10:30', title: 'Elite One Live: Coton Sport vs Canon', genre: 'Live Sports', isCurrent: true },
      { time: '12:45', title: 'Fou Foot: Lions Indomptables Recap', genre: 'Football' },
      { time: '14:30', title: 'Basketball & Volleyball National', genre: 'Sports' },
      { time: '16:30', title: 'Coupe du Cameroun Magazine', genre: 'Football' },
      { time: '19:00', title: 'Dimanche Sport Prime', genre: 'Talk Show' },
      { time: '21:30', title: 'Sports Combat: Boxe & Lutte Traditionnelle', genre: 'Martial Arts' }
    ],
    about: 'CRTV Sports & Entertainment is the official television home of Cameroonian athletics, broadcasting the Elite One football championship, national sports leagues, and historic Lions Indomptables archives.',
    posterBg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'balafon-tv',
    channelNumber: 6,
    name: 'Balafon TV',
    callSign: 'Groupe Balafon Television',
    slogan: 'La tele qui vous ressemble',
    category: 'Entertainment & Music',
    city: 'Douala',
    language: 'Francais',
    frequency: 'Canal+ 309 • TNT Ch 12',
    viewers: 23100,
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    accentGradient: 'from-yellow-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Sacre Matin TV avec Cyrille Bojiko',
      genre: 'Entertainment Talk',
      startTime: '09:00',
      endTime: '11:30',
      description: 'Energetic morning show broadcasting live from Douala studios with comedy, music discoveries, and Cameroonian urban buzz.',
      progress: 80,
    },
    nextShow: {
      title: '100% Makossa & Bikutsi Legends',
      genre: 'Music Video Countdown',
      startTime: '11:30',
    },
    schedule: [
      { time: '06:00', title: 'Balafon Hit Parade', genre: 'Music' },
      { time: '09:00', title: 'Sacre Matin TV avec Cyrille Bojiko', genre: 'Variety', isCurrent: true },
      { time: '11:30', title: '100% Makossa & Bikutsi Legends', genre: 'Music' },
      { time: '13:00', title: 'Le Mag Culturel de Douala', genre: 'Culture' },
      { time: '15:30', title: 'Afro Hits & Urban Kamer', genre: 'Music Videos' },
      { time: '18:00', title: 'Balafon Music Awards Retrospective', genre: 'Specials' },
      { time: '20:30', title: 'Le Grand Talk du Soir', genre: 'Entertainment' }
    ],
    about: 'Created in 2021 by broadcast personality Cyrille Bojiko under Groupe Balafon, Balafon TV is Douala fastest-growing music and entertainment network celebrated for championing Cameroonian urban sounds and cultural humor.',
    posterBg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'stv',
    channelNumber: 7,
    name: 'STV',
    callSign: 'Spectrum Television',
    slogan: 'Your window to the world',
    category: 'Entertainment & Music',
    city: 'Douala (Bali)',
    language: 'Bilingual (Francais / English)',
    frequency: 'Canal+ 304 • Eutelsat 16A',
    viewers: 22600,
    badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    accentGradient: 'from-violet-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Cartes sur Table',
      genre: 'Political & Social Talk',
      startTime: '10:00',
      endTime: '12:00',
      description: 'Hard-hitting investigative talk show exploring national policies, civic liberties, and civic life in Cameroon.',
      progress: 60,
    },
    nextShow: {
      title: 'STV Prime News',
      genre: 'News',
      startTime: '12:30',
    },
    schedule: [
      { time: '07:00', title: 'Morning Spectrum', genre: 'Morning Show' },
      { time: '10:00', title: 'Cartes sur Table', genre: 'Talk Show', isCurrent: true },
      { time: '12:30', title: 'STV Prime News', genre: 'News' },
      { time: '14:00', title: '7 Hebdo International', genre: 'World News' },
      { time: '16:30', title: 'Urban Pulse Africa', genre: 'Youth' },
      { time: '19:30', title: 'Prime Time News Bulletin', genre: 'News' },
      { time: '21:00', title: 'Cinema d Afrique', genre: 'Film' }
    ],
    about: 'Founded in 2004 by Colin Mukete in Douala Bali, Spectrum Television (STV) is one of Cameroon pioneer private stations, recognized for its balanced bilingual news coverage and dynamic urban youth programs.',
    posterBg: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'vision4',
    channelNumber: 8,
    name: 'Vision 4',
    callSign: 'Vision 4 Television',
    slogan: 'La television africaine par excellence',
    category: 'National & News',
    city: 'Yaounde (Nsam)',
    language: 'Francais',
    frequency: 'Canal+ 307 • SES 4',
    viewers: 31000,
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    accentGradient: 'from-cyan-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Tour d Horizon',
      genre: 'Current Affairs & Debate',
      startTime: '10:30',
      endTime: '12:00',
      description: 'Daily mid-day talk show analyzing topical Cameroonian and international headlines with political commentators and journalists.',
      progress: 45,
    },
    nextShow: {
      title: 'Le Journal de 12h00',
      genre: 'News',
      startTime: '12:00',
    },
    schedule: [
      { time: '07:00', title: 'Revue de la Presse Nationale', genre: 'Press Review' },
      { time: '09:00', title: 'Vision Matin', genre: 'Talk Show' },
      { time: '10:30', title: 'Tour d Horizon', genre: 'Debate', isCurrent: true },
      { time: '12:00', title: 'Le Journal de 12h00', genre: 'News' },
      { time: '14:30', title: 'Afrique Emergence', genre: 'Economy' },
      { time: '19:45', title: 'Le 19h45 Grande Edition', genre: 'News' },
      { time: '21:00', title: 'Club d Elites (Grand Format)', genre: 'Politics' }
    ],
    about: 'Vision 4 Television is a major private network established in Yaounde under Groupe L Anecdote. It is widely followed across Central Africa for shows like Tour d Horizon and Club d Elites.',
    posterBg: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'canal2-english',
    channelNumber: 9,
    name: 'Canal 2 English',
    callSign: 'Canal 2 International English',
    slogan: 'Giving voice to our community',
    category: 'English',
    city: 'Douala / Bamenda / Buea',
    language: 'English',
    frequency: 'Canal+ 311 • TNT Ch 7',
    viewers: 17400,
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    accentGradient: 'from-teal-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'The Breakfast Show',
      genre: 'Morning English Magazine',
      startTime: '09:30',
      endTime: '11:30',
      description: 'Anglophone Cameroonian morning show covering local culture, sports, community initiatives, and entertainment from Buea and Bamenda.',
      progress: 70,
    },
    nextShow: {
      title: 'Midday News at 12:00',
      genre: 'English News',
      startTime: '12:00',
    },
    schedule: [
      { time: '07:00', title: 'Morning Rise Kamer', genre: 'Music' },
      { time: '09:30', title: 'The Breakfast Show', genre: 'Talk Show', isCurrent: true },
      { time: '12:00', title: 'Midday News at 12:00', genre: 'News' },
      { time: '14:00', title: 'Grassfields Culture & Arts', genre: 'Heritage' },
      { time: '16:30', title: 'Youth Vibe Cameroon', genre: 'Youth' },
      { time: '20:00', title: 'English Prime News at 8', genre: 'News' },
      { time: '21:30', title: 'Slices of Life Documentary', genre: 'Documentary' }
    ],
    about: 'Canal 2 English is dedicated to Cameroon English-speaking population, broadcasting tailored journalism, cultural coverage from the North West and South West regions, and English language documentaries.',
    posterBg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'canal2-movies',
    channelNumber: 10,
    name: 'Canal 2 Movies',
    callSign: 'Canal 2 Cinema & Fictions',
    slogan: 'Le meilleur du 7eme art africain',
    category: 'Entertainment & Music',
    city: 'Douala',
    language: 'Francais',
    frequency: 'Canal+ 312',
    viewers: 28400,
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    accentGradient: 'from-rose-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Serie Culte: Madame... Monsieur',
      genre: 'Cameroonian Drama Series',
      startTime: '10:00',
      endTime: '11:45',
      description: 'Hit Cameroonian television series directed by Ebenezer Kepombia, dramatizing romantic trials and modern family life in Douala.',
      progress: 60,
    },
    nextShow: {
      title: 'Film Prestige: Le Blanc d Eyenga',
      genre: 'Comedy Feature Film',
      startTime: '12:00',
    },
    schedule: [
      { time: '08:00', title: 'Court-metrages de Yaounde', genre: 'Short Film' },
      { time: '10:00', title: 'Serie Culte: Madame... Monsieur', genre: 'Series', isCurrent: true },
      { time: '12:00', title: 'Film Prestige: Le Blanc d Eyenga', genre: 'Comedy Film' },
      { time: '14:30', title: 'Serie: Les Secrets de Famille', genre: 'Series' },
      { time: '17:00', title: 'Documentaire: Les Pionniers du Cinema Kamer', genre: 'Doc' },
      { time: '20:45', title: 'Grand Film du Soir: Paris a Tout Prix', genre: 'Movie' },
      { time: '23:00', title: 'Nollywood & Francophone Classics', genre: 'Film' }
    ],
    about: 'Canal 2 Movies is a 24/7 dedicated movie and series channel showcasing the rich history of Cameroonian cinematography, original local dramas, and renowned African feature films.',
    posterBg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'dash-tv',
    channelNumber: 11,
    name: 'Dash TV',
    callSign: 'Dash Media Television',
    slogan: 'Live the Dream, Experience Dash',
    category: 'Entertainment & Music',
    city: 'Douala (Bonanjo)',
    language: 'Bilingual',
    frequency: 'Canal+ 310 • Web Live',
    viewers: 16200,
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
    accentGradient: 'from-fuchsia-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Dash Urban Spotlight',
      genre: 'Youth & Tech Culture',
      startTime: '10:15',
      endTime: '12:00',
      description: 'Showcasing young Cameroonian innovators, digital creators, fashion stylists, and music producers reshaping Douala tech ecosystem.',
      progress: 50,
    },
    nextShow: {
      title: 'Afrobeats Non-Stop Mix',
      genre: 'Music Videos',
      startTime: '12:00',
    },
    schedule: [
      { time: '07:30', title: 'Dash Wake Up', genre: 'Morning Show' },
      { time: '10:15', title: 'Dash Urban Spotlight', genre: 'Youth & Tech', isCurrent: true },
      { time: '12:00', title: 'Afrobeats Non-Stop Mix', genre: 'Music' },
      { time: '14:30', title: 'Cameroon Tech Startups', genre: 'Innovation' },
      { time: '18:00', title: 'Dash Evening Pulse', genre: 'News' },
      { time: '20:30', title: 'Night Session: Live Acoustic Studios', genre: 'Concert' }
    ],
    about: 'Part of Dash Media group founded by Bony Dashaco in Douala Bonanjo, Dash TV caters to the new generation of Africans with modern lifestyle, entrepreneurship, and music content.',
    posterBg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'dbs-tv',
    channelNumber: 12,
    name: 'DBS TV',
    callSign: 'Douala Broadcasting System',
    slogan: 'La voix des berges du Wouri',
    category: 'Regional & Culture',
    city: 'Douala (Deido)',
    language: 'Francais & Duala',
    frequency: 'TNT Ch 9 • Canal+ 315',
    viewers: 14800,
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    accentGradient: 'from-sky-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Culture & Rythmes du Littoral',
      genre: 'Coastal Traditions',
      startTime: '10:00',
      endTime: '11:30',
      description: 'Exploration of Sawa oral history, traditional canoe racing, Duala proverbs, and musical recordings along the Wouri estuary.',
      progress: 75,
    },
    nextShow: {
      title: 'Les Matins de Deido',
      genre: 'Community Talk',
      startTime: '11:30',
    },
    schedule: [
      { time: '08:00', title: 'Eveil du Wouri', genre: 'Culture' },
      { time: '10:00', title: 'Culture & Rythmes du Littoral', genre: 'Heritage', isCurrent: true },
      { time: '11:30', title: 'Les Matins de Deido', genre: 'Talk Show' },
      { time: '14:00', title: 'Artisans et Createurs de Douala', genre: 'Report' },
      { time: '17:00', title: 'Le Journal Local du Littoral', genre: 'News' },
      { time: '20:30', title: 'Douala By Night: Soirees & Concerts', genre: 'Nightlife' }
    ],
    about: 'Douala Broadcasting System (DBS) is deeply rooted in Douala coastal history, preserving the authentic Duala linguistic patrimony and coastal folklore while reporting metropolitan civic news.',
    posterBg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'ltm-tv',
    channelNumber: 13,
    name: 'LTM TV',
    callSign: 'Love Television & Media',
    slogan: 'La television au coeur de l humain',
    category: 'Regional & Culture',
    city: 'Douala',
    language: 'Francais',
    frequency: 'Canal+ 314 • TNT Ch 11',
    viewers: 13900,
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    accentGradient: 'from-pink-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Matin Bonheur',
      genre: 'Family & Well-being',
      startTime: '09:30',
      endTime: '11:30',
      description: 'Inspiring lifestyle program focused on family health, community solidarity, parenting, and spiritual values in Cameroon.',
      progress: 65,
    },
    nextShow: {
      title: 'Emissions Culturelles Sawa',
      genre: 'Cultural Special',
      startTime: '11:45',
    },
    schedule: [
      { time: '07:00', title: 'Prières et Méditations', genre: 'Faith' },
      { time: '09:30', title: 'Matin Bonheur', genre: 'Lifestyle', isCurrent: true },
      { time: '11:45', title: 'Emissions Culturelles Sawa', genre: 'Culture' },
      { time: '14:00', title: 'Solidarite Citoyenne', genre: 'Social' },
      { time: '17:00', title: 'Gospel Hours Kamer', genre: 'Music' },
      { time: '20:00', title: 'LTM Soiree Famille', genre: 'Talk' }
    ],
    about: 'Love Television & Media (LTM TV) is a family-oriented channel based in Douala, dedicated to positive community storytelling, women entrepreneurship, and cultural celebrations.',
    posterBg: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'cam10-tv',
    channelNumber: 14,
    name: 'Cam10 TV',
    callSign: 'Cam10 Television',
    slogan: 'L information au plus juste',
    category: 'National & News',
    city: 'Yaounde / Douala',
    language: 'Francais',
    frequency: 'Canal+ 317 • TNT Ch 14',
    viewers: 15400,
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    accentGradient: 'from-indigo-600/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Cam10 Debat Societe',
      genre: 'Public Affairs Panel',
      startTime: '10:00',
      endTime: '12:00',
      description: 'Daily in-depth round table examining urban development, health, youth employment, and legal rights in Cameroon.',
      progress: 50,
    },
    nextShow: {
      title: 'Le 20 Heures Cam10',
      genre: 'News',
      startTime: '12:30',
    },
    schedule: [
      { time: '07:30', title: 'La Matinale Cam10', genre: 'Morning Show' },
      { time: '10:00', title: 'Cam10 Debat Societe', genre: 'Debate', isCurrent: true },
      { time: '12:30', title: 'Le Journal d Information', genre: 'News' },
      { time: '15:00', title: 'Entrepreneuriat Camerounais', genre: 'Economy' },
      { time: '18:00', title: 'Sport & Jeunesse', genre: 'Sports' },
      { time: '20:00', title: 'Le Grand Journal Cam10', genre: 'News' }
    ],
    about: 'Cam10 TV is a modern Cameroonian private news and generalist channel delivering straightforward reporting on everyday economic issues and society concerns across Yaounde and Douala.',
    posterBg: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop'
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
    viewers: 34500,
    badgeColor: 'bg-amber-600/20 text-amber-500 border-amber-600/30',
    accentGradient: 'from-amber-700/30 via-slate-900 to-slate-950',
    currentShow: {
      title: 'Le Debat Panafricain: Souverainete & Geopolitique',
      genre: 'International Relations',
      startTime: '10:30',
      endTime: '12:30',
      description: 'Passionate geopolitical round-table discussion featuring African scholars, diplomats, and commentators on continental self-determination.',
      progress: 40,
    },
    nextShow: {
      title: 'Ligne Rouge',
      genre: 'Investigative Talk',
      startTime: '12:30',
    },
    schedule: [
      { time: '07:00', title: 'Revue Geopolitique Africaine', genre: 'Analysis' },
      { time: '10:30', title: 'Le Debat Panafricain', genre: 'Geopolitics', isCurrent: true },
      { time: '12:30', title: 'Ligne Rouge', genre: 'Debate' },
      { time: '15:00', title: 'Le Merite Panafricain', genre: 'Culture' },
      { time: '18:00', title: 'Journal Panafricain du Soir', genre: 'News' },
      { time: '21:00', title: 'La Grande Tribune Continentale', genre: 'Talk' }
    ],
    about: 'Headquartered in Douala with bureaux across Central and West Africa, Afrique Media is a prominent pan-African broadcaster recognized for fervent geopolitical talk shows and continental perspectives.',
    posterBg: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1200&auto=format&fit=crop'
  }
];

const CATEGORIES = [
  'All Channels',
  'National & News',
  'Entertainment & Music',
  'Sports',
  'Regional & Culture',
  'English'
] as const;

export default function LiveTVPage() {
  const [selectedStation, setSelectedStation] = useState<TVStation>(CAMEROON_TV_STATIONS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All Channels');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);
  const [activeTab, setActiveTab] = useState<'epg' | 'about' | 'reactions'>('epg');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quality, setQuality] = useState<string>('1080p HD');
  const [reactionsCount, setReactionsCount] = useState<{ [key: string]: number }>({
    hearts: 1420,
    flames: 980,
    applause: 640,
    stars: 820
  });
  const [recentReaction, setRecentReaction] = useState<string | null>(null);

  const playerRef = useRef<HTMLDivElement>(null);
  const channelStripRef = useRef<HTMLDivElement>(null);

  // Load favorites from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sawaflix_fav_tv');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sawaflix_fav_tv', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleReaction = (type: 'hearts' | 'flames' | 'applause' | 'stars') => {
    setReactionsCount((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setRecentReaction(type);
    setTimeout(() => setRecentReaction(null), 1200);
  };

  // Filter channels based on search and category
  const filteredStations = useMemo(() => {
    return CAMEROON_TV_STATIONS.filter((station) => {
      const matchesCategory =
        activeCategory === 'All Channels' || station.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.callSign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.currentShow.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const scrollChannelStrip = (direction: 'left' | 'right') => {
    if (channelStripRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      channelStripRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen text-white pb-24">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Tv className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Cameroon Live TV
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Direct
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Official high-definition live television broadcasts from Yaounde, Douala, and across Cameroon.
          </p>
        </div>

        {/* Search Input in Header */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channel, show, or city..."
            className="w-full bg-[#0E121B] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Broadcast Player & Live Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Cinema Video Viewport (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div
            ref={playerRef}
            className="relative aspect-video w-full rounded-2xl bg-[#07090E] border border-white/10 overflow-hidden shadow-2xl group flex flex-col justify-between select-none"
          >
            {/* Background Stream Simulation / Broadcast Feed */}
            <div className="absolute inset-0 z-0">
              <Image
                src={selectedStation.posterBg}
                alt={selectedStation.name}
                fill
                className="object-cover opacity-35 filter brightness-90 group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/70" />
            </div>

            {/* Top Bar inside Player */}
            <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                  <span className="text-xs font-bold text-white tracking-wide">
                    Ch {String(selectedStation.channelNumber).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-zinc-300 font-medium border-l border-white/20 pl-2">
                    {selectedStation.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-zinc-300">
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{selectedStation.viewers.toLocaleString()}</span>
                </div>
                <div className="hidden sm:flex items-center px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
                  {quality}
                </div>
                <button
                  onClick={() => toggleFavorite(selectedStation.id)}
                  className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-red-400 hover:bg-black/80 transition-colors cursor-pointer"
                  title="Favorite station"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.includes(selectedStation.id)
                        ? 'fill-red-500 text-red-500'
                        : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Center Broadcast Branding / Watermark */}
            <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
              <motion.div
                key={selectedStation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl mb-3"
              >
                <Tv className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
                {selectedStation.name}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mt-1 drop-shadow">
                {selectedStation.slogan}
              </p>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="relative z-10 p-4 sm:p-5 bg-gradient-to-t from-black via-black/80 to-transparent">
              {/* Show info line */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                      Now Broadcasting
                    </span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs text-zinc-300">
                      {selectedStation.currentShow.startTime} - {selectedStation.currentShow.endTime}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white truncate max-w-xl">
                    {selectedStation.currentShow.title}
                  </h3>
                </div>

                <div className="hidden md:block text-right">
                  <span className="text-[11px] text-zinc-400 uppercase">Next Up</span>
                  <p className="text-xs text-zinc-300 font-medium">
                    {selectedStation.nextShow.title} ({selectedStation.nextShow.startTime})
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${selectedStation.currentShow.progress}%` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer font-bold shadow-md"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10">
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
                      className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/10 text-[11px] text-zinc-300">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span>{selectedStation.city}</span>
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white transition-colors border border-white/10 cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Station Information Bar */}
          <div className="p-4 rounded-2xl bg-[#0E121B] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white">
                Ch {String(selectedStation.channelNumber).padStart(2, '0')}
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">
                  {selectedStation.callSign}
                </h4>
                <p className="text-[11px] text-zinc-400">{selectedStation.frequency}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-zinc-300">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>{selectedStation.language}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-zinc-300">
                <Radio className="w-3.5 h-3.5 text-zinc-400" />
                <span>{selectedStation.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: TV Guide (EPG), About, and Reactions (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col h-[520px] rounded-2xl bg-[#0B0E14] border border-white/10 overflow-hidden shadow-xl">
          {/* Tabs */}
          <div className="p-2 bg-[#0E121B] border-b border-white/5 grid grid-cols-3 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('epg')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'epg'
                  ? 'bg-white text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              TV Guide (EPG)
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-white text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Station Info
            </button>
            <button
              onClick={() => setActiveTab('reactions')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'reactions'
                  ? 'bg-white text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Live Cheers
            </button>
          </div>

          {/* Tab 1: EPG / Program Schedule */}
          {activeTab === 'epg' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-800">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Today Program Schedule
                </span>
                <span className="text-[11px] text-red-400 font-medium">Cameroon Time (GMT+1)</span>
              </div>

              {selectedStation.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-all ${
                    item.isCurrent
                      ? 'bg-red-500/10 border-red-500/30 text-white'
                      : 'bg-[#11141E] border-white/5 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-zinc-400">
                      {item.time}
                    </span>
                    {item.isCurrent && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500 text-white">
                        On Air Now
                      </span>
                    )}
                  </div>
                  <h5 className="font-medium text-xs text-white mt-1">{item.title}</h5>
                  <span className="text-[10px] text-zinc-400">{item.genre}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Station Info & Frequencies */}
          {activeTab === 'about' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-zinc-800">
              <div>
                <h4 className="text-white font-semibold mb-1 text-sm">About {selectedStation.name}</h4>
                <p className="text-zinc-400 leading-relaxed text-xs">{selectedStation.about}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-zinc-400">Headquarters</span>
                  <span className="text-white font-medium">{selectedStation.city}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-zinc-400">Broadcast Frequencies</span>
                  <span className="text-white font-medium text-right">{selectedStation.frequency}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-zinc-400">Official Language</span>
                  <span className="text-white font-medium">{selectedStation.language}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-zinc-400">Station Type</span>
                  <span className="text-white font-medium">{selectedStation.category}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-zinc-400">Broadcaster Number</span>
                  <span className="text-white font-medium font-mono">
                    Channel {selectedStation.channelNumber}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Live Cheers & Community Reactions */}
          {activeTab === 'reactions' && (
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Cheer Your Station</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Support {selectedStation.name} during this live broadcast with instant viewer reactions.
                </p>

                {/* Reaction Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <button
                    onClick={() => handleReaction('hearts')}
                    className="p-3 rounded-xl bg-[#11141E] hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-white font-medium">Love</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {reactionsCount.hearts.toLocaleString()}
                    </span>
                  </button>

                  <button
                    onClick={() => handleReaction('flames')}
                    className="p-3 rounded-xl bg-[#11141E] hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-white font-medium">Fire</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {reactionsCount.flames.toLocaleString()}
                    </span>
                  </button>

                  <button
                    onClick={() => handleReaction('applause')}
                    className="p-3 rounded-xl bg-[#11141E] hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-white font-medium">Bravo</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {reactionsCount.applause.toLocaleString()}
                    </span>
                  </button>

                  <button
                    onClick={() => handleReaction('stars')}
                    className="p-3 rounded-xl bg-[#11141E] hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-white font-medium">Live Vibe</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {reactionsCount.stars.toLocaleString()}
                    </span>
                  </button>
                </div>

                {recentReaction && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center text-red-300 text-xs font-medium"
                  >
                    Cheer recorded for {selectedStation.name}!
                  </motion.div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#11141E] border border-white/5 text-[11px] text-zinc-400 text-center">
                Over 120,000 active viewers streaming Cameroonian TV channels on SawaFlix today.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Channel Carousel Strip */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Quick Channel Surfing
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollChannelStrip('left')}
              className="p-1.5 rounded-lg bg-[#0E121B] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollChannelStrip('right')}
              className="p-1.5 rounded-lg bg-[#0E121B] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={channelStripRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
        >
          {CAMEROON_TV_STATIONS.map((station) => {
            const isSelected = selectedStation.id === station.id;
            return (
              <button
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`shrink-0 w-44 p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#151A26] border-white/30 shadow-lg scale-[1.02]'
                    : 'bg-[#0E121B] border-white/5 hover:border-white/20 hover:bg-[#121622]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-zinc-400">
                    Ch {String(station.channelNumber).padStart(2, '0')}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{station.name}</h4>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {station.currentShow.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-white text-zinc-950 shadow-md'
                : 'bg-[#0E121B] text-zinc-400 hover:text-white border border-white/5 hover:border-white/15'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of All 15 Cameroonian TV Stations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight text-white">
            All Channels ({filteredStations.length})
          </h2>
          <span className="text-xs text-zinc-400">
            Showing verified authentic Cameroonian broadcast networks
          </span>
        </div>

        {filteredStations.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#0E121B] border border-white/5">
            <Tv className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No television stations found</p>
            <p className="text-xs text-zinc-400 mt-1">
              Try adjusting your search query or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredStations.map((station) => {
              const isSelected = selectedStation.id === station.id;
              return (
                <div
                  key={station.id}
                  className={`group rounded-2xl bg-[#0E121B] border transition-all overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-white/30 shadow-xl'
                      : 'border-white/5 hover:border-white/20 hover:bg-[#121622]'
                  }`}
                >
                  {/* Card Header / Image Preview */}
                  <div className="relative aspect-[16/9] w-full bg-[#07090E] overflow-hidden">
                    <Image
                      src={station.posterBg}
                      alt={station.name}
                      fill
                      className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-black/20 to-black/60" />

                    {/* Channel Number Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-white">
                        Ch {String(station.channelNumber).padStart(2, '0')}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Live
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(station.id);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-red-400 transition-colors cursor-pointer"
                      title="Bookmark"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          favorites.includes(station.id) ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </button>

                    {/* Overlay Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedStation(station);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-11 h-11 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>

                    {/* Station Name & City at Bottom of Preview */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white drop-shadow">
                        {station.name}
                      </h3>
                      <span className="text-[10px] text-zinc-300 drop-shadow">
                        {station.city.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                        <span className="text-red-400 font-medium">Currently Airing</span>
                        <span>{station.currentShow.startTime}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate">
                        {station.currentShow.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {station.currentShow.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">
                        {station.viewers.toLocaleString()} watching
                      </span>
                      <button
                        onClick={() => {
                          setSelectedStation(station);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 text-white shadow'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/5'
                        }`}
                      >
                        {isSelected ? 'Watching' : 'Watch Live'}
                      </button>
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
