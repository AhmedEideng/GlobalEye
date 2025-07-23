/**
 * Cleans an image URL by ensuring it has a protocol (https) if missing.
 * @param url - The image URL (may be null)
 * @returns The cleaned image URL or null if input is null
 */
export function cleanImageUrl(url: string | null): string | null {
  if (!url) return null;
  
  // Remove whitespace
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;
  
  // Handle protocol-relative URLs
  if (trimmedUrl.startsWith('//')) {
    return 'https:' + trimmedUrl;
  }
  
  // Handle relative URLs (should not happen with external APIs, but just in case)
  if (trimmedUrl.startsWith('/')) {
    return null; // We don't want to handle relative URLs
  }
  
  // Ensure URL has a protocol
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return 'https://' + trimmedUrl;
  }
  
  return trimmedUrl;
} 