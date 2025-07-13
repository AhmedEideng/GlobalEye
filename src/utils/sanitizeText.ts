/**
 * Comprehensive text sanitization to prevent React error #418 and other rendering issues
 * @param text - The text to sanitize
 * @returns Sanitized text safe for React rendering
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    // Remove all null bytes and control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Remove non-printable characters except newlines, tabs, and spaces
    .replace(/[^\x20-\x7E\x0A\x09]/g, '')
    // Remove any remaining problematic Unicode characters
    .replace(/[\uFFFE\uFFFF]/g, '')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove any remaining invalid characters
    .replace(/[^\w\s\-\.\,\+\-\*\/\(\)\[\]\{\}\|\&\^\%\#\@\!\?\<\>\=\:\;\"\'\\]/g, '')
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
    // Remove all null bytes and control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Remove non-ASCII characters that might cause issues
    .replace(/[^\x00-\x7F]/g, '')
    // Remove any remaining problematic Unicode characters
    .replace(/[\uFFFE\uFFFF]/g, '')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitizes JSON content for JSON-LD scripts
 * @param json - The JSON object to sanitize
 * @returns Sanitized JSON string safe for dangerouslySetInnerHTML
 */
export function sanitizeJson(json: Record<string, unknown>): string {
  if (!json) return '{}';
  
  try {
    // Convert to string and sanitize
    const jsonString = JSON.stringify(json);
    return jsonString
      // Remove all null bytes and control characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      // Remove non-ASCII characters
      .replace(/[^\x00-\x7F]/g, '')
      // Remove any remaining problematic Unicode characters
      .replace(/[\uFFFE\uFFFF]/g, '')
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    // Return empty object if JSON stringify fails
    return '{}';
  }
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