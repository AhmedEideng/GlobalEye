import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://globaleye.live';

  // Categories
  const categories = [
    'world',
    'politics', 
    'business',
    'technology',
    'sports',
    'entertainment',
    'health',
    'science'
  ];

  const urls = categories.map(
    (category) => `
      <url>
        <loc>${baseUrl}/${category}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
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