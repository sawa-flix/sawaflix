/**
 * Utility to get localized content from multi-language Sanity fields
 */

type Locale = 'en' | 'fr';

interface LocalizedField {
  en?: string;
  fr?: string;
}

/**
 * Get the localized version of a field, with fallback to English
 */
export function getLocalizedField(field: LocalizedField | string | null | undefined, locale: Locale): string {
  // If field is already a string (old format), return it
  if (typeof field === 'string') return field;

  // If field is null or undefined, return empty string
  if (!field) return '';

  // Return the localized version, fallback to English, then empty string
  return field[locale] || field.en || '';
}

/**
 * Get localized array content (for rich text body)
 */
export function getLocalizedArray(field: any, locale: Locale): any[] {
  if (!field) return [];

  // If field is already an array (old format), return it
  if (Array.isArray(field)) return field;

  // Return the localized version, fallback to English, then empty array
  return field[locale] || field.en || [];
}

/**
 * Check if a field has content in the specified locale
 */
export function hasLocalizedContent(field: LocalizedField | string | null | undefined, locale: Locale): boolean {
  if (typeof field === 'string') return !!field;
  if (!field) return false;
  return !!field[locale];
}
