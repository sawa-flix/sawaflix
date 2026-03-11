'use client';
import React from 'react';
import Image from 'next/image';

const RightSidebar = () => {
  const trendingMusic = {
    title: 'Top Trending Music of the Week',
    image: '/mfy1.jpg',
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
    <div className="w-full h-full p-6 flex flex-col space-y-6 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 overflow-y-auto scrollbar-none">
      {/* Trending Music Section */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group">
        <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
          {trendingMusic.title}
        </h2>
        <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-inner">
          <Image unoptimized
            src={trendingMusic.image}
            alt="Trending Music"
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="flex justify-between mt-4 text-sm text-gray-200">
          <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg hover:from-pink-700 hover:to-red-700 shadow-md transition-all duration-200 hover:scale-105">
            <span>❤️</span>
            <span>{trendingMusic.likes.toLocaleString()}</span>
          </button>
          <span className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
            <span>👁</span>
            <span>{trendingMusic.views.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
            <span>💬</span>
            <span>{trendingMusic.comments}</span>
          </span>
        </div>
        <button className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
          ➕ Follow Artist
        </button>
      </div>

      {/* AI Recommended Versions */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
          AI Recommended Versions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {aiRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div className="relative w-full h-24">
                <Image unoptimized
                  src={rec.image}
                  alt={rec.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 160px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <p className="text-xs text-center p-3 text-gray-200 font-medium group-hover:text-white transition-colors">
                {rec.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
        <h3 className="text-md font-semibold mb-3 text-gray-200">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
            🎵 Create Playlist
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
            📥 Import Music
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
            🔄 Shuffle All
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
