export interface MovieProgressEntry {
  movieId: string;
  currentTime: number;
  duration: number;
  updatedAt: number;
}

const STORAGE_KEY = 'sawaflix:movie-progress:v1';
const PROGRESS_EVENT = 'sawaflix:movie-progress-updated';
const MIN_RESUME_SECONDS = 5;
const COMPLETION_BUFFER_SECONDS = 15;

function readAll(): Record<string, MovieProgressEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as Record<string, MovieProgressEntry> : {};
  } catch {
    return {};
  }
}

function notifyProgressChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PROGRESS_EVENT));
}

export function getMovieProgress(movieId: string): MovieProgressEntry | null {
  const entry = readAll()[movieId];
  return entry && entry.currentTime >= MIN_RESUME_SECONDS ? entry : null;
}

export function getLastMovieProgress(): MovieProgressEntry | null {
  const entries = Object.values(readAll())
    .filter((entry) => entry.currentTime >= MIN_RESUME_SECONDS)
    .sort((left, right) => right.updatedAt - left.updatedAt);
  return entries[0] || null;
}

export function saveMovieProgress(movieId: string, currentTime: number, duration: number): void {
  if (typeof window === 'undefined' || !movieId || !Number.isFinite(currentTime)) return;
  const entries = readAll();
  if (currentTime < MIN_RESUME_SECONDS || (duration > 0 && currentTime >= duration - COMPLETION_BUFFER_SECONDS)) {
    delete entries[movieId];
  } else {
    entries[movieId] = { movieId, currentTime, duration, updatedAt: Date.now() };
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    notifyProgressChanged();
  } catch {
    // Playback continues when storage is unavailable or full.
  }
}

export function clearMovieProgress(movieId: string): void {
  if (typeof window === 'undefined') return;
  const entries = readAll();
  delete entries[movieId];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    notifyProgressChanged();
  } catch {
    // Ignore unavailable storage.
  }
}

export const MOVIE_PROGRESS_EVENT = PROGRESS_EVENT;

export function formatMovieTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${minutes}:${String(remainder).padStart(2, '0')}`;
}
