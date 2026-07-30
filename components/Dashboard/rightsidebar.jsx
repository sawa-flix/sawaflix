import React, { useState } from 'react';
import { useVideos } from '@/hooks/useVideos';
import { Loader2, Music, Laugh, Newspaper, Zap } from 'lucide-react';
import { useMusic } from '@/components/MusicContext';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const TOP_ARTISTS = [
  { id: 'jovi', name: 'Jovi', image: 'https://i.ibb.co/TD26rNtX/jovi-2.png' },
  { id: 'stanley-enow', name: 'Stanley Enow', image: 'https://i.ibb.co/C07Bf5B/stanley.png' },
  { id: 'blanche-bailly', name: 'Blanche Bailly', image: 'https://i.ibb.co/hK7Jq6Z/blanche.jpg' },
  { id: 'tzy-panchak', name: 'Tzy Panchak', image: 'https://i.ibb.co/3s8pM1r/tzy.jpg' }
];

const MUSIC_CARD_THUMB = "https://i.ibb.co/21Dd0zTh/sound.png";

const CATEGORIES = [
  { id: "music",  label: "Music",   icon: Music,     query: "Trending Cameroon Music 2026" },
  { id: "comedy", label: "Comedy",  icon: Laugh,     query: "Cameroon comedy viral 2026" },
  { id: "news",   label: "News",    icon: Newspaper, query: "Cameroon news shorts today" },
  { id: "viral",  label: "Viral",   icon: Zap,       query: "Cameroon viral reels 2026" },
];

const RightSidebar = () => {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState("music");

  React.useEffect(() => {
    if (pathname?.includes('/movie')) setActiveCategory("comedy");
    else if (pathname?.includes('/blogs')) setActiveCategory("news");
    else if (pathname?.includes('/music') || pathname?.includes('/artist')) setActiveCategory("music");
    else setActiveCategory("viral");
  }, [pathname]);
  
  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);
  const { videos, loading, error } = useVideos(currentCategory.query);
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

  const aiRecommendations = videos.slice(1, 11);

  const handleItemClick = (videoToPlay, allVideos) => {
    if (!videoToPlay) return;
    if (activeCategory === 'music') {
      playTrack(videoToPlay, allVideos);
    } else {
      window.dispatchEvent(new CustomEvent('openSawaReel', { detail: videoToPlay }));
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col bg-[color:var(--background)] overflow-y-auto scrollbar-none border-l border-[color:var(--border)]">


      {/* Trending Section (Hidden in Music Context) */}
      {activeCategory !== 'music' && (
        <>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[14px] font-black uppercase tracking-widest text-[color:var(--muted-foreground)]">Trending</h3>
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
            </div>
            
            {loading && !featuredVideo ? (
              <div className="w-full h-56 rounded-2xl bg-[color:var(--surface)]/20 animate-pulse" />
            ) : (
              <div 
                onClick={() => handleItemClick(trendingMusic.video, videos)}
                className="group cursor-pointer rounded-2xl p-2 bg-[color:var(--surface)]/30 hover:bg-[color:var(--surface)]/50 border border-[color:var(--border)]/50 transition-all duration-300"
              >
                <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4">
                  <Image
                    src={trendingMusic.image}
                    alt="Trending"
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--surface)]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                     <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-2 inline-block">Featured</span>
                     <h2 className="text-sm font-bold text-[color:var(--foreground)] line-clamp-2 leading-snug drop-shadow-md">
                       {trendingMusic.title}
                     </h2>
                  </div>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-[color:var(--muted-foreground)] uppercase tracking-wider">
                     <span>{trendingMusic.views} views</span>
                     <span>•</span>
                     <span>{trendingMusic.likes} likes</span>
                  </div>
                  <div className="w-8 h-8 bg-[color:var(--surface)]/20 rounded-full flex items-center justify-center group-hover:bg-[color:var(--surface)] group-hover:text-black transition-all">
                     <Zap size={14} className="fill-current" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="h-px bg-[color:var(--border)]/40 my-4" />
        </>
      )}

      {/* Top Artists (Only for Music Context) */}
      {activeCategory === 'music' && (
        <>
          <div className="space-y-4 mb-6 mt-2">
            <h3 className="px-2 text-[14px] font-black uppercase tracking-widest text-[color:var(--muted-foreground)]">Top Artists</h3>
            <div className="flex flex-col gap-2 px-2">
              {TOP_ARTISTS.map(artist => (
                 <Link href={`/dashboard/artist/${artist.id}`} key={artist.id} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-[color:var(--surface)]/10 transition-all cursor-pointer group">
                   <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[color:var(--border)] shadow-lg group-hover:scale-105 transition-transform">
                     <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-[color:var(--foreground)] group-hover:text-[color:var(--foreground)]/90">{artist.name}</h4>
                     <p className="text-[10px] text-[color:var(--muted-foreground)] uppercase tracking-wider font-bold">Artist</p>
                   </div>
                 </Link>
              ))}
            </div>
          </div>
          <div className="h-px bg-[color:var(--border)]/40 my-4" />
        </>
      )}

      {/* Recommendations / Hit Songs */}
      <div className="space-y-4 mb-6">
        <h3 className="px-2 text-[14px] font-black uppercase tracking-widest text-[color:var(--muted-foreground)]">
          {activeCategory === 'music' ? 'Hit Songs' : 'Suggested for you'}
        </h3>
        {loading ? (
           <div className="flex flex-col gap-4">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="flex gap-3 animate-pulse px-2">
                 <div className="w-[100px] h-[56px] bg-[color:var(--surface)]/10 rounded-lg shrink-0" />
                 <div className="flex-1 py-1 space-y-2">
                   <div className="h-3 bg-[color:var(--surface)]/10 rounded w-full" />
                   <div className="h-2 bg-[color:var(--surface)]/10 rounded w-2/3" />
                 </div>
               </div>
             ))}
           </div>
        ) : (
           <div className="flex flex-col gap-2">
             {aiRecommendations.map((video) => (
               <div
                 key={video.id}
                 onClick={() => handleItemClick(video, videos)}
                 className="flex gap-3 p-2 rounded-xl hover:bg-[color:var(--surface)]/10 border border-transparent hover:border-[color:var(--border)]/40 transition-all duration-200 cursor-pointer group"
               >
                 <div className="relative w-[56px] h-[56px] rounded-lg overflow-hidden shrink-0 shadow-lg">
                   <Image
                     src={activeCategory === 'music' ? MUSIC_CARD_THUMB : video.thumbnail}
                     alt={video.title}
                     fill
                     sizes="56px"
                     className="object-cover group-hover:scale-110 transition-transform duration-500"
                     unoptimized
                   />
                   <div className="absolute inset-0 bg-[color:var(--border)]/20 group-hover:bg-transparent transition-colors" />
                 </div>
                 <div className="flex-1 min-w-0 py-0.5">
                   <h4 className="text-xs font-bold text-[color:var(--foreground)] line-clamp-2 mb-1 leading-tight group-hover:text-[color:var(--foreground)]/90">{video.title}</h4>
                   <p className="text-[10px] text-[color:var(--muted-foreground)] font-bold uppercase tracking-wider truncate">{video.channelTitle || 'Artist'}</p>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
