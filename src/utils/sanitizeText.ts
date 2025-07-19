/**
 * Comprehensive text sanitization to prevent React error #418 and other rendering issues
 * @param text - The text to sanitize
 * @returns Sanitized text safe for React rendering
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    // Remove all null bytes and control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/gu, '')
    // Remove non-printable characters except newlines, tabs, and spaces
    .replace(/[^\x20-\x7E\x0A\x09]/gu, '')
    // Remove any remaining problematic Unicode characters
    .replace(/[\uFFFE\uFFFF]/gu, '')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/gu, '')
    // Normalize whitespace
    .replace(/\s+/gu, ' ')
    // Remove any remaining special characters that could be dangerous
    .replace(/[^\w\s\-.,+*()[\]{}|&^%#@!?=:;"'\\]/gu, '')
    .trim();
}

/**
 * Ultra-secure JSON-LD sanitization for dangerouslySetInnerHTML
 * This function is specifically designed to prevent XSS attacks in JSON-LD scripts
 * @param data - The data to sanitize
 * @returns Sanitized JSON string safe for dangerouslySetInnerHTML
 */
export function sanitizeJsonLd(data: unknown): string {
  try {
    // Deep sanitize the data with extra security for JSON-LD
    const sanitizedData = sanitizeJsonLdDeep(data);
    const jsonString = JSON.stringify(sanitizedData);
    
    // Additional security layer: remove any potentially dangerous characters
    return jsonString
      // Remove all HTML/XML tags
      .replace(/<[^>]*>/gu, '')
      // Remove script tags and their content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/giu, '')
      // Remove event handlers
      .replace(/\bon\w+\s*=/giu, '')
      // Remove javascript: protocol
      .replace(/javascript:/giu, '')
      // Remove data: protocol
      .replace(/data:/giu, '')
      // Remove vbscript: protocol
      .replace(/vbscript:/giu, '')
      // Remove any remaining potentially dangerous characters
      .replace(/[<>]/gu, '')
      // Ensure proper JSON structure
      .replace(/,\s*\}/gu, '}')
      .replace(/,\s*\]/gu, ']');
  } catch {
    // Return safe empty object if sanitization fails
    return '{}';
  }
}

/**
 * Deep sanitize data for JSON-LD with extra security measures
 * @param data - The data to sanitize
 * @returns Sanitized data
 */
function sanitizeJsonLdDeep(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'string') {
    return sanitizeText(data)
      // Additional security for JSON-LD strings
      .replace(/[<>]/gu, '') // Remove angle brackets
      .replace(/javascript:/giu, '') // Remove javascript protocol
      .replace(/data:/giu, '') // Remove data protocol
      .replace(/vbscript:/giu, '') // Remove vbscript protocol
      .replace(/\bon\w+\s*=/giu, '') // Remove event handlers
      .substring(0, 1000); // Limit string length
  }
  
  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.slice(0, 100).map(sanitizeJsonLdDeep); // Limit array size
  }
  
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      if (count >= 50) break; // Limit object properties
      // Sanitize the key as well
      const sanitizedKey = sanitizeText(key)
        .replace(/[<>]/gu, '') // Remove angle brackets
        .replace(/javascript:/giu, '') // Remove javascript protocol
        .substring(0, 50); // Limit key length
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeJsonLdDeep(value);
        count++;
      }
    }
    return sanitized;
  }
  
  return String(data).substring(0, 100); // Limit length
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
    .replace(/[\x00-\x1F\x7F-\x9F]/gu, '')
    // Remove non-ASCII characters that might cause issues
    .replace(/[^\x00-\x7F]/gu, '')
    // Remove any remaining problematic Unicode characters
    .replace(/[\uFFFE\uFFFF]/gu, '')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/gu, '')
    // Normalize whitespace
    .replace(/\s+/gu, ' ')
    .trim();
}

/**
 * Sanitize JSON data for safe rendering (general purpose)
 * @param data - The data to sanitize
 * @returns Sanitized JSON string
 */
export function sanitizeJson(data: unknown): string {
  try {
    // Deep sanitize the data
    const sanitizedData = sanitizeDataDeep(data);
    return JSON.stringify(sanitizedData);
  } catch {
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
    .replace(/[\x00-\x1F\x7F-\x9F]/gu, '')
    // Remove any invalid SVG path characters (simplified)
    .replace(/[^\w\s\-.,+*()[\]{}|&^%#@!?=:;"'\\]/gu, '')
    // Clean up multiple spaces
    .replace(/\s+/gu, ' ')
    .trim();
}

/**
 * Sanitizes SVG content by cleaning path data and other attributes
 */
export function sanitizeSvgContent(svgContent: string): string {
  if (!svgContent) return '';
  
  return svgContent
    // Remove any non-printable characters
    .replace(/[\x00-\x1F\x7F-\x9F]/gu, '')
    // Clean up multiple spaces
    .replace(/\s+/gu, ' ')
    .trim();
} 