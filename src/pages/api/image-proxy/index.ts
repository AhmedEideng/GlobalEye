import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

async function fallbackImageResponse(res: NextApiResponse) {
  // Serve the placeholder image as a buffer
  const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-news.jpg');
  const imageBuffer = fs.readFileSync(placeholderPath);
  res.setHeader('Content-Type', 'image/jpeg');
  res.status(200).send(imageBuffer);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return fallbackImageResponse(res);
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return fallbackImageResponse(res);
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return fallbackImageResponse(res);
    }
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      return fallbackImageResponse(res);
    }
    const arrayBuffer = await response.arrayBuffer();
    const uint8Arr = new Uint8Array(arrayBuffer as ArrayBuffer);
    const imageBuffer = Buffer.from(uint8Arr.buffer, uint8Arr.byteOffset, uint8Arr.byteLength);
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return fallbackImageResponse(res);
    }
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
    res.setHeader('Content-Type', outContentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(optimizedBuffer);
  } catch {
    return fallbackImageResponse(res);
  }
} 