'use client';

import React, { useState } from 'react';
import { Heart, Search, Filter, Trash2, ArrowRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../../../../contexts/FavoriteContext';
import MovieCard from '../../../../components/MovieCard';
import Image from 'next/image';
import Link from 'next/link';

const FavoritesPage = () => {
  const { favorites, loading, toggleFavorite } = useFavorites();
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFavorites = favorites.filter(item => {
    const matchesFilter = filterType === 'all' || item.type?.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'movie', label: 'Movies' },
    { id: 'music', label: 'Music' },
    { id: 'reel', label: 'Reels' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
          <div className="absolute inset-0 blur-2xl bg-red-500/20 rounded-full animate-pulse" />
        </div>
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Favorites...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">My Favorites</h1>
          </div>
          <p className="text-gray-400 font-medium max-w-md">
            Your personal collection of movies, music, and reels you've saved to watch later.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search saved content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 ring-red-500/20 focus:border-red-500/50 transition-all w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterType(cat.id)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
              filterType === cat.id
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20 scale-105'
                : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="popLayout">
        {filteredFavorites.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {filteredFavorites.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                {item.type === 'reel' ? (
                  <Link href={`/dashboard/reels?videoId=${item.contentId}`} className="block aspect-[9/16] relative rounded-2xl overflow-hidden border border-white/5 group-hover:border-red-500/50 transition-all shadow-2xl">
                    <Image 
                      src={item.thumbnail || 'https://i.ibb.co/WWhx2c0g/sawaflixmusic-cover.png'} 
                      alt={item.title || ''}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-xs truncate drop-shadow-lg">{item.title}</p>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item);
                      }}
                      className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all border border-white/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </Link>
                ) : (
                  <MovieCard 
                    movie={{
                      ...item,
                      image: item.thumbnail || item.image || 'https://i.ibb.co/WWhx2c0g/sawaflixmusic-cover.png',
                      title: item.title || 'Untitled'
                    }}
                    onPlay={() => {}} // Handle navigation
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5">
              <Heart className="w-10 h-10 text-gray-700" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Your collection is empty</h3>
            <p className="text-gray-500 max-w-xs mb-10 font-medium">
              Start exploring SawaFlix and save your favorite movies, music and reels.
            </p>
            <Link href="/dashboard">
              <button className="px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl hover:shadow-red-500/20 active:scale-95 flex items-center gap-3">
                Discover Content
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default FavoritesPage;
