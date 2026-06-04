"use client"

import React, { useState, useMemo } from 'react';
import { Play, Plus, Star, X, Info, Filter, PlayCircle, User, Subtitles, AlignLeft, Globe, Users, Film, Calendar } from 'lucide-react';
import Image from 'next/image';

const movies = [
  {
    id: "planters-plantation",
    title: "The Planters Plantation",
    image: "https://i.ibb.co/BHbfNpkQ/planters-plantation.png",
    year: 2022,
    country: "Cameroon",
    genres: ["Drama", "Musical"],
    featured: false,
    description: "A historical drama about resistance, identity, and colonial legacy centered around a plantation inheritance struggle.",
    duration: "2h 15m",
    ageRating: "16+",
    rating: 4.5
  },
  {
    id: "saving-mbang",
    title: "Saving Mbang",
    image: "https://i.ibb.co/RGSygX9q/mbnag.png",
    year: 2020,
    country: "Cameroon",
    genres: ["Drama", "Romance"],
    featured: false,
    description: "A young man torn between family responsibility and love faces difficult choices that change his life.",
    duration: "1h 50m",
    ageRating: "13+",
    rating: 4.6
  },
  {
    id: "fishermans-diary",
    title: "The Fisherman's Diary",
    image: "https://i.ibb.co/xTCfBL6/fdiary.png",
    year: 2020,
    country: "Cameroon",
    genres: ["Drama"],
    featured: true,
    description: "A determined young girl pursues education against societal expectations while her fisherman father struggles to support her dreams.",
    duration: "2h 25m",
    ageRating: "13+",
    director: "Enah Johnscott",
    writer: "Enah Johnscott",
    stars: "Kang Quintus, Faith Fidel, Ndamo Damarise",
    language: "English",
    subtitles: "English, French",
    rating: 4.8
  },
  {
    id: "therapy",
    title: "Therapy",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2020,
    country: "Cameroon",
    genres: ["Drama", "Psychological"],
    featured: false,
    description: "A couple in emotional crisis seeks unconventional therapy to fix their collapsing relationship.",
    duration: "1h 45m",
    ageRating: "16+",
    rating: 4.6
  },
  {
    id: "half-heaven",
    title: "Half Heaven",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2022,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A dramatic story exploring ambition, survival, and emotional conflict in urban Cameroon.",
    rating: 4.4
  },
  {
    id: "kuvah",
    title: "Kuvah",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2022,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A social drama centered on personal struggle and societal pressure in modern Cameroon.",
    rating: 4.3
  },
  {
    id: "a-man-for-the-weekend",
    title: "A Man for the Weekend",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2017,
    country: "Cameroon",
    genres: ["Comedy", "Romance"],
    featured: false,
    description: "A romantic comedy about mistaken identities and unexpected relationships.",
    rating: 4.2
  },
  {
    id: "breach-of-trust",
    title: "Breach of Trust",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2017,
    country: "Cameroon",
    genres: ["Drama", "Crime"],
    featured: false,
    description: "A story dealing with family conflict, betrayal, and emotional consequences.",
    rating: 4.5
  },
  {
    id: "apple-for-two",
    title: "Apple For Two",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2017,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A romantic drama exploring relationships and difficult life decisions.",
    rating: 4.1
  },
  {
    id: "broken",
    title: "Broken",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2019,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A couple struggles with emotional trauma and hidden truths in their relationship.",
    rating: 4.7
  },
  {
    id: "hidden-dreams",
    title: "Hidden Dreams",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2021,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A young person fights societal expectations to pursue personal ambitions.",
    rating: 4.2
  },
  {
    id: "love-trap",
    title: "Love Trap",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2022,
    country: "Cameroon",
    genres: ["Romance", "Drama"],
    featured: false,
    description: "A love story complicated by deception, choices, and emotional conflict.",
    rating: 4.0
  },
  {
    id: "laxe-lourd",
    title: "L'Axe Lourd",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2023,
    country: "Cameroon",
    genres: ["Action", "Drama"],
    featured: false,
    description: "A tense drama exploring life along a dangerous and strategic highway route.",
    rating: 4.6
  },
  {
    id: "muna-moto",
    title: "Muna Moto",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 1975,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A classic Cameroonian film exploring tradition, marriage, and societal pressure.",
    rating: 4.9
  },
  {
    id: "les-saignantes",
    title: "Les Saignantes",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2005,
    country: "Cameroon",
    genres: ["Sci-Fi", "Drama"],
    featured: false,
    description: "A futuristic Cameroonian film blending political commentary and surreal storytelling.",
    rating: 4.5
  },
  {
    id: "sisters-in-law",
    title: "Sisters in Law",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2005,
    country: "Cameroon",
    genres: ["Documentary"],
    featured: false,
    description: "A documentary following women working in Cameroon's justice system.",
    rating: 4.8
  },
  {
    id: "clando",
    title: "Clando",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 1996,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A political drama about identity, exile, and survival.",
    rating: 4.4
  },
  {
    id: "le-silence-de-la-foret",
    title: "Le Silence de la Forêt",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2003,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A powerful story about discrimination and marginalized communities.",
    rating: 4.7
  },
  {
    id: "moolaadé",
    title: "Moolaadé",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2004,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A woman protects girls from harmful traditions in a rural African community.",
    rating: 4.9
  },
  {
    id: "le-prix-de-la-liberte",
    title: "Le Prix de la Liberté",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 1978,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A historical drama about freedom and political struggle.",
    rating: 4.6
  },
  {
    id: "volcanic-sprint",
    title: "Volcanic Sprint",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2007,
    country: "Cameroon",
    genres: ["Action"],
    featured: false,
    description: "An action-driven story set against natural and social chaos.",
    rating: 4.3
  },
  {
    id: "nganu",
    title: "Nganù",
    image: "https://i.ibb.co/MDLDZTtf/sawa.png",
    year: 2023,
    country: "Cameroon",
    genres: ["Drama"],
    featured: false,
    description: "A modern Cameroonian drama exploring identity, survival, and society.",
    rating: 4.7
  }
];

