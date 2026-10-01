import type { Movie } from './types';
import { BACKEND_URL } from '@/lib/apiConfig';

export interface CuratedMovieDto {
  youtube_video_id: string;
  channel_title: string;
  title: string;
  description: string;
  thumbnail_url: string;
  embed_url: string;
  duration_seconds: number;
  published_at: string;
  genres: string[];
  language: string | null;
  is_featured: boolean;
  media_kind?: 'movie' | 'series' | 'episode';
  series_id?: string;
  series_title?: string;
  season_number?: number;
  episode_number?: number;
  episode_title?: string;
}

interface CuratedMovieResponse {
  success: boolean;
  movies?: CuratedMovieDto[];
  genres?: string[];
  error?: string;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function publicationYear(value: string): number {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
}

export function mapCuratedMovie(dto: CuratedMovieDto): Movie {
  const seasonEpisodePattern = dto.title.match(/^(.*?)\s+(?:S(\d{1,2})E(\d{1,2})|Season\s*(\d+)\s*Episode\s*(\d+))\s*[:.-]?\s*(.*)$/i);
  const namedEpisodePattern = dto.title.match(/^(.*?)\s*[([\s]*(?:Episode|Ep\.?\s*)\s*(\d+)\s*[)\]]?\s*[:.\-–]?\s*(.*)$/i);
  const explicitSeason = Number(dto.season_number) || undefined;
  const episodeNumber = Number(dto.episode_number)
    || (seasonEpisodePattern ? Number(seasonEpisodePattern[3] || seasonEpisodePattern[5]) : undefined)
    || (namedEpisodePattern ? Number(namedEpisodePattern[2]) : undefined);
  const seasonNumber = explicitSeason || (seasonEpisodePattern ? Number(seasonEpisodePattern[2] || seasonEpisodePattern[4]) : undefined);
  const genreMarksSeries = dto.genres?.some((genre) => /series/i.test(genre)) || false;
  const seriesTitle = dto.series_title || seasonEpisodePattern?.[1]?.trim() || namedEpisodePattern?.[1]?.trim() || (genreMarksSeries ? dto.title : undefined);
  const mediaKind = dto.media_kind || (episodeNumber ? 'episode' : seriesTitle ? 'series' : 'movie');

  return {
    id: dto.youtube_video_id,
    title: dto.title,
    image: dto.thumbnail_url,
    year: publicationYear(dto.published_at),
    country: 'Cameroon',
    genres: dto.genres?.length ? dto.genres : ['Drama'],
    featured: dto.is_featured,
    description: dto.description || 'Authentic Cameroonian movie streaming on SawaFlix.',
    duration: formatDuration(dto.duration_seconds),
    ageRating: '16+',
    rating: 4.8,
    director: dto.channel_title,
    writer: dto.channel_title,
    stars: dto.channel_title,
    language: dto.language || 'English / French',
    subtitles: 'English',
    seriesId: dto.series_id || (seriesTitle ? seriesTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined),
    seriesTitle,
    seasonNumber,
    episodeNumber,
    episodeTitle: dto.episode_title || seasonEpisodePattern?.[6]?.trim() || namedEpisodePattern?.[3]?.trim() || undefined,
    mediaKind,
  };
}

export async function fetchCuratedMovies(): Promise<Movie[]> {
  const response = await fetch(`${BACKEND_URL}/api/youtube/movies?limit=200`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 120 },
  });
  const result: CuratedMovieResponse = await response.json();
  if (!response.ok || !result.success || !result.movies) {
    throw new Error(result.error || 'Movie catalog is unavailable.');
  }
  return result.movies.map(mapCuratedMovie);
}
