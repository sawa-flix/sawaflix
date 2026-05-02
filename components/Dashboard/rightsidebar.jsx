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
    <div className="w-full h-full p-4 flex flex-col bg-[#0B0E14] overflow-y-auto scrollbar-none border-l border-white/5">
      {/* Trending Music Section */}
      <div className="space-y-2 mb-2">
        <h3 className="px-2 py-1 text-[15px] font-bold text-white">Trending Now</h3>
        <div 
          onClick={() => trendingMusic.video && playTrack(trendingMusic.video, videos)}
          className="group cursor-pointer rounded-xl p-2 hover:bg-white/10 transition-all duration-200"
        >
          <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
            <Image
              src={trendingMusic.image}
              alt="Trending Music"
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </div>
          <h2 className="text-sm font-semibold text-white line-clamp-2 mb-1 leading-snug">
            {trendingMusic.title}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#AAAAAA] mb-3">
             <span>{trendingMusic.views} views</span>
             <span>•</span>
             <span>{trendingMusic.likes} likes</span>
          </div>
          <button className="w-full py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all duration-200 text-sm">
            Follow Artist
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 my-2"></div>

      {/* AI Recommended Versions */}
      <div className="space-y-2 mb-2">
        <h3 className="px-2 py-1 text-[15px] font-bold text-white">Recommended</h3>
        {loading ? (
           <div className="flex items-center justify-center py-6">
             <Loader2 className="w-6 h-6 text-[#AAAAAA] animate-spin" />
           </div>
        ) : (
           <div className="flex flex-col gap-1">
             {aiRecommendations.map((video) => (
               <div
                 key={video.id}
                 onClick={() => playTrack(video, videos)}
                 className="flex gap-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer group"
               >
                 <div className="relative w-[120px] h-[68px] rounded-lg overflow-hidden shrink-0">
                   <Image
                     src={video.thumbnail}
                     alt={video.title}
                     fill
                     sizes="120px"
                     className="object-cover group-hover:scale-105 transition-transform duration-300"
                   />
                 </div>
                 <div className="flex-1 min-w-0 py-0.5">
                   <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1 leading-tight">{video.title}</h4>
                   <p className="text-xs text-[#AAAAAA] truncate">{video.channelTitle || 'Artist'}</p>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>

      <div className="border-t border-white/10 my-2"></div>

      {/* Quick Actions */}
      <div className="space-y-1 mb-4">
        <h3 className="px-2 py-2 text-[15px] font-bold text-white">Quick Actions</h3>
        {['Create Playlist', 'Import Music', 'Shuffle All'].map(action => (
          <button key={action} className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#AAAAAA] hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer">
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;