const FILTERS = ["All", "Action", "Comedy", "Drama", "Romance", "Sci-Fi", "Documentary"];

export default function MovieStreamingSite() {
  const featuredMovie = movies.find(m => m.featured) || movies[0];
  const [selectedMovie, setSelectedMovie] = useState(featuredMovie);
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredMovies = useMemo(() => {
    if (activeFilter === "All") return movies.filter(m => !m.featured);
    return movies.filter(m => !m.featured && m.genres?.includes(activeFilter));
  }, [activeFilter]);

  return (
    <>
      <div className="movie-page-root flex flex-col xl:flex-row gap-6 lg:gap-8 w-full max-w-[1920px] mx-auto min-h-screen text-white pb-20">
        
        {/* ========== LEFT CONTENT ========== */}
        <div className="flex-1 min-w-0 flex flex-col pt-2">

          {/* Clean Rectangular Hero Banner */}
          <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[480px] rounded-xl overflow-hidden bg-[#111] mb-8 shadow-2xl">
            {/* Background */}
            <div className="absolute inset-0">
              <Image
                src={featuredMovie.image}
                alt={featuredMovie.title}
                fill
                className="object-cover object-top opacity-90"
                priority
                unoptimized
              />
            </div>

            {/* Sharp Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/50 to-transparent w-[80%]" />

            {/* Clean Typography Content */}
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-10 flex flex-col items-start justify-end">
              <span className="inline-block bg-[#CE1126] text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase mb-2 sm:mb-3 shadow-[0_2px_10px_rgba(206,17,38,0.5)]">
                Featured Title
              </span>

              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-1 sm:mb-2 uppercase drop-shadow-md">
                {featuredMovie.title}
              </h1>

              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-300 mb-4 sm:mb-6 drop-shadow">
                <span className="flex items-center gap-1 text-[#FCD116]">
                  <Star size={14} fill="currentColor" className="sm:w-[16px] sm:h-[16px]" />
                  <span className="text-white">{featuredMovie.rating || 4.8}</span>
                </span>
                <span>{featuredMovie.year}</span>
                <span>{featuredMovie.duration || '2h 25m'}</span>
                <span className="border border-gray-400 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] uppercase text-gray-300">{featuredMovie.ageRating || '13+'}</span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <button className="bg-[#CE1126] hover:bg-[#a30d1e] text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg flex items-center gap-2 transition-all shadow-lg text-xs sm:text-sm">
                  <Play size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" /> Play Now
                </button>
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg flex items-center gap-2 transition-all backdrop-blur-md text-xs sm:text-sm">
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> Watchlist
                </button>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
            <div className="flex items-center gap-2 mr-2 text-gray-400">
              <Filter size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
            </div>
            {FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeFilter === filter 
                    ? 'bg-white text-[#0B0E14]' 
                    : 'bg-[#1A1E26] text-gray-300 hover:bg-[#252A36]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Movie Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredMovies.map((movie, idx) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                isPremium={idx % 3 === 0} 
                onClick={() => setSelectedMovie(movie)}
                isActive={selectedMovie?.id === movie.id}
              />
            ))}
            {filteredMovies.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500 font-bold">
                No movies found for "{activeFilter}"
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT SIDEBAR ========== */}
        <div className="hidden xl:block w-[340px] shrink-0 sticky top-4 h-[calc(100vh-2rem)] rounded-xl overflow-y-auto scrollbar-hide bg-[#0E121A] border border-white/5 shadow-2xl p-6">
          <RightSidebarContent 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(featuredMovie)}
            moreMovies={movies.filter(m => m.id !== selectedMovie.id).slice(0, 4)}
          />
        </div>

      </div>

      {/* MOBILE BOTTOM SHEET FOR DETAILS */}
      <div className="xl:hidden">
        {selectedMovie && selectedMovie.id !== featuredMovie.id && (
          <MovieDetailSheet 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(featuredMovie)} 
          />
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}


