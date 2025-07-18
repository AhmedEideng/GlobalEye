/**
 * Cleans an image URL by ensuring it has a protocol (https) if missing.
 * @param url - The image URL (may be null)
 * @returns The cleaned image URL or null if input is null
 */
export function cleanImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  return url;
} 