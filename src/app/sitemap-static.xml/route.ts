import { NextResponse } from 'next/server';
import { readdirSync, statSync } from 'fs';
import path from 'path';

export async function GET() {
  const baseUrl = 'https://globaleye.live';
  // List of static directories to always include
  const alwaysInclude = [
    '', // Home
    'about',
    'privacy',
    'terms-and-conditions',
    'contact-us',
    'login',
    'favorites',
    'profile',
    'search',
  ];
  // Dynamically find other static directories in app/
  const appDir = path.resolve(process.cwd(), 'src/app');
  let staticDirs: string[] = [];
  try {
    staticDirs = readdirSync(appDir)
      .filter(
        (name) =>
          statSync(path.join(appDir, name)).isDirectory() &&
          !name.startsWith('api') &&
          !name.startsWith('sitemap') &&
          name !== '[category]' &&
          name !== 'article' &&
          name !== 'test' &&
          name !== 'admin'
      );
  } catch {}
  const allPaths = Array.from(new Set([...alwaysInclude, ...staticDirs]));
  const urls = allPaths
    .map((p) => `<url><loc>${baseUrl}/${p}</loc></url>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 