/* ================================================================
   MOVIE CARD (GRID STYLE)
   ================================================================ */
function MovieCard({ movie, isPremium, onClick, isActive }) {
  return (
    <div
      className={`relative w-full group/card cursor-pointer transition-all duration-300 ${isActive ? 'scale-[1.02] ring-2 ring-white/50 rounded-xl' : ''}`}
      onClick={onClick}
    >
      {/* Bigger Aspect Ratio, No Crop */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 bg-[#111] shadow-lg group-hover/card:shadow-2xl">
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          className="object-contain sm:object-cover group-hover/card:scale-105 transition-transform duration-500"
          unoptimized
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/50 backdrop-blur-sm transform scale-90 group-hover/card:scale-100 transition-all">
            <Play size={20} fill="currentColor" className="text-white ml-1" />
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-2 left-2 z-10">
          {isPremium ? (
            <span className="bg-[#111]/90 backdrop-blur-md text-[#FCD116] border border-[#FCD116]/30 text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider">
              <Star size={10} fill="currentColor" /> Premium
            </span>
          ) : (
            <span className="bg-[#009639]/90 backdrop-blur-md text-white border border-[#009639]/30 text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Details below card */}
      <div className="px-1">
        <h3 className="text-sm lg:text-base font-bold text-white tracking-tight truncate group-hover/card:text-gray-300 transition-colors mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>{movie.year} • {movie.genres?.[0]}</span>
          <span className="flex items-center gap-1 text-[#FCD116]">
            <Star size={12} fill="currentColor" />
            <span className="text-white">{movie.rating || '4.5'}</span>
          </span>
        </div>
      </div>
    </div>
  );
}


/* ================================================================
   RIGHT SIDEBAR CONTENT (Desktop)
   ================================================================ */
function RightSidebarContent({ movie, onClose, moreMovies }) {
  if (!movie) return null;
  return (
    <div className="animate-fadeIn">
      {/* Sidebar Header */}
      <div className="flex justify-between items-center mb-5">
        <span className="bg-[#FCD116]/20 text-[#FCD116] border border-[#FCD116]/30 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
          <Star size={10} fill="currentColor" /> Premium Content
        </span>
      </div>

      {/* Sidebar Preview Player */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 group cursor-pointer border border-white/10 shadow-lg">
        <Image 
          src={movie.image} 
          alt={movie.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center bg-black/40 backdrop-blur-sm group-hover:bg-[#CE1126] group-hover:border-[#CE1126] transition-all transform shadow-lg">
            <Play size={24} fill="currentColor" className="text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Sidebar Title & Meta */}
      <h2 className="text-2xl font-black text-white mb-2 leading-tight uppercase tracking-tight">{movie.title}</h2>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-400 mb-6">
        <span className="flex items-center gap-1 text-[#FCD116]">
          <Star size={14} fill="currentColor" />
          <span className="text-white">{movie.rating || 4.8}</span>
        </span>
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span>{movie.year}</span>
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span>{movie.duration || "2h 25m"}</span>
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span className="border border-gray-600 px-1 rounded">{movie.ageRating || "13+"}</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-8">
        <button className="w-full bg-[#CE1126] hover:bg-[#a30d1e] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm">
          <Play size={18} fill="currentColor" /> Play Movie
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-xs">
            <PlayCircle size={16} /> Trailer
          </button>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-xs">
            <Plus size={16} /> List
          </button>
        </div>
      </div>

      {/* Synopsis */}
      <p className="text-gray-300 text-sm leading-relaxed mb-8">
        {movie.description}
      </p>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10 text-xs">
        <MetaItem icon={<User size={16} />} label="Director" value={movie.director || "TBA"} />
        <MetaItem icon={<Subtitles size={16} />} label="Subtitles" value={movie.subtitles || "English, French"} />
        <MetaItem icon={<AlignLeft size={16} />} label="Writer" value={movie.writer || "TBA"} />
        <MetaItem icon={<Globe size={16} />} label="Country" value={movie.country || "Cameroon"} />
        <MetaItem icon={<Film size={16} />} label="Genre" value={movie.genres?.join(", ") || "Drama"} />
        <MetaItem icon={<Calendar size={16} />} label="Year" value={movie.year} />
      </div>

      {/* More Like This */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Related Movies</h3>
        <div className="grid grid-cols-2 gap-3">
          {moreMovies.map((m, idx) => (
            <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer border border-white/5">
              <Image src={m.image} alt={m.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <p className="text-xs font-bold text-white truncate">{m.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}


/* ================================================================
   MOBILE BOTTOM SHEET
   ================================================================ */
function MovieDetailSheet({ movie, onClose }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full bg-[#0E121A] rounded-t-3xl overflow-hidden animate-slideUp z-10" style={{ maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-2"><div className="w-12 h-1.5 rounded-full bg-white/20" /></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-20"><X size={22} /></button>
        <div className="overflow-y-auto px-6 pb-10" style={{ maxHeight: 'calc(88vh - 40px)' }}>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-5 border border-white/10 group cursor-pointer">
            <Image src={movie.image} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20">
              <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center bg-black/40 backdrop-blur-sm group-hover:bg-[#CE1126] group-hover:border-[#CE1126] transition-all">
                <Play size={24} fill="currentColor" className="text-white ml-1" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{movie.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-white/60 mb-5">
            <span className="flex items-center gap-1 text-[#FCD116]"><Star size={13} fill="currentColor" /><span className="text-white">{movie.rating || 4.5}</span></span>
            <span>{movie.year}</span>
            <span>{movie.duration || '2h'}</span>
            <span className="border border-white/30 px-1 py-0.5 rounded text-[10px]">{movie.ageRating || '13+'}</span>
          </div>
          <div className="space-y-2.5 mb-6">
            <button className="w-full bg-[#CE1126] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm"><Play size={17} fill="currentColor" /> Watch Now</button>
            <div className="grid grid-cols-2 gap-2.5">
              <button className="bg-white/5 border border-white/10 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm"><PlayCircle size={16} /> Trailer</button>
              <button className="bg-white/5 border border-white/10 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm"><Plus size={16} /> Watchlist</button>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-8">{movie.description}</p>
          <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-xs">
            <MetaItem icon={<User size={15} />} label="Director" value={movie.director || "TBA"} />
            <MetaItem icon={<Subtitles size={15} />} label="Subtitles" value={movie.subtitles || "English"} />
            <MetaItem icon={<Globe size={15} />} label="Country" value={movie.country} />
            <MetaItem icon={<Film size={15} />} label="Genre" value={movie.genres?.join(', ')} />
          </div>
        </div>
      </div>
      <style jsx>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards; }`}</style>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-white/30 mt-0.5">{icon}</div>
      <div>
        <p className="text-white/40 font-semibold mb-0.5">{label}</p>
        <p className="text-white font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}