/**
 * Sanitizes text content to prevent React error #418 and other rendering issues
 * @param text - The text to sanitize
 * @returns Sanitized text safe for React rendering
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    // Remove null bytes and other control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove non-printable characters except newlines and tabs
    .replace(/[^\x20-\x7E\x0A\x09]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitizes HTML content for dangerouslySetInnerHTML
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML safe for dangerouslySetInnerHTML
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  return html
    // Remove null bytes and control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove non-ASCII characters that might cause issues
    .replace(/[^\x00-\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
} 

/**
 * Sanitizes SVG path data by removing invalid characters that cause SVG parsing errors
 */
export function sanitizeSvgPath(pathData: string): string {
  if (!pathData) return '';
  
  return pathData
    // Remove any non-printable characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Remove any invalid SVG path characters
    .replace(/[^\w\s\-\.\,\+\-\*\/\(\)\[\]\{\}\|\&\^\%\#\@\!\?\<\>\=\:\;\"\'\\]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitizes SVG content by cleaning path data and other attributes
 */
export function sanitizeSvgContent(svgContent: string): string {
  if (!svgContent) return '';
  
  return svgContent
    // Remove any non-printable characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
} 