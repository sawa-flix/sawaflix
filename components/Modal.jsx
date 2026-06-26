import React, { useState, useEffect } from 'react';
import { X, Star, Play, Plus, Loader2, Calendar, Volume2, Globe, Users } from 'lucide-react';
import { YouTubePlayer } from './YoutubePlayer';
import { playbackService, PlaybackResponse } from '@/services/playbackService';
import { PremiumPaywall } from './PremiumPaywall';

const Modal = ({ isOpen, onClose, movie, type = 'info' }) => {
  const [playbackInfo, setPlaybackInfo] = useState(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && type === 'play' && movie?.id) {
      const fetchPlayback = async () => {
        setIsLoading(true);
        try {
          const fallback = movie.videoUrl || `https://www.youtube.com/watch?v=${movie.id}`;
          const info = await playbackService.getPlaybackSource(movie.id, fallback);
          setPlaybackInfo(info);
        } catch (err) {
          console.error('[Modal Playback] Error:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPlayback();
    }
  }, [isOpen, type, movie?.id, movie?.videoUrl]);

  const handleUnlock = async (method) => {
    try {
      const info = await playbackService.verifyPayment(movie.id, `sim-${Date.now()}`);
      setPlaybackInfo(info);
      setIsPaywallOpen(false);
    } catch (err) {
      console.error('Unlock failed:', err);
    }
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end md:items-center justify-center z-50 md:p-4">
      {/* Mobile: Bottom Sheet, Desktop: Centered Modal */}
      <div className="bg-[#0F1117] rounded-t-3xl md:rounded-3xl w-full max-w-4xl max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-t md:border border-white/10 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300 relative">
        
        {/* Mobile Pull Indicator */}
        <div className="w-full flex justify-center md:hidden pt-3 pb-1 bg-gradient-to-b from-black/20 to-transparent absolute top-0 z-30">
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>

        <div className="overflow-y-auto flex-1 w-full relative">
          <div className="relative h-48 md:h-64 bg-black shrink-0 w-full">
            {type === 'play' ? (
              <div className="relative w-full h-full">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                  </div>
                ) : (
                  <YouTubePlayer 
                    videoId={movie.id}
                    isActive={isOpen}
                    isMuted={false}
                    restriction={playbackInfo?.restriction}
                    onRestrictionReached={() => setIsPaywallOpen(true)}
                  />
                )}
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img 
                  src={movie.image} 
                  alt={movie.title}
                  className="w-full h-full object-cover opacity-80"
                />
                {/* Overlay Play Button on Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600/90 rounded-full p-4 md:p-5 shadow-lg shadow-red-600/30 backdrop-blur-sm">
                    <Play size={28} className="text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/20 z-20"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 md:p-8">
            <h2 className="text-white text-2xl md:text-3xl font-black mb-3">{movie.title}</h2>
            
            <div className="flex items-center space-x-3 text-sm text-gray-400 mb-4">
              <div className="flex items-center bg-[#1F222A] px-2 py-1 rounded-md">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1.5" />
                <span className="text-white font-bold">{movie.rating || '4.0'}</span>
              </div>
              <span>•</span>
              <span className="text-gray-300">{movie.release_date || '2023'}</span>
              <span>•</span>
              <span className="bg-[#1F222A] px-2 py-0.5 rounded text-xs font-bold text-gray-300">{movie.age_rating || '13+'}</span>
            </div>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">{movie.plot_summary || movie.description}</p>

            {/* 2x2 Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Card 1: Year */}
              <div className="bg-[#1a1d24] p-4 rounded-2xl flex flex-col justify-between">
                <Calendar className="text-gray-400 mb-2" size={20} />
                <div>
                  <div className="text-gray-500 text-xs mb-1 font-medium">Year</div>
                  <div className="text-white font-bold text-sm">{movie.release_date || '2023'}</div>
                </div>
              </div>
              {/* Card 2: Duration */}
              <div className="bg-[#1a1d24] p-4 rounded-2xl flex flex-col justify-between">
                <Volume2 className="text-gray-400 mb-2" size={20} />
                <div>
                  <div className="text-gray-500 text-xs mb-1 font-medium">Duration</div>
                  <div className="text-white font-bold text-sm">{movie.duration_minutes ? `${movie.duration_minutes} min` : '1h 50m'}</div>
                </div>
              </div>
              {/* Card 3: Country */}
              <div className="bg-[#1a1d24] p-4 rounded-2xl flex flex-col justify-between">
                <Globe className="text-gray-400 mb-2" size={20} />
                <div>
                  <div className="text-gray-500 text-xs mb-1 font-medium">Country</div>
                  <div className="text-white font-bold text-sm">{movie.country || 'Cameroon'}</div>
                </div>
              </div>
              {/* Card 4: Rating */}
              <div className="bg-[#1a1d24] p-4 rounded-2xl flex flex-col justify-between">
                <Users className="text-gray-400 mb-2" size={20} />
                <div>
                  <div className="text-gray-500 text-xs mb-1 font-medium">Rating</div>
                  <div className="text-white font-bold text-sm">{movie.age_rating || '13+'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Watch Now Button - Now isolated outside the scrolling container */}
        <div className="w-full p-4 bg-[#0F1117] border-t border-white/5 shrink-0 z-20">
          <button className="w-full bg-[#E50914] hover:bg-red-700 text-white py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all font-bold active:scale-95 shadow-lg">
            <Play size={20} fill="currentColor" />
            <span>Watch Now</span>
          </button>
        </div>

      </div>

      <PremiumPaywall 
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        movie={movie}
        limitSeconds={playbackInfo?.restriction?.limitSeconds || 0}
        onUnlockSuccess={handleUnlock}
      />
    </div>
  );
};

export default Modal;