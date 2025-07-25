/**
 * Comprehensive text sanitization to prevent React error #418 and other rendering issues
 * @param text - The text to sanitize
 * @returns Sanitized text safe for React rendering
 */
const CONTROL_CHARS_REGEX = /[\u007F-\u009F]/gu;
const SAFE_PRINTABLE_REGEX = /[^\u0020-\u007E\n\t]/gu;
const UNICODE_SPECIAL_REGEX = /[\uFFFE\uFFFF]/gu;
const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF]/gu;
const MULTI_SPACE_REGEX = /\s+/gu;
const STRICT_SAFE_REGEX = /[^\w\s\-.,+*()[\]{}|&^%#@!?=:;"'\\]/gu;

export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    // Remove all null bytes and control characters (prevents invisible/invalid chars)
    .replace(CONTROL_CHARS_REGEX, '')
    // Remove non-printable characters except newlines, tabs, and spaces (for safe rendering)
    .replace(SAFE_PRINTABLE_REGEX, '')
    // Remove any remaining problematic Unicode characters (rare, but can break rendering)
    .replace(UNICODE_SPECIAL_REGEX, '')
    // Remove zero-width characters (can be used for obfuscation)
    .replace(ZERO_WIDTH_REGEX, '')
    // Normalize whitespace (prevents layout issues)
    .replace(MULTI_SPACE_REGEX, ' ')
    // Remove any remaining special characters that could be dangerous (XSS, injection, etc.)
    // This regex is intentionally strict for security reasons
    .replace(STRICT_SAFE_REGEX, '')
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