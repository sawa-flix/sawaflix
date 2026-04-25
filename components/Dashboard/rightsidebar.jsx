'use client';
import React from 'react';
import Image from 'next/image';

const RightSidebar = () => {
  const trendingMusic = {
    title: 'Top Trending Music of the Week',
    image: 'https://i.ibb.co/HTg91sqB/Whats-App-Image-2026-03-19-at-7-26-55-AM.jpg',
    likes: 2300,
    views: 5400,
    comments: 120,
  };

  const aiRecommendations = [
    { id: 1, title: 'AI Mix 1', image: '/music1.jpg' },
    { id: 2, title: 'AI Mix 2', image: '/music2.jpg' },
    { id: 3, title: 'AI Mix 3', image: '/music3.jpg' },
    { id: 4, title: 'AI Mix 4', image: '/music4.jpg' },
    { id: 5, title: 'AI Mix 5', image: '/music5.jpg' },
    { id: 6, title: 'AI Mix 6', image: '/music6.jpg' },
  ];

  return (
    <div className="w-full h-full p-6 flex flex-col space-y-8 bg-[#0B0E14] overflow-y-auto scrollbar-none border-l border-white/5">
      {/* Trending Music Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 group hover:border-white/20">
        <div className="flex flex-col gap-1 mb-5">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Trending now</p>
           <h2 className="text-lg font-black text-white leading-tight">
             {trendingMusic.title}
           </h2>
        </div>
        <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={trendingMusic.image}
            alt="Trending Music"
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>
        
        <div className="flex justify-between mt-6 gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600/10 border border-red-600/20 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 font-bold text-red-500 text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-red-600/5">
            <span>❤️</span>
            <span>{trendingMusic.likes.toLocaleString()}</span>
          </button>
          <span className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <span>👁</span>
            <span>{trendingMusic.views.toLocaleString()}</span>
          </span>
        </div>
        
        <button className="mt-4 w-full px-4 py-3.5 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all duration-300 cursor-pointer text-xs uppercase tracking-widest shadow-xl shadow-white/5">
          Follow artist
        </button>
      </div>

      {/* AI Recommended Versions */}
      <div className="flex-1">
        <div className="flex flex-col gap-1 mb-5 px-1">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600/80">Smart suggest</p>
           <h2 className="text-lg font-black text-white leading-tight">
             AI Recommended
           </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {aiRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
            >
              <div className="relative w-full h-24">
                <Image
                  src={rec.image}
                  alt={rec.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 160px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-40 group-hover:opacity-20 transition-opacity" />
              </div>
              <p className="text-[10px] text-center p-3 text-gray-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                {rec.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 px-1">Quick actions</p>
        <div className="space-y-2">
          {['Create Playlist', 'Import Music', 'Shuffle All'].map(action => (
            <button key={action} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all duration-300 cursor-pointer uppercase tracking-widest">
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;

export default RightSidebar;
