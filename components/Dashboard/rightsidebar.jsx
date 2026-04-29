import { useVideos } from '@/hooks/useVideos';
import { Loader2 } from 'lucide-react';
import { useMusic } from '@/components/MusicContext';
import Image from 'next/image';

const RightSidebar = () => {
  const { videos, loading, error } = useVideos("Trending Cameroon Music 2026");
  const { playTrack } = useMusic();

  const featuredVideo = videos[0] || null;

  const trendingMusic = featuredVideo ? {
    title: featuredVideo.title,
    image: featuredVideo.thumbnail,
    likes: featuredVideo.likeCount || "2.3K",
    views: featuredVideo.viewCount || "5.4K",
    video: featuredVideo
  } : {
    title: 'Top Trending Music of the Week',
    image: 'https://i.ibb.co/HTg91sqB/Whats-App-Image-2026-03-19-at-7-26-55-AM.jpg',
    likes: "2.3K",
    views: "5.4K",
    video: null
  };

  const aiRecommendations = videos.slice(1, 7);

  return (
    <div className="w-full h-full p-6 flex flex-col space-y-8 bg-[#0B0E14] overflow-y-auto scrollbar-none border-l border-white/5">
      {/* Trending Music Section */}
      <div 
        onClick={() => trendingMusic.video && playTrack(trendingMusic.video, videos)}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 group hover:border-white/20 cursor-pointer"
      >
        <div className="flex flex-col gap-1 mb-5">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500/80">TRENDING NOW</p>
           <h2 className="text-xl font-black text-white leading-tight tracking-tight line-clamp-2">
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
        
        <div className="flex justify-between mt-6 gap-3">
          <button className="flex-1 flex items-center justify-center gap-2.5 px-3 py-3 bg-red-600/10 border border-red-600/20 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 font-black text-red-500 text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-red-600/5">
            <span className="text-xs">❤️</span>
            <span>{trendingMusic.likes}</span>
          </button>
          <div className="flex-1 flex items-center justify-center gap-2.5 px-3 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 text-[10px] font-black uppercase tracking-widest shadow-lg">
            <span className="text-xs">👁</span>
            <span>{trendingMusic.views}</span>
          </div>
        </div>
        
        <button className="mt-4 w-full px-4 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all duration-500 cursor-pointer text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/5 hover:scale-[1.02] active:scale-95">
          FOLLOW ARTIST
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
          {loading ? (
            <div className="col-span-2 flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin opacity-50" />
            </div>
          ) : (
            aiRecommendations.map((video) => (
              <div
                key={video.id}
                onClick={() => playTrack(video, videos)}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative w-full h-24">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 160px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-40 group-hover:opacity-20 transition-opacity" />
                </div>
                <p className="text-[10px] text-center p-3 text-gray-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors line-clamp-2">
                  {video.title}
                </p>
              </div>
            ))
          )}
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
