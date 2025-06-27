import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

// أنواع الصور المسموحة
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];
// حجم أقصى للصورة (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
// صورة افتراضية (Base64 صغيرة)
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-size="24">Image not available</text></svg>';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return fallbackImageResponse();
  }

  try {
    // السماح فقط بروابط http/https
    if (!/^https?:\/\//.test(url)) {
      return fallbackImageResponse();
    }
    // استخراج الدومين من الرابط لإضافته كـ Referer
    let referer = '';
    try {
      const u = new URL(url);
      referer = u.origin;
    } catch {}
    // تمرير جميع الهيدرات الممكنة من الطلب الأصلي
    const incomingHeaders = req.headers;
    const headers: Record<string, string> = {};
    // قائمة الهيدرات التي لا يجب تمريرها
    const excluded = ['host', 'connection', 'content-length', 'content-type', 'accept-encoding', 'transfer-encoding', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'upgrade'];
    for (const [key, value] of incomingHeaders.entries()) {
      if (!excluded.includes(key.toLowerCase())) {
        headers[key] = value;
      }
    }
    // إضافة Referer إذا كان متوفرًا
    if (referer) {
      headers['Referer'] = referer;
    }
    // تأكيد وجود Accept وUser-Agent
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
    // تحقق من الحجم
    const contentLength = response.headers.has('content-length') ? response.headers.get('content-length') : null;
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      return fallbackImageResponse();
    }
    // إذا لم تتوفر content-length، نقرأ buffer ونقيس الحجم
    const imageBuffer = Buffer.from(new Uint8Array(await response.arrayBuffer()));
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return fallbackImageResponse();
    }

    // ضغط الصور (jpeg/png/webp فقط)
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
  } catch (err) {
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