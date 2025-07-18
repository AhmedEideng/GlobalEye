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
 * Sanitize JSON data for safe rendering
 * @param data - The data to sanitize
 * @returns Sanitized JSON string
 */
export function sanitizeJson(data: unknown): string {
  try {
    // Deep sanitize the data
    const sanitizedData = sanitizeDataDeep(data);
    return JSON.stringify(sanitizedData);
  } catch (error) {
    // Return empty object if sanitization fails
    return '{}';
  }
}

/**
 * Deep sanitize data recursively
 * @param data - The data to sanitize
 * @returns Sanitized data
 */
function sanitizeDataDeep(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'string') {
    return sanitizeText(data);
  }
  
  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeDataDeep);
  }
  
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize the key as well
      const sanitizedKey = sanitizeText(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeDataDeep(value);
      }
    }
    return sanitized;
  }
  
  return String(data);
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