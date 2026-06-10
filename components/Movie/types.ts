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
  description: string;
  duration?: string;
  ageRating?: string;
  rating?: number;
  director?: string;
  writer?: string;
  stars?: string;
  language?: string;
  subtitles?: string;
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
  onWatchNow: (movie: Movie) => void;
}

export interface MovieDetailSheetProps {
  movie: Movie;
  onClose: () => void;
  onWatchNow: (movie: Movie) => void;
}

export interface MoviePageState {
  selectedMovie: Movie;
  activeFilter: string;
  paywallMovie: Movie | null;
}
