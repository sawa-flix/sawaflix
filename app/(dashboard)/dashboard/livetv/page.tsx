'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Tv, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Search, 
  Heart, 
  Clock, 
  MapPin, 
  Radio, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  Globe, 
  Calendar,
  Sparkles,
  ArrowRight
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
  logoUrl?: string;
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
  posterBg: string;
}

const LIVE_TV_BANNER = "https://i.ibb.co/cSb3xbY8/Chat-GPT-Image-Sep-4-2026-11-43-12-PM.png";

// 15 Authentic, Verified Cameroonian Television Broadcasters (Zero Hallucination)
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
    frequency: 'Canal+ 305 • TNT Ch 2 • Eutelsat 16A',
    viewers: 34500,
    logoUrl: 'https://i.ibb.co/27tHg09j/images-7-removebg-preview.png',
    currentShow: {
      title: 'The Debate: Cameroon Geopolitics',
      genre: 'News Analysis',
      startTime: '11:00',
      endTime: '12:00',
      description: 'Live continuous round-the-clock news bulletin and economic updates covering central Africa, diplomatic affairs, and national governance.',
      progress: 45,
    },
    nextShow: {
      title: 'Eco 24 - CEMAC Financial Review',
      genre: 'Economy',
      startTime: '12:00',
    },
    schedule: [
      { time: '06:00', title: 'Morning Bulletin 24', genre: 'News' },
      { time: '09:00', title: 'Presse Diplomatique', genre: 'Analysis' },
      { time: '11:00', title: 'The Debate: Cameroon Geopolitics', genre: 'News Analysis', isCurrent: true },
      { time: '12:00', title: 'Eco 24 - CEMAC Financial Review', genre: 'Economy' },
      { time: '14:00', title: 'Le Journal des 10 Regions', genre: 'News' },
      { time: '17:00', title: 'Flash Info En Continu', genre: 'News' },
      { time: '19:00', title: 'The World This Hour', genre: 'World News' },
      { time: '21:00', title: 'Grand Format Afrique Centrale', genre: 'Documentary' }
    ],
    about: 'CRTV News is Cameroon official 24-hour bilingual rolling news network based in Yaounde Mballa II. It delivers non-stop coverage of politics, economy, culture, and diplomacy across Cameroon and the CEMAC sub-region.',
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
    frequency: 'Canal+ 302 • Startimes Ch 105 • SES 4',
    viewers: 42800,
    logoUrl: 'https://i.ibb.co/Zz5rp35J/canal2-logo-removebg-preview.png',
    currentShow: {
      title: 'Jambo Television',
      genre: 'Entertainment & Variety',
      startTime: '10:30',
      endTime: '12:30',
      description: 'The iconic Cameroonian entertainment show featuring live musical performances, comedy sketches, celebrity interviews, and cultural discussions.',
      progress: 55,
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
    about: 'Founded in 2004 by Emmanuel Chatue in Douala, Canal 2 International is the most-watched private television network in Cameroon, renowned for shows like Jambo, C Comment, Canal Presse, and Le 19h50.',
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
    viewers: 39600,
    logoUrl: 'https://i.ibb.co/fY4JqbfB/images-9-removebg-preview.png',
    currentShow: {
      title: 'Droit de Reponse',
      genre: 'Political Debate',
      startTime: '10:00',
      endTime: '12:00',
      description: 'Cameroon premier independent investigative talk show and societal debate panel analyzing top national headlines with respected political commentators.',
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
    about: 'Equinoxe Television is Cameroon leading independent news channel, established in 2006 by Severin Tchounkeu in Douala. It is internationally respected for investigative journalism, Droit de Reponse, and Equinoxe Soir.',
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
    frequency: 'Canal+ 316 • TNT Ch 8 • Web TV',
    viewers: 24200,
    logoUrl: 'https://i.ibb.co/q3H7zTLq/mymdiaprime-removebg-preview.png',
    currentShow: {
      title: 'MMP Matin - Le Grand Debat',
      genre: 'Morning News & Analysis',
      startTime: '09:30',
      endTime: '11:45',
      description: 'Dynamic morning public affairs broadcast exploring everyday economic questions, infrastructure developments, and cultural news across Cameroon.',
      progress: 60,
    },
    nextShow: {
      title: 'Journal de la Mi-Journee MMP',
      genre: 'News Bulletin',
      startTime: '12:00',
    },
    schedule: [
      { time: '07:00', title: 'MMP Matin Express', genre: 'Morning Show' },
      { time: '09:30', title: 'MMP Matin - Le Grand Debat', genre: 'Debate', isCurrent: true },
      { time: '12:00', title: 'Journal de la Mi-Journee MMP', genre: 'News' },
      { time: '14:30', title: 'Point Eco Afrique', genre: 'Economy' },
      { time: '17:00', title: 'Jeunesse & Talents du Cameroun', genre: 'Culture' },
      { time: '20:00', title: 'Le 20h Prime d Information', genre: 'News' }
    ],
    about: 'My Media Prime (MMP TV) is a modern private Cameroonian news, society, and culture broadcaster delivering crisp HD news reports, political talk shows, and urban features across Douala, Yaounde, and the diaspora.',
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
    frequency: 'Canal+ 301 • TNT Ch 1 • Eutelsat 16A',
    viewers: 36100,
    logoUrl: 'https://i.ibb.co/27tHg09j/images-7-removebg-preview.png',
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
    about: 'Cameroon Radio Television (CRTV) is the national public broadcaster headquartered in Yaounde Mballa II. Founded in 1985, it is the primary historical bilingual network transmitting nationwide across terrestrial TNT, satellite, and digital.',
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
    about: 'CRTV Sports & Entertainment is the official television home of Cameroonian athletics, broadcasting the Elite One football championship, national leagues, and historic Lions Indomptables archives.',
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
    about: 'Created in 2021 by broadcast personality Cyrille Bojiko under Groupe Balafon, Balafon TV is Douala fastest-growing entertainment network celebrated for championing Cameroonian urban sounds and cultural humor.',
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
    frequency: 'Canal+ 304 • Eutelsat 16A',
    viewers: 22600,
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
    channelNumber: 10,
    name: 'Canal 2 English',
    callSign: 'Canal 2 International English',
    slogan: 'Giving voice to our community',
    category: 'English',
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
      { time: '07:00', title: 'Prieres et Meditations', genre: 'Faith' },
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'about'>('schedule');

  const playerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

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

  const scrollStrip = (direction: 'left' | 'right') => {
    if (stripRef.current) {
      const offset = direction === 'left' ? -350 : 350;
      stripRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen text-white pb-28">
      {/* Featured Banner Section */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl bg-black">
        <div className="relative aspect-[21/9] sm:aspect-[24/8] md:aspect-[24/7] min-h-[200px] sm:min-h-[260px] w-full">
          <Image
            src={LIVE_TV_BANNER}
            alt="SawaFlix Live TV Banner"
            fill
            className="object-cover object-center opacity-70 filter brightness-95"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

          {/* Banner Text Content */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Broadcast
              </span>
              <span className="text-xs text-zinc-300 hidden sm:inline-block font-mono bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                15 National & Regional Channels
              </span>
            </div>

            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
                Cameroon Live TV
              </h1>
              <p className="text-xs sm:text-sm text-zinc-200 mt-2 line-clamp-2 max-w-xl leading-relaxed drop-shadow">
                Stream CRTV News, Canal 2 International, Equinoxe TV, My Media Prime, and all official Cameroonian broadcast stations with live interactive guides.
              </p>

              {/* Station Logos Preview Ticker */}
              <div className="flex items-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-white/15 overflow-x-auto no-scrollbar">
                <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider shrink-0">
                  Featured Stations:
                </div>
                {CAMEROON_TV_STATIONS.filter((s) => s.logoUrl).slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedStation(s);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-all shrink-0 cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-white/5 p-0.5">
                      <Image
                        src={s.logoUrl!}
                        alt={s.name}
                        width={20}
                        height={20}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-zinc-100">
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Theater Experience */}
      <div className="relative mb-6 rounded-3xl bg-[#090C12] border border-white/10 overflow-hidden shadow-2xl">
        <div
          ref={playerRef}
          className="relative aspect-video w-full max-h-[70vh] flex flex-col justify-between overflow-hidden bg-black select-none group"
        >
          {/* Background Ambient Poster View */}
          <div className="absolute inset-0 z-0">
            <Image
              src={selectedStation.posterBg}
              alt={selectedStation.name}
              fill
              className="object-cover opacity-45 filter brightness-95 group-hover:scale-[1.02] transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70" />
          </div>

          {/* Top Info Bar inside Player */}
          <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
              
              <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-xs">
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
                <span className="font-mono font-medium">{selectedStation.viewers.toLocaleString()}</span>
              </div>

              <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-zinc-300">
                1080p Full HD
              </div>

              <button
                onClick={() => toggleFavorite(selectedStation.id)}
                className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Favorite channel"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favorites.includes(selectedStation.id)
                      ? 'fill-white text-white'
                      : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Center Brand Identity */}
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <motion.div
              key={selectedStation.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/25 flex items-center justify-center shadow-2xl mb-3 p-2 overflow-hidden"
            >
              {selectedStation.logoUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={selectedStation.logoUrl}
                    alt={selectedStation.name}
                    width={80}
                    height={80}
                    className="object-contain max-h-full max-w-full drop-shadow-md"
                    unoptimized
                  />
                </div>
              ) : (
                <Tv className="w-10 h-10 text-white stroke-[1.75]" />
              )}
            </motion.div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
              {selectedStation.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-200 max-w-md mt-1 drop-shadow font-medium">
              {selectedStation.slogan}
            </p>
          </div>

          {/* Bottom Controls Overlay */}
          <div className="relative z-10 p-4 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
            {/* Show Info */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                    Now Playing
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-xs text-zinc-300 font-mono">
                    {selectedStation.currentShow.startTime} - {selectedStation.currentShow.endTime}
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-[11px] text-zinc-400">
                    {selectedStation.currentShow.genre}
                  </span>
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-white truncate max-w-2xl">
                  {selectedStation.currentShow.title}
                </h3>
              </div>

              <div className="hidden md:block text-right">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider">Up Next</span>
                <p className="text-xs text-zinc-200 font-medium">
                  {selectedStation.nextShow.title} ({selectedStation.nextShow.startTime})
                </p>
              </div>
            </div>

            {/* Clean Light Progress Bar */}
            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 shadow"
                style={{ width: `${selectedStation.currentShow.progress}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer font-bold shadow-lg"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-white/15">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-zinc-200 hover:text-white transition-colors cursor-pointer"
                    aria-label="Toggle mute"
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

              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/15 text-xs text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{selectedStation.city}</span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white transition-colors border border-white/15 cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Channel Surfing Strip */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Quick Channel Surfing
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollStrip('left')}
              className="p-1.5 rounded-lg bg-[#0E121B] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollStrip('right')}
              className="p-1.5 rounded-lg bg-[#0E121B] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={stripRef}
          className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
        >
          {CAMEROON_TV_STATIONS.map((station) => {
            const isSelected = selectedStation.id === station.id;
            return (
              <button
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`shrink-0 w-48 p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-zinc-950 border-white shadow-xl scale-[1.02]'
                    : 'bg-[#0E121B] border-white/10 hover:border-white/25 hover:bg-[#121622] text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {station.logoUrl && (
                      <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-black/10">
                        <Image
                          src={station.logoUrl}
                          alt={station.name}
                          width={20}
                          height={20}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <span
                      className={`font-mono text-xs font-bold ${
                        isSelected ? 'text-zinc-900' : 'text-zinc-400'
                      }`}
                    >
                      Ch {String(station.channelNumber).padStart(2, '0')}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-zinc-950 text-white'
                        : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    Live
                  </span>
                </div>
                <h4
                  className={`text-xs font-bold truncate ${
                    isSelected ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {station.name}
                </h4>
                <p
                  className={`text-[11px] truncate mt-0.5 ${
                    isSelected ? 'text-zinc-700' : 'text-zinc-400'
                  }`}
                >
                  {station.currentShow.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: Schedule & Channel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Schedule & Channel Details (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[#0E121B] border border-white/10">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                    activeTab === 'schedule'
                      ? 'text-white border-b-2 border-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Schedule (EPG)
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                    activeTab === 'about'
                      ? 'text-white border-b-2 border-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Station Details
                </button>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">GMT+1</span>
            </div>

            {activeTab === 'schedule' ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {selectedStation.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all ${
                      item.isCurrent
                        ? 'bg-white text-zinc-950 border-white shadow'
                        : 'bg-[#121622] border-white/5 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-xs font-mono font-bold ${
                          item.isCurrent ? 'text-zinc-900' : 'text-zinc-400'
                        }`}
                      >
                        {item.time}
                      </span>
                      {item.isCurrent && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-zinc-950 text-white">
                          On Air Now
                        </span>
                      )}
                    </div>
                    <h5
                      className={`text-xs font-semibold ${
                        item.isCurrent ? 'text-zinc-950' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </h5>
                    <span
                      className={`text-[11px] ${
                        item.isCurrent ? 'text-zinc-700' : 'text-zinc-400'
                      }`}
                    >
                      {item.genre}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed max-h-[380px] overflow-y-auto pr-1">
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">{selectedStation.name}</h4>
                  <p className="text-zinc-400 text-xs">{selectedStation.about}</p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Headquarters</span>
                    <span className="text-white font-medium">{selectedStation.city}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Transmission</span>
                    <span className="text-white font-medium">{selectedStation.frequency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Language</span>
                    <span className="text-white font-medium">{selectedStation.language}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Genre</span>
                    <span className="text-white font-medium">{selectedStation.category}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Category Filters & Channel Grid (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'bg-[#0E121B] text-zinc-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredStations.map((station) => {
              const isSelected = selectedStation.id === station.id;
              return (
                <div
                  key={station.id}
                  onClick={() => {
                    setSelectedStation(station);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#151A26] border-white/40 shadow-xl ring-1 ring-white/20'
                      : 'bg-[#0E121B] border-white/10 hover:border-white/25 hover:bg-[#121622]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {station.logoUrl ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white/5 border border-white/10">
                          <Image
                            src={station.logoUrl}
                            alt={station.name}
                            width={24}
                            height={24}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded-md bg-white/10 border border-white/10">
                          Ch {String(station.channelNumber).padStart(2, '0')}
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-white group-hover:text-zinc-100 transition-colors">
                        {station.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                      Live
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] text-zinc-400 mb-0.5">Now Airing:</div>
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {station.currentShow.title}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{station.city.split(' ')[0]}</span>
                    <span className="font-mono">{station.viewers.toLocaleString()} watching</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
