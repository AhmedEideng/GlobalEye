import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Maximum image size (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
// Default image (small Base64)
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-size="24">Image not available</text></svg>';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return fallbackImageResponse();
  }

  // السماح فقط بروابط https
  if (!/^https:\/\//.test(url)) {
    return new NextResponse('Only https image URLs are allowed.', { status: 400 });
  }

  // Remove domain whitelist check

  try {
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
    const response = await fetch(url, { headers });
    if (!response.ok) {
      return fallbackImageResponse();
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return fallbackImageResponse();
    }
    // Check size
    const contentLength = response.headers.has('content-length') ? response.headers.get('content-length') : null;
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      return fallbackImageResponse();
    }
    // If content-length is not available, read buffer and measure size
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer: Buffer = Buffer.from(arrayBuffer); // تحويل مباشر من ArrayBuffer إلى Buffer
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
      optimizedBuffer = await sharp(imageBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();
      outContentType = 'image/jpeg';
    }

    const res = new NextResponse(optimizedBuffer, {
      status: 200,
      headers: {
        'Content-Type': outContentType,
        // Cache for 1 day (adjust as needed)
        'Cache-Control': 'public, max-age=86400',
      },
    });
    return res;
  } catch {
    return fallbackImageResponse();
  }
}

function fallbackImageResponse() {
  return new NextResponse(Buffer.from(FALLBACK_IMAGE), {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=600',
    },
  });
} 