/**
 * Music Utilities - Helper functions for music operations
 */

/**
 * Normalizes YouTube URLs to standard format
 */
export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return url;
};

/**
 * Formats seconds to MM:SS format
 */
export const formatTime = (seconds: number | undefined): string => {
  if (isNaN(seconds ?? 0) || seconds === 0) return '0:00';
  const mins = Math.floor((seconds ?? 0) / 60);
  const secs = Math.floor((seconds ?? 0) % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Repeat mode progression
 */
export const getNextRepeatMode = (
  currentMode: 'off' | 'all' | 'one'
): 'off' | 'all' | 'one' => {
  const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
  const currentIndex = modes.indexOf(currentMode);
  return modes[(currentIndex + 1) % modes.length];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
