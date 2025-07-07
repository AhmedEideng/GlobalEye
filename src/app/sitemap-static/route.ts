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

  const urls = staticPages.map(
    (page) => `
      <url>
        <loc>${baseUrl}/${page}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
    `
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.join('')}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 