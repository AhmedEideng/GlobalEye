import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Maximum image size (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
// Default image (small Base64)
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-size="24">Image not available</text></svg>';

// Rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Max 100 requests per minute

// Helper function to check rate limit
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitCache.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

// Helper function to validate URL
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && 
           (parsedUrl.hostname.includes('.') || parsedUrl.hostname === 'localhost');
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) {
      return fallbackImageResponse();
    }

    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    if (!checkRateLimit(clientIP)) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    // Validate URL
    if (!isValidImageUrl(url)) {
      return new NextResponse('Invalid image URL', { status: 400 });
    }

    // Extract domain from URL to add as Referer
    let referer = '';
    try {
      const u = new URL(url);
      referer = u.origin;
    } catch {
      return fallbackImageResponse();
    }

    // Pass all possible headers from the original request
    const incomingHeaders = req.headers;
    const headers: Record<string, string> = {};
    // List of headers that should not be passed
    const excluded = ['host', 'connection', 'content-length', 'content-type', 'accept-encoding', 'transfer-encoding', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'upgrade'];
    for (const [key, value] of incomingHeaders.entries()) {
      if (!excluded.includes(key.toLowerCase())) {
        headers[key] = value;
      }
    }
    // Add Referer if available
    if (referer) {
      headers['Referer'] = referer;
    }
    // Ensure Accept and User-Agent are present
    if (!headers['Accept']) headers['Accept'] = 'image/*,*/*;q=0.8';
    if (!headers['User-Agent']) headers['User-Agent'] = incomingHeaders.get('user-agent') || '';

    const response = await fetch(url, { 
      headers,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      return fallbackImageResponse();
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/') || !ALLOWED_TYPES.includes(contentType)) {
      return fallbackImageResponse();
    }
    
    // Check size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      return fallbackImageResponse();
    }
    
    // If content-length is not available, read buffer and measure size
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer: Buffer = Buffer.from(arrayBuffer);
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return fallbackImageResponse();
    }

    // Compress images (jpeg/png/webp only)
    let optimizedBuffer = imageBuffer;
    let outContentType = contentType;
    if (
      contentType === 'image/jpeg' ||
      contentType === 'image/png' ||
      contentType === 'image/webp'
    ) {
      try {
        optimizedBuffer = await sharp(imageBuffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .jpeg({ quality: 70 })
          .toBuffer();
        outContentType = 'image/jpeg';
      } catch (error) {
        // If optimization fails, use original buffer
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('Image optimization failed:', error);
        }
      }
    }

    const res = new NextResponse(optimizedBuffer, {
      status: 200,
      headers: {
        'Content-Type': outContentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
    return res;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Image proxy error:', error);
    }
    return fallbackImageResponse();
  }
}

function fallbackImageResponse() {
  return new NextResponse(Buffer.from(FALLBACK_IMAGE), {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
} 