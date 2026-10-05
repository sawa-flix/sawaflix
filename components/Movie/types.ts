/**
 * Movie Types - Type-safe movie data structures
 */

export interface Movie {
  id: string;
  title: string;
  image: string;
  year: number;
  country: string;
  genres: string[];
  featured: boolean;
  isPremium?: boolean;
  description: string;
  duration?: string;
  ageRating?: string;
  rating?: number;
  director?: string;
  writer?: string;
  stars?: string;
  language?: string;
  subtitles?: string;
  seriesId?: string;
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  mediaKind?: 'movie' | 'series' | 'episode';
}

export interface MovieCardProps {
  movie: Movie;
  isPremium: boolean;
  onClick: () => void;
  isActive: boolean;
}

export interface RightSidebarContentProps {
  movie: Movie | null;
  onClose: () => void;
  moreMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  seriesEpisodes: Movie[];
  detailsHref: string;
}

export interface MovieDetailSheetProps {
  movie: Movie;
  seriesEpisodes: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onClose: () => void;
  onWatchNow: (movie: Movie) => void;
}

export interface MoviePageState {
  selectedMovie: Movie;
  activeFilter: string;
  paywallMovie: Movie | null;
}
