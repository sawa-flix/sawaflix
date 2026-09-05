/**
 * Music Types - Type-safe music and audio data structures
 */

export interface Track {
  id: string | number;
  title: string;
  artist: string;
  image: string;
  src: string;
  duration?: string;
}

export interface Video {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  videoUrl: string;
}

export interface MusicCategory {
  category: string;
  videos: Video[];
}

export interface MusicCardProps {
  track: Track;
  isPlaying: boolean;
  onClick: () => void;
}

export interface NowPlayingControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  isShuffled: boolean;
  onShuffleToggle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  onRepeatToggle: () => void;
}

export interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export interface MusicCategoryRowProps {
  category: MusicCategory;
  isPlaying: boolean;
  currentTrackId?: string | number;
  onTrackClick: (track: Track, playlist: Track[]) => void;
  onPlayPauseCurrentTrack: () => void;
}

export interface MusicPageState {
  musicCategories: MusicCategory[];
  isLoading: boolean;
  isFavorite: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isVideoMode: boolean;
}
