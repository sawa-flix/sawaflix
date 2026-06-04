'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Trash2, DownloadCloud } from 'lucide-react';
import PremiumPaywall from '../../../components/PremiumPaywall';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    // Load downloads from local storage on mount
    try {
      const stored = localStorage.getItem('sawaflix_downloads');
      if (stored) {
        setDownloads(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load downloads', e);
    }
  }, []);

  const removeDownload = (id) => {
    const newDownloads = downloads.filter(d => d.id !== id);
    setDownloads(newDownloads);
    localStorage.setItem('sawaflix_downloads', JSON.stringify(newDownloads));
  };

  const handlePlay = (movie) => {
    setSelectedMovie(movie);
  };

  return (
    <div className="min-h-screen bg-[#06080C] p-6 lg:p-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FCD116]/10 flex items-center justify-center">
          <DownloadCloud size={20} className="text-[#FCD116]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">My Downloads</h1>
          <p className="text-zinc-500 text-sm mt-1 font-medium">Watch your offline movies anytime, anywhere.</p>
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <DownloadCloud size={32} className="text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No downloads yet</h2>
          <p className="text-zinc-500 max-w-sm">
            Movies you download will appear here for offline viewing. Explore the catalog and start downloading!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {downloads.map((movie) => (
            <div key={movie.id} className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl">
              <div className="aspect-[2/3] relative w-full">
                <Image
                  src={movie.image || movie.thumbnail || '/placeholder.jpg'}
                  alt={movie.title || 'Movie'}
                  fill
                  className="object-cover"
                  unoptimized
                />
                
                {/* Overlay Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                  <button 
                    onClick={() => handlePlay(movie)}
                    className="w-12 h-12 rounded-full bg-[#FCD116] hover:bg-[#e5bc14] flex items-center justify-center transition-transform hover:scale-110 shadow-[0_0_20px_rgba(252,209,22,0.4)]"
                  >
                    <Play size={20} fill="black" className="text-black ml-1" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeDownload(movie.id); }}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-500 text-white text-xs font-bold transition-colors border border-white/10 hover:border-red-500/30 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3 bg-green-500 text-black text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg flex items-center gap-1">
                  Downloaded
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm truncate">{movie.title || 'Unknown Title'}</h3>
                <p className="text-zinc-500 text-xs mt-1 font-medium">{movie.category || 'Movie'} • Offline</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMovie && (
        <PremiumPaywall 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </div>
  );
}
