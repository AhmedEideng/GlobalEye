import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://globaleye.live';

  // Static pages
  const staticPages = [
    '',
    'about',
    'contact-us',
    'privacy',
    'terms-and-conditions',
  ];

  let urls = '';
  if (staticPages.length > 0) {
    urls = staticPages.map(
      (page) => `
        <url>
          <loc>${baseUrl}/${page}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>
      `
    ).join('');
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 